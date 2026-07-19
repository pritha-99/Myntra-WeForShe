module.exports = {
  validate(value, language = 'en') {
    const MESSAGES = {
      en: 'This doesn\'t look like a complete email. It should look like name@example.com.',
      ta: 'இது முழுமையான மின்னஞ்சலாகத் தெரியவில்லை. இது name@example.com போன்று இருக்க வேண்டும்.',
      hi: 'यह पूरा ईमेल नहीं लग रहा है। इसे name@example.com जैसा दिखना चाहिए।'
    };

    const cleanValue = (value || '').trim();
    // Basic email validation regex
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue);

    return {
      valid: isValid,
      message: isValid ? null : (MESSAGES[language] || MESSAGES.en)
    };
  }
};
