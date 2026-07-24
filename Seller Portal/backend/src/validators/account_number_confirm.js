/**
 * Account number validator — checks it's numeric and 9-18 digits.
 * The "confirm" (entered twice) check is handled in the frontend component.
 */
const MESSAGES = {
  invalid: {
    en: 'Account numbers are 9 to 18 digits. Please check and try again.',
    ta: 'கணக்கு எண்கள் 9 முதல் 18 இலக்கங்கள் வரை இருக்க வேண்டும். சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
    hi: 'खाता संख्याएँ 9 से 18 अंकों की होती हैं। कृपया जाँचें और पुनः प्रयास करें।',
  },
  mismatch: {
    en: 'The two numbers you entered don\'t match. Please type your account number again, carefully.',
    ta: 'நீங்கள் உள்ளிட்ட இரண்டு எண்களும் பொருந்தவில்லை. கணக்கு எண்ணை மீண்டும் கவனமாக உள்ளிடவும்.',
    hi: 'आपने जो दो नंबर दर्ज किए वे मेल नहीं खाते। कृपया अपना खाता नंबर फिर से सावधानी से टाइप करें।',
  },
  valid: {
    en: 'Account number looks valid.',
    ta: 'கணக்கு எண் சரியாக தெரிகிறது.',
    hi: 'खाता संख्या वैध लगती है।',
  },
};

function validate(value, language = 'en') {
  const lang = ['en', 'ta', 'hi'].includes(language) ? language : 'en';
  const cleaned = String(value).replace(/\s/g, '');
  if (!/^\d{9,18}$/.test(cleaned)) {
    return { valid: false, message: MESSAGES.invalid[lang], data: null };
  }
  return { valid: true, message: MESSAGES.valid[lang], data: { cleaned } };
}

module.exports = { validate };
