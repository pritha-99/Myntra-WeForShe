/**
 * sessionStore.js — persists onboarding session to localStorage.
 * Exposes the exact methods specified in Section 4.2 of the build doc.
 */

const STORAGE_KEY = 'bharat_onboarding_session';

const DEFAULT_STATE = {
  language: 'en',
  currentIndex: 0,
  answers: {},
  errors: {},
  failedAttempts: {},
};

let inMemoryState = null;

function _load() {
  if (inMemoryState) {
    return inMemoryState;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    inMemoryState = raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
  } catch {
    inMemoryState = { ...DEFAULT_STATE };
  }
  return inMemoryState;
}

function _save(state) {
  inMemoryState = { ...state };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Storage quota exceeded (e.g. large base64 uploaded images) — inMemoryState retains all state in RAM for submission
    console.warn('sessionStorage quota exceeded, storing state in memory for session duration:', err.message);
  }
}

/** Returns a shallow copy of the current session state. */
export function getState() {
  return { ..._load() };
}

/** Stores the answer for a field and clears its error. */
export function setAnswer(fieldId, value) {
  const state = _load();
  state.answers = { ...state.answers, [fieldId]: value };
  // Clear error on new answer
  if (state.errors[fieldId]) {
    state.errors = { ...state.errors };
    delete state.errors[fieldId];
  }
  _save(state);
}

/** Sets the error message for a field. */
export function setError(fieldId, message) {
  const state = _load();
  state.errors = { ...state.errors, [fieldId]: message };
  _save(state);
}

/** Increments the failed attempt counter for a field and returns the new count. */
export function incrementFailedAttempts(fieldId) {
  const state = _load();
  const count = (state.failedAttempts[fieldId] || 0) + 1;
  state.failedAttempts = { ...state.failedAttempts, [fieldId]: count };
  _save(state);
  return count;
}

/** Resets the failed attempt counter for a field to 0. */
export function resetFailedAttempts(fieldId) {
  const state = _load();
  state.failedAttempts = { ...state.failedAttempts, [fieldId]: 0 };
  _save(state);
}

/** Sets the current question index. */
export function setCurrentIndex(index) {
  const state = _load();
  state.currentIndex = index;
  _save(state);
}

/** Sets the active language. */
export function setLanguage(lang) {
  const state = _load();
  state.language = lang;
  _save(state);
}

/** Clears all session data (full reset). */
export function resetSession() {
  inMemoryState = { ...DEFAULT_STATE };
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

// ── Seller ID (persisted in localStorage, survives session) ──
const SELLER_ID_KEY = 'bharat_seller_id';

/** Returns the sellerId stored after successful onboarding submission. */
export function getSellerId() {
  return localStorage.getItem('sellerId') || localStorage.getItem(SELLER_ID_KEY) || null;
}

/** Persists the sellerId returned by /api/seller/submit or login. */
export function setSellerId(id) {
  localStorage.setItem(SELLER_ID_KEY, id);
  localStorage.setItem('sellerId', id);
}

/** Clears the stored sellerId (useful for testing). */
export function clearSellerId() {
  localStorage.removeItem(SELLER_ID_KEY);
  localStorage.removeItem('sellerId');
}
