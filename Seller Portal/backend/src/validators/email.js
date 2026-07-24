/**
 * Email validator — multilingual error messages.
 */
const MESSAGES = {
  invalid: {
    en: 'This doesn\'t look like a complete email. It should look like name@example.com.',
    ta: 'இது சரியான மின்னஞ்சல் முகவரி அல்ல. name@example.com போல் இருக்க வேண்டும்.',
    hi: 'यह एक पूर्ण ईमेल नहीं लगती। इसे name@example.com जैसा होना चाहिए।',
  },
  valid: {
    en: 'Valid email address.',
    ta: 'செல்லுபடியாகும் மின்னஞ்சல் முகவரி.',
    hi: 'वैध ईमेल पता।',
  },
};

function validate(value, language = 'en') {
  const lang = ['en', 'ta', 'hi'].includes(language) ? language : 'en';
  const cleaned = String(value).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    return { valid: false, message: MESSAGES.invalid[lang], data: null };
  }
  return { valid: true, message: MESSAGES.valid[lang], data: { cleaned } };
}

module.exports = { validate };
