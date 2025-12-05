import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase';
import { signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import {
    collection,
    addDoc, query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc
} from 'firebase/firestore';

// --- 1. ICONS ---
const PlusIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6-6m-6 6l-6-6M9 9h6" />
    </svg>
);
const NewChatIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);
const SendIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);
const DatabaseIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 10l-2-2m2 2l-2 2m2-2h-8m-4 0v4m0 0v4m0-4h-4m4 0h4m-4-4v-4m0 4h4" />
    </svg>
);
const BotIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM9 15a.75.75 0 01.721.544l.195.682a1.125 1.125 0 00.773.773l.682.195a.75.75 0 010 1.442l-.682.195a1.125 1.125 0 00-.773.773l-.195.682a.75.75 0 01-1.442 0l-.195-.682a1.125 1.125 0 00-.773-.773l-.682-.195a.75.75 0 010-1.442l.682-.195a1.125 1.125 0 00.773-.773l.195-.682A.75.75 0 019 15z" clipRule="evenodd" />
    </svg>
);
const UserIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
    </svg>
);
const SparkleIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.484-.53l4.5 1.05a.75.75 0 01.372.484l1.05 4.5a.75.75 0 01-.53.484l-4.5 1.05a.75.75 0 01-.484-.372L9.528 1.718zM14.232 5.53l-2.071-.483a.75.75 0 01-.484-.372L11 3.53l.327-1.4a.75.75 0 01.484-.53l2.071-.483a.75.75 0 01.53.372l.483 2.071a.75.75 0 01-.372.484l-1.05 4.5a.75.75 0 01-.484.372l-4.5 1.05a.75.75 0 01-.53-.372l-.483-2.071a.75.75 0 01.372-.484l1.05-4.5a.75.75 0 01.484-.372zM12 12a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM12 12a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM12 12a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" clipRule="evenodd" />
    </svg>
);
const MicIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8.25 10.875a1.125 1.125 0 112.25 0v3a1.125 1.125 0 11-2.25 0v-3z" />
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 17.5a7.75 7.75 0 006.915-11.53l.77-.377a.75.75 0 11.69 1.28l-.77.377a9.25 9.25 0 01-16.53 0l-.77-.377a.75.75 0 01.69-1.28l.77.377A7.75 7.75 0 0012 19.75z" clipRule="evenodd" />
        <path d="M12 16.5a4.5 4.5 0 01-4.223-2.924l.004-.007a.75.75 0 011.085-.735l.004-.007A3 3 0 0012 13.5a3 3 0 002.13-.974l.004.007a.75.75 0 011.085.735l.004.007A4.5 4.5 0 0112 16.5z" />
    </svg>
);
const AlertIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M2.515 10.672C1.298 10.978 1.1 11.758 1.1 12c0 .242.198 1.022 1.415 1.328 1.096.275 2.585.992 4.14 2.37.562.502 1.137 1.124 1.761 1.95 2.33 3.09 4.304 4.558 6.584 4.558s4.254-1.468 6.584-4.558c.624-.826 1.199-1.448 1.761-1.95 1.555-1.378 3.044-2.095 4.14-2.37C22.9 12.758 22.9 12.242 22.9 12c0-.242-.198-1.022-1.415-1.328-1.096-.275-2.585-.992-4.14-2.37-.562-.502-1.137-1.124-1.761-1.95-2.33-3.09-4.304-4.558-6.584-4.558s-4.254 1.468-6.584 4.558c-.624.826-1.199 1.448-1.761 1.95-1.555 1.378-3.044 2.095-4.14 2.37zM12 17.5a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 001-1v-4a1 1 0 10-2 0v4a1 1 0 001 1z" clipRule="evenodd" />
    </svg>
);
const ResultIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
const CodeIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 18" />
    </svg>
);
const ChatBubbleIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
);

// --- Helper to safely render text content (Fixes "Objects are not valid" error) ---
const renderSafeContent = (content) => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object') {
        // If it's an object (like {nlSummary: ...}), try to return the summary property or stringify
        return content.nlSummary || JSON.stringify(content);
    }
    return '';
};

// --- Sub-components (Defined BEFORE App to fix ReferenceError) ---

