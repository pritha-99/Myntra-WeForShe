import { useState, useEffect, useCallback } from 'react';
import manifest from './data/manifest.sample.json';
import { getState, setCurrentIndex, setLanguage, resetSession } from './state/sessionStore';
import { explainField } from './api/client';
import QuestionScreen from './components/QuestionScreen';

import en from './i18n/en.json';
import ta from './i18n/ta.json';
import hi from './i18n/hi.json';

const STRINGS = { en, ta, hi };
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
];

const QUESTIONS = [...manifest].sort((a, b) => a.order - b.order);

export default function App() {
  const [lang, setLang] = useState(() => getState().language || 'hi');
  const [index, setIndex] = useState(() => getState().currentIndex || 0);
  const [done, setDone] = useState(false);
  const [declarationText, setDeclarationText] = useState('');

  const t = useCallback((key) => STRINGS[lang]?.[key] || STRINGS.en?.[key] || key, [lang]);

  useEffect(() => {
    const entry = QUESTIONS[index];
    if (entry?.inputType === 'declaration_agree' && entry.explainDocKey) {
      explainField(entry.explainDocKey, lang)
        .then((res) => { if (res.grounded) setDeclarationText(res.answer); })
        .catch(() => {});
    }
  }, [index, lang]);

  function handleLanguageChange(code) {
    setLang(code);
    setLanguage(code);
  }

  function handleNext() {
    const nextIndex = index + 1;
    if (nextIndex >= QUESTIONS.length) {
      setDone(true);
    } else {
      setIndex(nextIndex);
      setCurrentIndex(nextIndex);
    }
  }

  function handleBack() {
    if (index > 0) {
      const prev = index - 1;
      setIndex(prev);
      setCurrentIndex(prev);
    }
  }

  if (done) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 20, padding: 32, textAlign: 'center',
        background: 'var(--myntra-dark)',
      }}>
        <div style={{ fontSize: '5rem' }}>🎉</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--myntra-pink)' }}>
          {t('congrats')}
        </h1>
        <p style={{ color: 'var(--myntra-subtext)', lineHeight: 1.8, maxWidth: 480 }}>
          Your Myntra seller registration is complete. Our team will review your details and get back to you within 3–5 business days.
        </p>
        <button
          className="tile-btn primary"
          style={{ width: 220, marginTop: 16, padding: '14px 0' }}
          onClick={() => { resetSession(); setIndex(0); setCurrentIndex(0); setDone(false); }}
        >
          Start Over
        </button>
      </div>
    );
  }

  const entry = QUESTIONS[index];

  return (
    /* Desktop two-column layout (#2) */
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--myntra-dark)', overflow: 'hidden',
    }}>
      {/* ── Top header bar ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64, flexShrink: 0,
        borderBottom: '1px solid var(--myntra-border)',
        background: 'var(--myntra-surface)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--myntra-pink), #ff7eb3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 900, color: '#fff', flexShrink: 0,
          }}>M</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--myntra-text)', lineHeight: 1.2 }}>
              Bharat Onboarding
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--myntra-muted)' }}>
              Myntra Seller Registration
            </div>
          </div>
        </div>

        {/* Language picker */}
        <div style={{ display: 'flex', gap: 8 }}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleLanguageChange(l.code)}
              style={{
                padding: '6px 16px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600,
                border: `1.5px solid ${lang === l.code ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
                background: lang === l.code ? 'rgba(255,63,108,0.15)' : 'transparent',
                color: lang === l.code ? 'var(--myntra-pink)' : 'var(--myntra-muted)',
                cursor: 'pointer', transition: 'all 0.18s ease',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main two-column body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar — step navigator */}
        <aside style={{
          width: 260, flexShrink: 0,
          background: 'var(--myntra-surface)',
          borderRight: '1px solid var(--myntra-border)',
          padding: '28px 20px',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--myntra-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Progress
          </p>
          {QUESTIONS.map((q, i) => {
            const qText = q.questionText?.[lang] || q.questionText?.en || q.id;
            const isCurrent = i === index;
            const isDone = i < index;
            return (
              <div
                key={q.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: isCurrent ? 'rgba(255,63,108,0.12)' : 'transparent',
                  border: `1.5px solid ${isCurrent ? 'var(--myntra-pink)' : 'transparent'}`,
                  cursor: isDone ? 'pointer' : 'default',
                  transition: 'all 0.18s',
                }}
                onClick={() => isDone ? (setIndex(i), setCurrentIndex(i)) : null}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: isDone ? 'var(--myntra-success)' : isCurrent ? 'var(--myntra-pink)' : 'var(--myntra-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: isDone || isCurrent ? '#fff' : 'var(--myntra-muted)',
                }}>
                  {isDone ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: '0.82rem', lineHeight: 1.4,
                  color: isCurrent ? 'var(--myntra-text)' : isDone ? 'var(--myntra-subtext)' : 'var(--myntra-muted)',
                  fontWeight: isCurrent ? 600 : 400,
                }}>
                  {qText.length > 45 ? qText.slice(0, 45) + '…' : qText}
                </span>
              </div>
            );
          })}
        </aside>

        {/* Right main content area */}
        <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Back button row */}
            {index > 0 && (
              <div style={{ padding: '16px 32px 0' }}>
                <button
                  onClick={handleBack}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--myntra-muted)', fontSize: '0.88rem',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  ← {t('back')}
                </button>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <QuestionScreen
                key={entry.id}
                entry={entry}
                currentIndex={index}
                total={QUESTIONS.length}
                language={lang}
                t={t}
                onNext={handleNext}
                declarationText={declarationText}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
