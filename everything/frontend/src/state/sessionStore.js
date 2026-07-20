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

function _load() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function _save(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage quota exceeded — silently fail
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
  _save({ ...DEFAULT_STATE });
}
