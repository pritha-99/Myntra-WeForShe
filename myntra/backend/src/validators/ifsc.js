/**
 * IFSC validator — multilingual error messages.
 */
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const MESSAGES = {
  length: {
    en: 'IFSC code must be exactly 11 characters.',
    ta: 'IFSC குறியீடு சரியாக 11 எழுத்துகளாக இருக்க வேண்டும்.',
    hi: 'IFSC कोड ठीक 11 अक्षरों का होना चाहिए।',
  },
  format: {
    en: 'IFSC format is invalid. Example: SBIN0001234',
    ta: 'IFSC வடிவம் தவறானது. உதாரணம்: SBIN0001234',
    hi: 'IFSC का प्रारूप अमान्य है। उदाहरण: SBIN0001234',
  },
  valid: {
    en: 'Valid IFSC code.',
    ta: 'செல்லுபடியாகும் IFSC குறியீடு.',
    hi: 'वैध IFSC कोड।',
  },
};

function validate(value, language = 'en') {
  const lang = ['en', 'ta', 'hi'].includes(language) ? language : 'en';
  const cleaned = String(value).toUpperCase().replace(/\s/g, '');
  if (cleaned.length !== 11) {
    return { valid: false, message: MESSAGES.length[lang], data: null };
  }
  if (!IFSC_REGEX.test(cleaned)) {
    return { valid: false, message: MESSAGES.format[lang], data: null };
  }
  return { valid: true, message: MESSAGES.valid[lang], data: { cleaned } };
}

module.exports = { validate };
