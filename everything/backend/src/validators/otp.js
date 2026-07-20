/**
 * OTP validator — 6-digit numeric check.
 * In the prototype we just verify it's 6 digits. Real impl would check against session-issued code.
 */
const MESSAGES = {
  invalid: {
    en: 'That code didn\'t match. Please check your messages — the newest code is the one that works.',
    ta: 'அந்த குறியீடு பொருந்தவில்லை. உங்கள் செய்திகளை சரிபாருங்கள் — புதிய குறியீடு சரியானது.',
    hi: 'वह कोड मेल नहीं खाया। अपने संदेश जाँचें — नवीनतम कोड ही सही है।',
  },
  valid: {
    en: 'Code verified.',
    ta: 'குறியீடு சரிபார்க்கப்பட்டது.',
    hi: 'कोड सत्यापित।',
  },
};

function validate(value, language = 'en') {
  const lang = ['en', 'ta', 'hi'].includes(language) ? language : 'en';
  const cleaned = String(value).replace(/\s/g, '');
  if (!/^\d{6}$/.test(cleaned)) {
    return { valid: false, message: MESSAGES.invalid[lang], data: null };
  }
  return { valid: true, message: MESSAGES.valid[lang], data: { cleaned } };
}

module.exports = { validate };
