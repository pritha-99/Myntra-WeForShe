import { useState, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import MiaChat from '../components/MiaChat';

import en from '../i18n/en.json';
import ta from '../i18n/ta.json';
import hi from '../i18n/hi.json';

const STRINGS = { en, ta, hi };
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
];

const NAV_ITEMS = [
  { key: 'dashboardHome',       path: '/dashboard',                         end: true },
  { key: 'dashboardBuying',     path: '/dashboard/buying' },
  { key: 'dashboardCatalog',    path: '/dashboard/catalog',                 hasSub: true },
  { key: 'dashboardMyStory',    path: '/dashboard/my-story' },
  { key: 'dashboardOrders',     path: '/dashboard/orders' },
  { key: 'dashboardGrowth',     path: '/dashboard/growth' },
  { key: 'dashboardPricing',    path: '/dashboard/pricing' },
  { key: 'dashboardPayment',    path: '/dashboard/payment' },
  { key: 'dashboardHealth',     path: '/dashboard/health' },
  { key: 'dashboardReports',    path: '/dashboard/reports' },
  { key: 'dashboardSupport',    path: '/dashboard/support' },
];

export default function DashboardLayout({ initialLang = 'en' }) {
  const [lang, setLang] = useState(initialLang);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const navigate = useNavigate();

  const t = useCallback(
    (key) => STRINGS[lang]?.[key] || STRINGS.en?.[key] || key,
    [lang]
  );

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--myntra-dark)',
        overflow: 'hidden',
      }}
    >
      {/* ── Top nav bar ── */}
      <header
        style={{
          height: 60,
          flexShrink: 0,
          background: 'var(--myntra-surface)',
          borderBottom: '1px solid var(--myntra-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 100,
        }}
      >
        {/* Logo + branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--myntra-pink), #ff7eb3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 900,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            M
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: '1rem',
              color: 'var(--myntra-text)',
              letterSpacing: '-0.02em',
            }}
          >
            {t('sellerPortal')}
          </span>
        </div>

        {/* Horizontal nav tabs */}
        <nav
          style={{
            display: 'flex',
            gap: 2,
            flex: 1,
            justifyContent: 'center',
            overflowX: 'auto',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <div key={item.key} style={{ position: 'relative' }}>
              <NavLink
                to={item.path}
                end={item.end}
                style={({ isActive }) => ({
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--myntra-pink)' : 'var(--myntra-muted)',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  borderBottom: isActive ? '2px solid var(--myntra-pink)' : '2px solid transparent',
                })}
                onClick={() => {
                  if (item.hasSub) setCatalogOpen((o) => !o);
                }}
              >
                {t(item.key)}
                {item.hasSub && ' ▾'}
              </NavLink>

              {/* Catalog dropdown */}
              {item.hasSub && catalogOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: 'var(--myntra-surface)',
                    border: '1px solid var(--myntra-border)',
                    borderRadius: 10,
                    padding: '8px 0',
                    zIndex: 999,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    minWidth: 180,
                  }}
                >
                  <button
                    onClick={() => { navigate('/dashboard/catalog/product-listing'); setCatalogOpen(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      color: 'var(--myntra-text)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    📦 {t('dashboardProductListing')}
                  </button>
                  <button
                    onClick={() => { navigate('/dashboard/buying'); setCatalogOpen(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      color: 'var(--myntra-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    🔜 {t('comingSoon')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Language toggle */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              style={{
                padding: '5px 12px',
                borderRadius: 16,
                fontSize: '0.75rem',
                fontWeight: 600,
                border: `1.5px solid ${lang === l.code ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
                background: lang === l.code ? 'rgba(255,63,108,0.15)' : 'transparent',
                color: lang === l.code ? 'var(--myntra-pink)' : 'var(--myntra-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Page content (rendered by child routes) ── */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {/* Pass lang and t down via Outlet context */}
        <Outlet context={{ lang, t }} />
      </main>

      {/* ── Mia help bot (context-free for dashboard) ── */}
      <MiaChat entry={null} language={lang} t={t} />
    </div>
  );
}
