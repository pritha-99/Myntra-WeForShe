/**
 * sttProvider.js — STT (Speech-to-Text) stub using browser's SpeechRecognition API.
 * Interface: transcribe(language) → Promise<string>
 *
 * This is deliberately isolated here so it can be swapped for a real vendor
 * API (Sarvam AI, Google STT, etc.) without touching any component code.
 * Components import only `transcribe` from this module.
 */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

/**
 * Maps our 2-char language codes to BCP-47 tags for the Web Speech API.
 */
const LANG_MAP = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
};

/**
 * Starts microphone capture and returns a Promise that resolves with the
 * transcribed string. Rejects if the browser doesn't support SpeechRecognition
 * or if recognition fails.
 *
 * @param {string} language - 'en' | 'ta' | 'hi'
 * @returns {Promise<string>}
 */
export function transcribe(language = 'en') {
  return new Promise((resolve, reject) => {
    if (!SpeechRecognition) {
      reject(new Error('SpeechRecognition is not supported in this browser.'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_MAP[language] || 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event) => {
      reject(new Error(event.error || 'Speech recognition error'));
    };

    recognition.onend = () => {
      // If no result was fired before end, resolve with empty string
      // (the onresult handler takes precedence when it fires first)
    };

    recognition.start();
  });
}

/** Returns true if the browser supports SpeechRecognition. */
export function isSupported() {
  return Boolean(SpeechRecognition);
}
