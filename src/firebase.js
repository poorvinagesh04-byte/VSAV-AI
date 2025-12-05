import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- PASTE YOUR REAL CONFIG HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyDQKwW1k-F18PPa-fkJb_DbAMjvWEi7Dig", // <--- Paste your real key here
  authDomain: "datamindaipreview.firebaseapp.com",
  projectId: "datamindaipreview",
  storageBucket: "datamindaipreview.firebasestorage.app",
  messagingSenderId: "523608311908",
  appId: "1:523608311908:web:432d911868ff286d75b771"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);