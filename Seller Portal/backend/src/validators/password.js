/**
 * Password validator — multilingual error messages.
 */
const LABELS = {
  en: {
    length:  'at least 8 characters',
    upper:   'at least one uppercase letter',
    lower:   'at least one lowercase letter',
    number:  'at least one number',
    special: 'at least one special character (e.g. @, #, !)',
    prefix:  'Password must contain: ',
    valid:   'Password meets all requirements.',
  },
  ta: {
    length:  'குறைந்தது 8 எழுத்துகள்',
    upper:   'குறைந்தது ஒரு பெரிய எழுத்து',
    lower:   'குறைந்தது ஒரு சிறிய எழுத்து',
    number:  'குறைந்தது ஒரு எண்',
    special: 'குறைந்தது ஒரு சிறப்பு எழுத்து (@, #, !)',
    prefix:  'கடவுச்சொல் கொண்டிருக்க வேண்டும்: ',
    valid:   'கடவுச்சொல் அனைத்து தேவைகளையும் பூர்த்தி செய்கிறது.',
  },
  hi: {
    length:  'कम से कम 8 अक्षर',
    upper:   'कम से कम एक बड़ा अक्षर',
    lower:   'कम से कम एक छोटा अक्षर',
    number:  'कम से कम एक नंबर',
    special: 'कम से कम एक special character (@, #, !)',
    prefix:  'पासवर्ड में होना चाहिए: ',
    valid:   'पासवर्ड सभी आवश्यकताओं को पूरा करता है।',
  },
};

function validate(value, language = 'en') {
  const lang = ['en', 'ta', 'hi'].includes(language) ? language : 'en';
  const L = LABELS[lang];
  const pwd = String(value);
  const errors = [];

  if (pwd.length < 8)          errors.push(L.length);
  if (!/[A-Z]/.test(pwd))     errors.push(L.upper);
  if (!/[a-z]/.test(pwd))     errors.push(L.lower);
  if (!/[0-9]/.test(pwd))     errors.push(L.number);
  if (!/[^A-Za-z0-9]/.test(pwd)) errors.push(L.special);

  if (errors.length > 0) {
    return { valid: false, message: L.prefix + errors.join(', ') + '.', data: null };
  }
  return { valid: true, message: L.valid, data: null };
}

module.exports = { validate };
