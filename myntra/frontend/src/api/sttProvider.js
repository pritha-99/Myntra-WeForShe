/**
 * sttProvider.js — STT using browser's SpeechRecognition API.
 *
 * Exposes:
 *   transcribe(language) → Promise<string>   — start listening
 *   stop()                                   — stop the current session
 *   isSupported()                            — browser capability check
 *
 * A module-level reference to the active recognition instance lets callers
 * call stop() from outside the Promise chain (e.g. a "Stop" button).
 */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const LANG_MAP = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
};

// Active recognition instance — kept at module level so stop() can reach it
let _active = null;

/**
 * Starts microphone capture. Returns a Promise that resolves with the
 * transcribed string (empty string if stopped before any speech was detected).
 */
export function transcribe(language = 'en') {
  return new Promise((resolve, reject) => {
    if (!SpeechRecognition) {
      reject(new Error('SpeechRecognition is not supported in this browser.'));
      return;
    }

    // Stop any previous session
    if (_active) {
      try { _active.stop(); } catch { /* ignore */ }
      _active = null;
    }

    const recognition = new SpeechRecognition();
    _active = recognition;

    recognition.lang = LANG_MAP[language] || 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    let settled = false;

    function settle(fn) {
      if (!settled) {
        settled = true;
        _active = null;
        fn();
      }
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      settle(() => resolve(transcript));
    };

    recognition.onerror = (event) => {
      // "aborted" means stop() was called — resolve with empty, not reject
      if (event.error === 'aborted' || event.error === 'no-speech') {
        settle(() => resolve(''));
      } else {
        settle(() => reject(new Error(event.error || 'Speech recognition error')));
      }
    };

    recognition.onend = () => {
      // Fires after onresult or onerror — settle with empty if nothing was resolved yet
      settle(() => resolve(''));
    };

    recognition.start();
  });
}

/** Stops the active recognition session (resolves the transcribe Promise with ''). */
export function stop() {
  if (_active) {
    try { _active.stop(); } catch { /* ignore */ }
    _active = null;
  }
}

/** Returns true if the browser supports SpeechRecognition. */
export function isSupported() {
  return Boolean(SpeechRecognition);
}
