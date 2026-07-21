import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import manifest from './data/manifest.sample.json';
import { getState, setCurrentIndex, setLanguage, resetSession } from './state/sessionStore';
import { explainField } from './api/client';
import QuestionScreen from './components/QuestionScreen';
import MiaChat from './components/MiaChat';
import ConfirmationScreen from './components/ConfirmationScreen';
import DashboardLayout from './dashboard/DashboardLayout';
import HomePage from './dashboard/HomePage';
import ProductListingPage from './dashboard/ProductListingPage';
import MyStoryPage from './dashboard/MyStoryPage';
import ComingSoonPage from './dashboard/ComingSoonPage';

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
const SIDEBAR_ENTRIES = QUESTIONS.filter(q => q.sidebarLabel);

// ─────────────────────────────────────────────────────────────
//  Main onboarding flow (unchanged logic, new routing on done)
// ─────────────────────────────────────────────────────────────
function OnboardingApp() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(() => getState().language || 'en');
  const [index, setIndex] = useState(() => getState().currentIndex || 0);
  const [done, setDone] = useState(false);
  const [declarationText, setDeclarationText] = useState('');
  const [showWarnings, setShowWarnings] = useState(false);
  const [lightMode, setLightMode] = useState(() => localStorage.getItem('bharat_theme') === 'light');

  const t = useCallback((key) => STRINGS[lang]?.[key] || STRINGS.en?.[key] || key, [lang]);

  useEffect(() => {
    if (lightMode) {
      document.body.classList.add('light-mode');
      localStorage.setItem('bharat_theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('bharat_theme', 'dark');
    }
  }, [lightMode]);

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
    const { answers } = getState();
    let nextIndex = -1;
    for (let i = index + 1; i < QUESTIONS.length - 1; i++) {
      if (QUESTIONS[i].required !== false && !answers[QUESTIONS[i].id]) {
        nextIndex = i;
        break;
      }
    }
    if (nextIndex === -1) nextIndex = QUESTIONS.length - 1;

    if (index === QUESTIONS.length - 1) {
      setShowWarnings(true);
      const unanswered = QUESTIONS.find(q => q.required !== false && q.id !== 'declaration' && !answers[q.id]);
      if (unanswered) {
        const uIdx = QUESTIONS.indexOf(unanswered);
        setIndex(uIdx);
        setCurrentIndex(uIdx);
      } else {
        setDone(true);
      }
      return;
    }
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

  function handleGoTo(questionId) {
    const nextIdx = QUESTIONS.findIndex(q => q.id === questionId);
    if (nextIdx !== -1) {
      setIndex(nextIdx);
      setCurrentIndex(nextIdx);
    }
  }

  // Done → show confirmation screen (which handles MongoDB submit)
  if (done) {
    return <ConfirmationScreen lang={lang} t={t} />;
  }

  const entry = QUESTIONS[index];

  const currentSidebarIdx = (() => {
    let last = 0;
    for (let si = 0; si < SIDEBAR_ENTRIES.length; si++) {
      if (QUESTIONS[index].order >= SIDEBAR_ENTRIES[si].order) last = si;
    }
    return last;
  })();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--myntra-dark)', overflow: 'hidden', transition: 'background 0.25s ease' }}>
      {/* Top header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 64, flexShrink: 0, borderBottom: '1px solid var(--myntra-border)', background: 'var(--myntra-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, var(--myntra-pink), #ff7eb3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900, color: '#fff', flexShrink: 0 }}>M</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--myntra-text)', lineHeight: 1.2 }}>Bharat Onboarding</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--myntra-muted)' }}>Myntra Seller Registration</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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

          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            onClick={() => setLightMode(m => !m)}
            title={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--myntra-muted)', userSelect: 'none' }}>
              {lightMode ? '☀️' : '🌙'}
            </span>
            <div className={`theme-toggle${lightMode ? ' light' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </div>
        </div>
      </header>

      {/* Main two-column body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{ width: 230, flexShrink: 0, background: 'var(--myntra-surface)', borderRight: '1px solid var(--myntra-border)', padding: '24px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--myntra-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Progress
          </p>
          {SIDEBAR_ENTRIES.map((q, si) => {
            const label = q.sidebarLabel?.[lang] || q.sidebarLabel?.en || q.id;
            const isCurrent = si === currentSidebarIdx;
            const qIdx = QUESTIONS.findIndex(x => x.id === q.id);
            const sectionStartIndex = qIdx;
            const nextSectionStartIndex = si + 1 < SIDEBAR_ENTRIES.length
              ? QUESTIONS.findIndex(x => x.id === SIDEBAR_ENTRIES[si + 1].id)
              : QUESTIONS.length;

            let hasUnanswered = false;
            const answers = getState().answers;
            for (let i = sectionStartIndex; i < nextSectionStartIndex; i++) {
              if (QUESTIONS[i].required !== false && !answers[QUESTIONS[i].id]) {
                hasUnanswered = true;
                break;
              }
            }
            const showWarning = showWarnings && hasUnanswered;
            const isDone = !hasUnanswered;

            return (
              <div
                key={q.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 12px', borderRadius: 10,
                  background: isCurrent ? 'rgba(255,63,108,0.12)' : 'transparent',
                  border: `1.5px solid ${isCurrent ? 'var(--myntra-pink)' : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
                onClick={() => qIdx >= 0 ? (setIndex(qIdx), setCurrentIndex(qIdx)) : null}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: isDone ? 'var(--myntra-success)' : isCurrent ? 'var(--myntra-pink)' : 'var(--myntra-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 700, color: isDone || isCurrent ? '#fff' : 'var(--myntra-muted)',
                  position: 'relative',
                }}>
                  {showWarning && (
                    <span style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: 14, height: 14, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>
                  )}
                  {isDone ? '✓' : si + 1}
                </div>
                <span style={{
                  fontSize: '0.84rem', lineHeight: 1.3,
                  color: isCurrent ? 'var(--myntra-text)' : isDone ? 'var(--myntra-subtext)' : 'var(--myntra-muted)',
                  fontWeight: isCurrent ? 700 : isDone ? 500 : 400,
                }}>
                  {label}
                </span>
              </div>
            );
          })}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {index > 0 && (
              <div style={{ padding: '16px 32px 0' }}>
                <button
                  onClick={handleBack}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--myntra-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}
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
                onGoTo={handleGoTo}
              />
            </div>
          </div>
        </main>
      </div>
      <MiaChat entry={entry} language={lang} t={t} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Root App — defines all routes
// ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* Onboarding flow (and embedded confirmation) */}
      <Route path="/" element={<OnboardingApp />} />

      {/* Seller Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<HomePage />} />
        <Route path="catalog/product-listing" element={<ProductListingPage />} />
        <Route path="my-story" element={<MyStoryPage />} />
        {/* Coming Soon tabs */}
        <Route path="buying"   element={<ComingSoonPage tabKey="dashboardBuying" />} />
        <Route path="catalog"  element={<ComingSoonPage tabKey="dashboardCatalog" />} />
        <Route path="orders"   element={<ComingSoonPage tabKey="dashboardOrders" />} />
        <Route path="growth"   element={<ComingSoonPage tabKey="dashboardGrowth" />} />
        <Route path="pricing"  element={<ComingSoonPage tabKey="dashboardPricing" />} />
        <Route path="payment"  element={<ComingSoonPage tabKey="dashboardPayment" />} />
        <Route path="health"   element={<ComingSoonPage tabKey="dashboardHealth" />} />
        <Route path="reports"  element={<ComingSoonPage tabKey="dashboardReports" />} />
        <Route path="support"  element={<ComingSoonPage tabKey="dashboardSupport" />} />
      </Route>
    </Routes>
  );
}
