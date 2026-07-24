/**
 * Non-empty validator — simple presence check.
 */
const MESSAGES = {
  invalid: {
    en: 'Please provide an answer before continuing.',
    ta: 'தொடர்வதற்கு முன் ஒரு பதில் வழங்கவும்.',
    hi: 'जारी रखने से पहले एक उत्तर दें।',
  },
  valid: {
    en: 'Looks good.',
    ta: 'சரியாக தெரிகிறது.',
    hi: 'ठीक लगता है।',
  },
};

function validate(value, language = 'en') {
  const lang = ['en', 'ta', 'hi'].includes(language) ? language : 'en';
  const cleaned = String(value || '').trim();
  if (!cleaned || cleaned.length === 0) {
    return { valid: false, message: MESSAGES.invalid[lang], data: null };
  }
  return { valid: true, message: MESSAGES.valid[lang], data: { cleaned } };
}

module.exports = { validate };