const SqlPreview = ({ sql }) => (
    <div className="bg-[#1e293b]/80 backdrop-blur-sm p-4 rounded-xl shadow-lg mt-3 border border-indigo-500/30 font-mono group hover:border-indigo-400/50 transition-all">
        <h3 className="text-[10px] font-bold text-indigo-300 mb-2 flex items-center uppercase tracking-widest">
            <CodeIcon className="w-3 h-3 mr-2" />
            Generated SQL
        </h3>
        <div className="overflow-x-auto custom-scrollbar">
            <code className="text-xs text-cyan-300 whitespace-pre-wrap break-words">
                {sql}
            </code>
        </div>
    </div>
);

const QueryResultTable = ({ results, originalQuery, onGenerateReport }) => {
    if (!results || !results.headers) return null;

    return (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl shadow-xl overflow-hidden mt-4 backdrop-blur-md group relative">
            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center">
                    <ResultIcon className="w-4 h-4 mr-2 text-emerald-400" />
                    <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Data Preview</h3>
                </div>
                <button
                    onClick={() => onGenerateReport(results, originalQuery)}
                    className="text-[9px] flex items-center bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30 transition-all"
                >
                    <SparkleIcon className="w-3 h-3 mr-1" /> Generate Report
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700/50">
                    <thead className="bg-slate-800/50">
                        <tr>
                            {results.headers.map((header, index) => (
                                <th key={index} className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                    {header.replace(/_/g, ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {results.data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-indigo-900/20 transition-colors">
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-4 py-3 whitespace-nowrap text-xs text-slate-300 border-r border-slate-800 last:border-0">
                                        {String(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SchemaReviewCard = ({ reviewData }) => {
    const { review_summary, issues } = reviewData;
    return (
        <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-xl shadow-sm mt-3 backdrop-blur-sm">
            <h3 className="text-xs font-bold text-amber-400 flex items-center mb-2 uppercase tracking-widest">
                <AlertIcon className="w-4 h-4 mr-2" />
                Data Health Check
            </h3>
            <p className="text-xs text-slate-300 mb-4 italic leading-relaxed">{renderSafeContent(review_summary)}</p>
            <div className="space-y-3">
                {issues.map((item, index) => (
                    <div key={index} className="bg-slate-900/50 p-3 rounded-lg border border-amber-500/20">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-red-400 uppercase">Issue Detected</span>
                            <span className="text-xs text-slate-400 mb-2">{renderSafeContent(item.issue)}</span>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase">Recommended Fix</span>
                            <span className="text-xs text-slate-400">{renderSafeContent(item.recommendation)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SuggestionsBox = ({ suggestions, isLoading, dbName, setNlQuery, handleSuggestAnalysis }) => {
    if (suggestions.length === 0 && !isLoading && dbName) {
        return (
            <div className="mt-auto p-4">
                <button
                    onClick={handleSuggestAnalysis}
                    className="w-full flex items-center justify-center px-4 py-3 text-xs font-semibold rounded-xl text-cyan-300 bg-cyan-950/30 hover:bg-cyan-900/50 border border-cyan-800/50 transition-all shadow-lg shadow-cyan-900/20"
                >
                    <SparkleIcon className="w-4 h-4 mr-2 animate-pulse" />
                    Inspire Analysis
                </button>
            </div>
        )
    }
    if (suggestions.length > 0) {
        return (
            <div className="mt-auto px-4 pb-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-widest">AI Suggestions</p>
                {suggestions.map((q, index) => (
                    <button
                        key={index}
                        onClick={() => { setNlQuery(q); }}
                        className="w-full text-left p-3 bg-slate-800/50 hover:bg-indigo-900/30 border border-slate-700 hover:border-indigo-500/50 rounded-xl text-xs text-slate-300 transition-all shadow-sm flex items-start group"
                    >
                        <SparkleIcon className="w-3 h-3 mr-2 text-slate-500 group-hover:text-indigo-400 mt-0.5" />
                        {q}
                    </button>
                ))}
            </div>
        );
    }
    return null;
};

const ConversationView = ({ conversation, onGenerateReport }) => {
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    if (conversation.length === 0) {
        return <div className="text-center text-slate-600 mt-20 text-sm">Start a new conversation...</div>
    }

    return (
        <div className="flex flex-col space-y-6 pb-4">
            {conversation.map((message, index) => {
                const isUser = message.role === 'user';
                const isSystem = message.role === 'system';

                // Safety check for content
                const summary = renderSafeContent(message.content.nlSummary || message.content);

                if (isSystem) return <div key={index} className="text-center text-[10px] text-slate-500 uppercase tracking-widest my-4">{summary}</div>;

                return (
                    <div key={index} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[90%] md:max-w-2xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 shadow-lg shadow-indigo-900/20 ${isUser ? 'bg-gradient-to-br from-indigo-500 to-purple-600 ml-3' : 'bg-gradient-to-br from-cyan-500 to-blue-600 mr-3'}`}>
                                {isUser ? <UserIcon className="w-4 h-4 text-white" /> : <BotIcon className="w-4 h-4 text-white" />}
                            </div>

                            <div className={`flex flex-col p-5 rounded-2xl shadow-xl text-sm backdrop-blur-md border ${isUser
                                ? 'bg-indigo-600/90 text-white rounded-tr-none border-indigo-500'
                                : 'bg-slate-800/80 text-slate-200 border-slate-700/50 rounded-tl-none'
                                }`}>
                                {isUser && <p className="whitespace-pre-wrap leading-relaxed tracking-wide">{summary}</p>}

                                {!isUser && (
                                    <div className="space-y-3">
                                        {message.type === 'schema_review' ? (
                                            <SchemaReviewCard reviewData={message.content} />
                                        ) : (
                                            <>
                                                {message.content?.nlSummary && (
                                                    <p className="whitespace-pre-wrap leading-relaxed tracking-wide">{renderSafeContent(message.content.nlSummary)}</p>
                                                )}
                                                {message.content?.sql && <SqlPreview sql={message.content.sql} />}
                                                {message.content?.results && <QueryResultTable results={message.content.results} originalQuery={summary} onGenerateReport={onGenerateReport} />}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={chatEndRef} />
        </div>
    );
};

// --- Main ChatInterface Component ---

const ChatInterface = () => {
    const [dbName, setDbName] = useState(null);
    const [nlQuery, setNlQuery] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [authInstance, setAuthInstance] = useState(null);
    const [userId, setUserId] = useState(null);
    const [firestoreDb, setFirestoreDb] = useState(null);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [isListening, setIsListening] = useState(false);

    // Data Context for Gemini (Lite-RAG)
    const [csvSchema, setCsvSchema] = useState('');
    const [csvContext, setCsvContext] = useState('');

    // Session Management
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);

    const fileInputRef = useRef(null);

    const GEMINI_API_KEY = "AIzaSyDQKwW1k-F18PPa-fkJb_DbAMjvWEi7Dig";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

    // FIX: Sanitize APP_ID by replacing slashes/non-alphanumerics to prevent invalid path segments
    const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app';
    const APP_ID = rawAppId.replace(/[^a-zA-Z0-9_]/g, '_');

    // --- Initialization & Auth ---
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Use the centralized firebase config from firebase.js
                setAuthInstance(auth);
                setFirestoreDb(db);

                // Check for custom auth token from environment
                const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    // await signInAnonymously(auth);
                    // Note: Anonymous sign-in is handled in Login.jsx or we assume user is already signed in here
                }
            } catch (e) {
                console.error("Firebase Authentication Error:", e);
                setError("Failed to authenticate with Firebase. Please check your configuration.");
            }
        };
        initializeAuth();
    }, []);

    // --- Session & Chat Logic ---

    // 1. Listen for Auth -> Load Sessions
    useEffect(() => {
        if (!authInstance || !firestoreDb) return;

        const unsubscribeAuth = authInstance.onAuthStateChanged((user) => {
            if (user) {
                setUserId(user.uid);

                // Subscribe to Sessions List
                const q = query(
                    collection(firestoreDb, 'artifacts', APP_ID, 'users', user.uid, 'chat_sessions')
                );

                const unsubscribeSessions = onSnapshot(q, (snapshot) => {
                    const sessList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    // Client-side sort (Newest first)
                    sessList.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

                    setSessions(sessList);

                    // If no session selected yet, pick latest
                    if (!currentSessionId && sessList.length > 0) {
                        // Load most recent session
                        setCurrentSessionId(sessList[0].id);
                        setDbName(sessList[0].dbName || null);
                        setCsvSchema(sessList[0].schema || '');
                        setCsvContext(sessList[0].context || '');
                    } else if (!currentSessionId && sessList.length === 0) {
                        // No sessions exist, create the first one
                        createNewSession(user.uid, firestoreDb);
                    }
                });

                return () => unsubscribeSessions();
            }
        });

        return () => unsubscribeAuth();
    }, [authInstance, firestoreDb]);

    // 2. Listen for Messages in Current Session
    useEffect(() => {
        if (!firestoreDb || !userId || !currentSessionId) return;

        // Simple query to avoid index errors
        const q = query(
            collection(firestoreDb, 'artifacts', APP_ID, 'users', userId, 'chat_messages'),
            where('sessionId', '==', currentSessionId)
        );

        const unsubscribeMsgs = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                // FIX: Parse stringified results
                if (data.content && data.content.results && typeof data.content.results === 'string') {
                    try {
                        data.content.results = JSON.parse(data.content.results);
                    } catch (e) {
                        console.error("Failed to parse results:", e);
                    }
                }
                return data;
            });

            // Client-side sorting
            msgs.sort((a, b) => {
                const tA = a.createdAt?.toMillis() || Date.now();
                const tB = b.createdAt?.toMillis() || Date.now();
                return tA - tB; // Oldest first
            });

            setConversation(msgs);

            // Sync session metadata locally if switching chats
            const activeSess = sessions.find(s => s.id === currentSessionId);
            if (activeSess) {
                // Only update if changed to prevent loops
                if (activeSess.dbName && dbName !== activeSess.dbName) setDbName(activeSess.dbName);
                if (activeSess.schema && csvSchema !== activeSess.schema) setCsvSchema(activeSess.schema);
                if (activeSess.context && csvContext !== activeSess.context) setCsvContext(activeSess.context);
            }
        });

        return () => unsubscribeMsgs();
    }, [firestoreDb, userId, currentSessionId, sessions]);


    // --- Helper: Create Session ---
    const createNewSession = async (uid, db, datasetName = null, schema = '', context = '') => {
        const sessionData = {
            createdAt: serverTimestamp(),
            title: 'New Conversation',
            dbName: datasetName,
            schema: schema,
            context: context
        };

        // Immediate UI update
        setConversation([]);
        setSuggestions([]);
        setIsLoading(true);

        try {
            const docRef = await addDoc(collection(db, 'artifacts', APP_ID, 'users', uid, 'chat_sessions'), sessionData);
            setCurrentSessionId(docRef.id);

            await addDoc(collection(db, 'artifacts', APP_ID, 'users', uid, 'chat_messages'), {
                sessionId: docRef.id,
                role: 'ai',
                content: { nlSummary: "Greetings! I'm VSAV AI. I'm ready to analyze your data." },
                createdAt: serverTimestamp()
            });

        } catch (e) {
            console.error("Error creating session", e);
        } finally {
            setIsLoading(false);
        }
    };

    const [debugStatus, setDebugStatus] = useState('Init...');

    // --- Helper: Save Message ---
    const saveMessage = async (role, content, type = 'text') => {
    setDebugStatus(`Saving [${role}]...`);
    console.log(`Attempting to save message [${role}]:`, content);

    if (!firestoreDb || !userId || !currentSessionId) {
        const msg = `Missing deps: DB=${!!firestoreDb}, UID=${userId}, Sess=${currentSessionId}`;
        console.error("saveMessage aborted:", msg);
        setDebugStatus(msg);
        return;
    }

    try {
        const contentToSave = { ...content };
        if (contentToSave.results) {
            contentToSave.results = JSON.stringify(contentToSave.results);
        }

        const docRef = await addDoc(
            collection(firestoreDb, 'artifacts', APP_ID, 'users', userId, 'chat_messages'),
            {
                sessionId: currentSessionId,
                role,
                content: contentToSave,
                type,
                createdAt: serverTimestamp()
            }
        );
        console.log("Message saved successfully, ID:", docRef.id);
        setDebugStatus(`Saved: ${docRef.id}`);

        if (role === 'user') {
            const sessionRef = doc(
                firestoreDb,
                'artifacts',
                APP_ID,
                'users',
                userId,
                'chat_sessions',
                currentSessionId
            );

            const currentSess = sessions.find(s => s.id === currentSessionId);

            if (currentSess && currentSess.title === 'New Conversation') {
                const text = content.nlSummary || '';
                const newTitle =
                    text.length > 30 ? text.substring(0, 30) + '...' : text;

                await updateDoc(sessionRef, { title: newTitle });
            }
        }
    } catch (e) {
        console.error("Error saving message:", e);
        setDebugStatus(`Error: ${e.message}`);
        setError(`Save failed: ${e.message}`);
    }
};


    const callGeminiApi = async (payload, retries = 3) => {
        console.log('🔍 Calling Gemini API with payload:', payload);
        console.log('🔑 Using API Key:', GEMINI_API_KEY);

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                console.log(`📡 API Response Status: ${response.status}`);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ API Error Response:', errorText);

                    if (response.status === 429 && i < retries - 1) {
                        console.log(`⏳ Rate limited, retrying in ${Math.pow(2, i)} seconds...`);
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                        continue;
                    }
                    throw new Error(`API call failed with status: ${response.status}, Details: ${errorText}`);
                }

                const result = await response.json();
                console.log('✅ API Result:', result);

                const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!jsonText) {
                    console.error('❌ Invalid response structure:', result);
                    throw new Error("Invalid response structure from Gemini API.");
                }

                const parsed = JSON.parse(jsonText);
                console.log('✅ Parsed Response:', parsed);
                return parsed;
            } catch (e) {
                console.error(`❌ Error on attempt ${i + 1}:`, e);
                if (i === retries - 1) throw new Error(`Gemini API Error: ${e.message}`);
            }
        }
    };

    // --- Speech Input ---
    const handleSpeechInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        if (isLoading || isListening) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError("Listening...");
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setNlQuery(prev => (prev ? prev + " " + transcript : transcript)); // Append text
            setIsListening(false);
            setError(null);
        };
        recognition.onerror = (event) => {
            setIsListening(false);
            if (event.error === 'network') {
                setError("Network error: Check your internet connection.");
            } else if (event.error === 'not-allowed') {
                setError("Microphone access denied.");
            } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
                setError(`Speech error: ${event.error}`);
            }
        };
        recognition.onend = () => setIsListening(false);

        try {
            recognition.start();
        } catch (e) {
            console.error("Speech Start Error", e);
        }
    };

    // --- New Chat Action ---
    const handleNewChat = async () => {
        if (!userId || !firestoreDb) return;
        await createNewSession(userId, firestoreDb, dbName, csvSchema, csvContext);
    };

    const switchSession = (sessId, sessDbName, sessSchema, sessContext) => {
        setCurrentSessionId(sessId);
        setDbName(sessDbName || null);
        setCsvSchema(sessSchema || '');
        setCsvContext(sessContext || '');
    };

    // --- File Handling ---
    const handleFileUpload = async (file) => {
        if (!file || isLoading) return;
        setIsLoading(true);
        setError(null);

        await saveMessage('system', { nlSummary: `Uploading and reading ${file.name}...` });

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim() !== '');

            if (lines.length < 1) {
                setError("Empty file.");
                setIsLoading(false);
                return;
            }

            // Extract Headers
            const headers = lines[0].split(',').map(h => h.trim());
            const tableName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

            // Build schema
            let dynamicSchema = `CREATE TABLE ${tableName} (\n`;
            headers.forEach((h, i) => {
                let type = 'TEXT';
                if (lines.length > 1) {
                    const sampleVal = lines[1].split(',')[i]?.trim();
                    if (!isNaN(sampleVal)) type = sampleVal.includes('.') ? 'REAL' : 'INT';
                }
                dynamicSchema += `  "${h}" ${type}${i < headers.length - 1 ? ',' : ''}\n`;
            });
            dynamicSchema += `);`;

            // 2. Store Context
            const contextPreview = lines.slice(0, 1000).join('\n');

            // 3. Update State
            setDbName(file.name);
            setCsvSchema(dynamicSchema);
            setCsvContext(contextPreview);

            if (currentSessionId && firestoreDb) {
                const sessionRef = doc(firestoreDb, 'artifacts', APP_ID, 'users', userId, 'chat_sessions', currentSessionId);
                await updateDoc(sessionRef, {
                    dbName: file.name,
                    schema: dynamicSchema,
                    context: contextPreview
                });
            }

            await saveMessage('ai', { nlSummary: `I've analyzed **${file.name}**. \n\n**Schema Detected:**\n\`\`\`sql\n${dynamicSchema}\n\`\`\`\nI'm ready to query this data.` });
            setIsLoading(false);
        };
        reader.readAsText(file);
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFileUpload(file);
    };

    const handleSuggestAnalysis = async () => {
        if (!dbName || isLoading) return;
        setIsLoading(true);
        setError(null);
        setSuggestions([]);

        const systemPrompt = `Generate 3 insightful SQL-oriented questions for a user analyzing this dataset. Return JSON array of strings.`;
        const payload = {
            contents: [{ parts: [{ text: `Schema: \n${csvSchema}` }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json", responseSchema: { type: "ARRAY", items: { type: "STRING" } } }
        };

        try {
            const jsonResponse = await callGeminiApi(payload);
            setSuggestions(jsonResponse);
        } catch (e) {
            setError("Failed to generate suggestions.");
        } finally {
            setIsLoading(false);
        }
    };

    const generateInsightsReport = async (results, originalQuery) => {
        setIsLoading(true);
        const systemPrompt = "You are an expert Academic Data Analyst. Write a short insight report.";
        const dataString = JSON.stringify(results);
        const prompt = `Original Query: ${originalQuery}\nData Results: ${dataString}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
        };

        try {
            const result = await callGeminiApi(payload);
            const reportText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            await saveMessage('ai', { nlSummary: reportText });
        } catch (e) {
            console.error("Report Gen Error", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuerySubmit = async (e) => {
        e.preventDefault();
        console.log("handleQuerySubmit triggered", { nlQuery, isLoading });
        if (!nlQuery.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        const userQuery = nlQuery.trim();
        setNlQuery('');

        await saveMessage('user', { nlSummary: userQuery });

        const systemPrompt = `You are VSAV AI. Active File: '${dbName}'. Schema: \n${csvSchema}\n DATA SAMPLE: ${csvContext}\n Task: 1. If generic input, return "sql_query": null. 2. If data query, generate valid SQL and result preview. Return JSON only keys: sql_query, nl_summary, result_preview.`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        "sql_query": { "type": "STRING", "nullable": true },
                        "nl_summary": { "type": "STRING" },
                        "result_preview": { type: "OBJECT", nullable: true, properties: { headers: { type: "ARRAY", items: { type: "STRING" } }, data: { type: "ARRAY", items: { type: "ARRAY", items: { type: "STRING" } } } } }
                    },
                    propertyOrdering: ["sql_query", "nl_summary", "result_preview"]
                }
            }
        };

        try {
            const response = await callGeminiApi(payload);
            await saveMessage('ai', { nlSummary: response.nl_summary, sql: response.sql_query, results: response.result_preview });
        } catch (e) {
            setError(`Query failed: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render ---
    return (
        <div className="flex h-screen bg-[#0f172a] font-sans overflow-hidden text-slate-200 selection:bg-indigo-500/30">
            <script src="https://cdn.tailwindcss.com"></script>
            {/* Sidebar */}
            <div className="hidden md:flex w-72 bg-[#0f172a] border-r border-slate-800 flex-col z-10 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/5 to-transparent pointer-events-none"></div>
                <div className="p-6 border-b border-slate-800 relative flex justify-between items-center">
                    <div className="flex items-center tracking-tight"> <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20"> <DatabaseIcon className="w-5 h-5 text-white" /> </div> <div> <h1 className="text-lg font-bold text-white">VSAV<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">AI</span></h1> <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Academic Intelligence</p> </div> </div>
                    <button onClick={handleNewChat} className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-colors shadow-sm" title="New Chat"> <NewChatIcon className="w-5 h-5" /> </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-6"> <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Current Context</h3> <div className={`p-3 rounded-xl border text-xs flex items-center transition-all duration-300 ${dbName ? 'bg-indigo-950/40 border-indigo-800/50 text-indigo-300 shadow-lg shadow-indigo-900/10' : 'bg-slate-900/50 border-slate-800 text-slate-600 border-dashed'}`}> <div className={`w-2 h-2 rounded-full mr-3 shadow-sm ${dbName ? 'bg-emerald-400 shadow-emerald-500/50' : 'bg-slate-700'}`}></div> <span className="truncate font-medium">{dbName ? dbName : 'No Data Active'}</span> </div> </div>
                    {sessions.length > 0 && (<div className="mb-4"> <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1 flex items-center"> <ChatBubbleIcon className="w-3 h-3 mr-1" /> History </h3> <div className="space-y-1"> {sessions.map((sess) => (<button key={sess.id} onClick={() => switchSession(sess.id, sess.dbName, sess.schema, sess.context)} className={`w-full text-left text-xs py-2.5 px-3 rounded-lg truncate transition-all border ${currentSessionId === sess.id ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/50 border-transparent'}`}> {sess.title || 'Untitled Chat'} </button>))} </div> </div>)}
                </div>
                <SuggestionsBox suggestions={suggestions} isLoading={isLoading} dbName={dbName} setNlQuery={setNlQuery} handleSuggestAnalysis={handleSuggestAnalysis} />
                <div className="p-4 border-t border-slate-800 bg-[#0b1120]"> <div className="flex items-center text-xs text-slate-400"> <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mr-3 text-slate-300 font-bold shadow-inner border border-slate-600"> {userId ? userId.substring(0, 1).toUpperCase() : '?'} </div> <div className="flex flex-col"> <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">User ID</span> <span className="truncate font-mono text-indigo-400">{userId?.substring(0, 8)}...</span> </div> </div> {error && <p className="text-[10px] text-red-400 mt-3 leading-tight bg-red-950/30 p-2 rounded border border-red-900/50">{error}</p>}
                    <div className="mt-2 p-2 bg-black/50 text-[9px] font-mono text-green-400 break-all border border-green-900/30 rounded">DEBUG: {debugStatus}</div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative bg-[#0f172a] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"> <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div> <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[100px]"></div> </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative z-0"> <div className="max-w-3xl mx-auto"> <ConversationView conversation={conversation} onGenerateReport={generateInsightsReport} /> {isLoading && (<div className="flex justify-start mt-6 animate-pulse"> <div className="bg-slate-800 h-8 w-8 rounded-full mr-3 border border-slate-700"></div> <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm w-48"> <div className="h-2 bg-slate-800 rounded w-3/4 mb-3"></div> <div className="h-2 bg-slate-800 rounded w-1/2"></div> </div> </div>)} </div> </div>

                {/* Input Area */}
                <div className="bg-[#0f172a]/90 backdrop-blur-md border-t border-slate-800 p-6 pb-8 relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleQuerySubmit} className="relative flex items-end gap-3 bg-slate-900/80 p-2 rounded-[2rem] border border-slate-700 shadow-2xl shadow-black/20 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="p-3 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-full transition-all flex-shrink-0 group" title="Upload Data File"> <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" /> </button>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} />
                            <textarea className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3.5 text-slate-200 placeholder-slate-500 max-h-32 leading-relaxed" placeholder={isListening ? "Listening..." : "Message VSAV AI..."} rows={1} value={nlQuery} onChange={(e) => { setNlQuery(e.target.value) }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuerySubmit(e); } }} style={{ minHeight: '52px' }} />
                            <div className="flex items-center gap-2 pb-1.5 pr-1.5">
                                <button type="button" onClick={handleSpeechInput} className={`p-2.5 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/50'}`}> <MicIcon className="w-5 h-5" /> </button>
                                <button type="submit" disabled={!nlQuery.trim() || isLoading} className={`p-2.5 rounded-full transition-all duration-300 ${nlQuery.trim() && !isLoading ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-105' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}> <SendIcon className="w-5 h-5" /> </button>
                            </div>
                        </form>
                        <div className="text-center mt-3"> <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest"> AI generated content. Review all SQL before execution. </p> </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
