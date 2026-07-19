/**
 * ttsProvider.js — TTS (Text-to-Speech) stub using browser's speechSynthesis API.
 * Interface: speak(text, language) → Promise<void>
 *
 * Isolated here so it can be swapped for a real vendor API
 * (Sarvam AI, Google TTS, etc.) without touching any component code.
 * Components import only `speak` and `cancel` from this module.
 */

const LANG_MAP = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
};

/**
 * Speaks the given text in the given language.
 * Returns a Promise that resolves when speech ends, or rejects on error.
 *
 * @param {string} text
 * @param {string} language - 'en' | 'ta' | 'hi'
 * @returns {Promise<void>}
 */
export function speak(text, language = 'en') {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('speechSynthesis is not supported in this browser.'));
      return;
    }

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[language] || 'en-IN';
    utterance.rate = 0.9;   // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(new Error(e.error || 'TTS error'));

    window.speechSynthesis.speak(utterance);
  });
}

/** Immediately stops any ongoing speech. */
export function cancel() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/** Returns true if the browser supports speechSynthesis. */
export function isSupported() {
  return Boolean(window.speechSynthesis);
}
