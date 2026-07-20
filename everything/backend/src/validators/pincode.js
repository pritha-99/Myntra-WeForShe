/**
 * Pincode validator — 6-digit Indian pincode format check.
 */
const MESSAGES = {
  invalid: {
    en: 'We couldn\'t find that pincode. Please check it, or call support and we\'ll look it up together.',
    ta: 'அந்த பின்கோடை கண்டுபிடிக்க முடியவில்லை. சரிபார்க்கவும் அல்லது ஆதரவை அழைக்கவும்.',
    hi: 'हम वह पिनकोड नहीं ढूंढ सके। इसे जाँचें, या सहायता को कॉल करें और हम इसे एक साथ देखेंगे।',
  },
  valid: {
    en: 'Pincode format looks correct.',
    ta: 'பின்கோடு வடிவம் சரியாக உள்ளது.',
    hi: 'पिनकोड प्रारूप सही दिखता है।',
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
