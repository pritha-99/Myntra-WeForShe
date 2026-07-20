/**
 * GSTIN validator — multilingual error messages.
 */
const GSTIN_REGEX = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const MESSAGES = {
  length: {
    en: 'GSTIN must be exactly 15 characters.',
    ta: 'GSTIN சரியாக 15 எழுத்துகளாக இருக்க வேண்டும்.',
    hi: 'GSTIN ठीक 15 अक्षरों का होना चाहिए।',
  },
  format: {
    en: 'GSTIN format is invalid. Example: 29ABCDE1234F1Z5',
    ta: 'GSTIN வடிவம் தவறானது. உதாரணம்: 29ABCDE1234F1Z5',
    hi: 'GSTIN का प्रारूप अमान्य है। उदाहरण: 29ABCDE1234F1Z5',
  },
  valid: {
    en: 'Valid GSTIN.',
    ta: 'செல்லுபடியாகும் GSTIN.',
    hi: 'वैध GSTIN।',
  },
};

function validate(value, language = 'en') {
  const lang = ['en', 'ta', 'hi'].includes(language) ? language : 'en';
  const cleaned = String(value).toUpperCase().replace(/\s/g, '');
  if (cleaned.length !== 15) {
    return { valid: false, message: MESSAGES.length[lang], data: null };
  }
  if (!GSTIN_REGEX.test(cleaned)) {
    return { valid: false, message: MESSAGES.format[lang], data: null };
  }
  return { valid: true, message: MESSAGES.valid[lang], data: { cleaned } };
}

module.exports = { validate };
