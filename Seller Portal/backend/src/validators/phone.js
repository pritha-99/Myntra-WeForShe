/**
 * Phone validator — multilingual error messages.
 */
const MESSAGES = {
  invalid: {
    en: 'Phone number must be 10 digits starting with 6, 7, 8, or 9.',
    ta: 'தொலைபேசி எண் 6, 7, 8, அல்லது 9 என்று தொடங்கும் 10 இலக்கமாக இருக்க வேண்டும்.',
    hi: 'फोन नंबर 10 अंकों का होना चाहिए और 6, 7, 8 या 9 से शुरू होना चाहिए।',
  },
  valid: {
    en: 'Valid phone number.',
    ta: 'செல்லுபடியாகும் தொலைபேசி எண்.',
    hi: 'वैध फोन नंबर।',
  },
};

function validate(value, language = 'en') {
  const lang = ['en', 'ta', 'hi'].includes(language) ? language : 'en';
  const cleaned = String(value).replace(/\s/g, '');
  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return { valid: false, message: MESSAGES.invalid[lang], data: null };
  }
  return { valid: true, message: MESSAGES.valid[lang], data: { cleaned } };
}

module.exports = { validate };
