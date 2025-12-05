// Minimal mock Auth for local development
const STORAGE_KEY = 'datamind_mock_user';
let currentUser = null;
const listeners = new Set();

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) currentUser = JSON.parse(raw);
  } catch (e) {
    currentUser = null;
  }
}

function saveUser() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
  } catch (e) {}
}

function makeUser() {
  const id = 'mock_' + Math.random().toString(36).slice(2, 10);
  return { uid: id };
}

export function initMockAuth() {
  loadUser();
  if (!currentUser) {
    currentUser = makeUser();
    saveUser();
  }
}

export function getAuth(app) {
  // Return an object that resembles Firebase Auth instance with onAuthStateChanged method
  return {
    currentUser,
    onAuthStateChanged(cb) {
      // Immediately invoke with current user and register listener
      try { cb(currentUser); } catch (e) {}
      listeners.add(cb);
      return () => listeners.delete(cb);
    }
  };
}

export async function signInAnonymously(auth) {
  currentUser = makeUser();
  saveUser();
  listeners.forEach(cb => { try { cb(currentUser); } catch (e) {} });
  return { user: currentUser };
}

export async function signInWithCustomToken(auth, token) {
  // treat same as anonymous for mock
  return signInAnonymously(auth);
}

export default {
  initMockAuth,
  getAuth,
  signInAnonymously,
  signInWithCustomToken
};
