import { useState } from 'react';

/**
 * GuidedPassword — step-by-step password builder revealing requirements one at a time.
 * Each requirement is revealed and must be met before moving to the next.
 * Props: entry, value, onChange, onSubmit, language, t
 */
const REQUIREMENTS = [
  { id: 'length',    label: { en: 'At least 8 characters', ta: 'குறைந்தது 8 எழுத்துகள்', hi: 'कम से कम 8 अक्षर' },   test: (v) => v.length >= 8 },
  { id: 'upper',     label: { en: 'One uppercase letter (A–Z)', ta: 'ஒரு பெரிய எழுத்து (A–Z)', hi: 'एक बड़ा अक्षर (A–Z)' }, test: (v) => /[A-Z]/.test(v) },
  { id: 'lower',     label: { en: 'One lowercase letter (a–z)', ta: 'ஒரு சிறிய எழுத்து (a–z)', hi: 'एक छोटा अक्षर (a–z)' }, test: (v) => /[a-z]/.test(v) },
  { id: 'number',    label: { en: 'One number (0–9)', ta: 'ஒரு எண் (0–9)', hi: 'एक नंबर (0–9)' }, test: (v) => /[0-9]/.test(v) },
  { id: 'special',   label: { en: 'One special character (e.g. @#!)', ta: 'ஒரு சிறப்பு எழுத்து (@#!)', hi: 'एक special character (@#!)' }, test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export default function GuidedPassword({ entry, value = '', onChange, onSubmit, language, t }) {
  const [show, setShow] = useState(false);

  const metCount = REQUIREMENTS.filter((r) => r.test(value)).length;
  const allMet   = metCount === REQUIREMENTS.length;

  // Current active requirement = first unmet one
  const activeIndex = REQUIREMENTS.findIndex((r) => !r.test(value));

  function getStrengthColor() {
    if (metCount <= 1) return 'var(--myntra-error)';
    if (metCount <= 3) return 'var(--myntra-warning)';
    return 'var(--myntra-success)';
  }

  return (
    <div className="flex flex-col gap-4 w-full animate-slideUp">
      {/* Password input */}
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter password"
          style={{
            background: 'var(--myntra-surface)',
            border: `2px solid ${value ? getStrengthColor() : 'var(--myntra-border)'}`,
            borderRadius: 12,
            padding: '16px 50px 16px 20px',
            fontSize: '1rem',
            color: 'var(--myntra-text)',
            width: '100%',
            outline: 'none',
            fontFamily: 'monospace',
            letterSpacing: show ? 'normal' : '0.2em',
          }}
        />
        <button
          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
          onClick={() => setShow(!show)}
          aria-label="Toggle visibility"
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>

      {/* Strength bar */}
      {value && (
        <div style={{ width: '100%', height: 6, background: 'var(--myntra-border)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(metCount / REQUIREMENTS.length) * 100}%`,
            background: getStrengthColor(),
            borderRadius: 4,
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}

      {/* Requirements — reveal one at a time */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {REQUIREMENTS.map((req, i) => {
          const met = req.test(value);
          const visible = i <= activeIndex || met;
          if (!visible && i > activeIndex) return null;
          const label = req.label[language] || req.label.en;
          return (
            <div
              key={req.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                borderRadius: 8,
                background: met ? 'rgba(0,196,140,0.12)' : i === activeIndex ? 'rgba(255,63,108,0.12)' : 'var(--myntra-card)',
                border: `1.5px solid ${met ? 'var(--myntra-success)' : i === activeIndex ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
                transition: 'all 0.25s ease',
                opacity: visible ? 1 : 0,
              }}
            >
              <span style={{ fontSize: '1rem' }}>{met ? '✅' : i === activeIndex ? '⬜' : '⬜'}</span>
              <span style={{ fontSize: '0.9rem', color: met ? 'var(--myntra-success)' : 'var(--myntra-text)' }}>{label}</span>
            </div>
          );
        })}
      </div>

      <button
        className="tile-btn primary"
        onClick={onSubmit}
        disabled={!allMet}
      >
        {t('next')}
      </button>
    </div>
  );
}
