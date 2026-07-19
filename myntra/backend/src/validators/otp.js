module.exports = {
  validate(value, language = 'en') {
    const MESSAGES = {
      en: 'That code didn\'t match. Check your messages — the newest code is the one that works.',
      ta: 'அந்த குறியீடு பொருந்தவில்லை. உங்கள் செய்திகளை சரிபார்க்கவும் - புதிய குறியீடு தான் வேலை செய்யும்.',
      hi: 'वह कोड मेल नहीं खाया। अपने संदेश जांचें — सबसे नया कोड ही काम करेगा।'
    };

    const cleanValue = (value || '').trim();
    // For demo purposes, we accept any 6-digit number that isn't '000000'
    const isValid = /^\d{6}$/.test(cleanValue) && cleanValue !== '000000';

    return {
      valid: isValid,
      message: isValid ? null : (MESSAGES[language] || MESSAGES.en)
    };
  }
};
