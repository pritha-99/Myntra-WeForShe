/**
 * ttsProvider.js — TTS using browser's speechSynthesis API.
 *
 * Chrome bug fix: calling cancel() then speak() in the same tick causes
 * onend to fire immediately without actually speaking. We delay speak()
 * by one task (setTimeout 0) after cancel to let the engine settle.
 *
 * Also treats "canceled" / "interrupted" errors as a normal end (not a
 * failure), so stopping speech mid-way doesn't break the speaking state.
 */

const LANG_MAP = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
};

/**
 * Speaks the given text. Returns a Promise that resolves when speech ends
 * (including when manually cancelled) or rejects only on real errors.
 */
export function speak(text, language = 'en') {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('speechSynthesis not supported'));
      return;
    }

    // Cancel ongoing speech first
    window.speechSynthesis.cancel();

    // Chrome requires a task boundary between cancel() and speak()
    // otherwise onend fires immediately without any audio
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_MAP[language] || 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => resolve();

      utterance.onerror = (e) => {
        // "canceled" / "interrupted" means the user (or code) stopped it — treat as normal end
        if (e.error === 'canceled' || e.error === 'interrupted') {
          resolve();
        } else {
          reject(new Error(e.error || 'TTS error'));
        }
      };

      window.speechSynthesis.speak(utterance);
    }, 50);
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
