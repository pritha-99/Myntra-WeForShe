import { useState, useCallback, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import MiaChat from '../components/MiaChat';
import MyntraLogo from '../components/MyntraLogo';

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [lightMode, setLightMode] = useState(() => {
    const saved = localStorage.getItem('bharat_theme');
    return saved ? saved === 'light' : true; // Default to light
  });
  const navigate = useNavigate();

  // Apply theme
  useEffect(() => {
    if (lightMode) {
      document.body.classList.add('light-mode');
      localStorage.setItem('bharat_theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('bharat_theme', 'dark');
    }
  }, [lightMode]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileOpen && !e.target.closest('button[title="Profile"]') && !e.target.closest('.profile-dropdown')) {
        setProfileOpen(false);
      }
      if (catalogOpen && !e.target.closest('.catalog-dropdown-trigger')) {
        setCatalogOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [profileOpen, catalogOpen]);

  // ── Auth guard: redirect to landing if not logged in ──
  useEffect(() => {
    const sellerId = localStorage.getItem('sellerId');
    if (!sellerId) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const sellerName = localStorage.getItem('sellerName') || 'Seller';

  function handleLogout() {
    localStorage.removeItem('sellerId');
    localStorage.removeItem('sellerName');
    localStorage.removeItem('sellerEmail');
    navigate('/');
  }

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
          height: 64,
          flexShrink: 0,
          background: 'var(--myntra-surface)',
          borderBottom: '1px solid var(--myntra-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          gap: 16,
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/dashboard')}>
          <MyntraLogo subtitle="PARTNER PORTAL" />
        </div>

        {/* Horizontal nav tabs */}
        <nav
          className="hide-scrollbar"
          style={{
            display: 'flex',
            gap: 4,
            flex: 1,
            justifyContent: 'flex-start',
            overflowX: 'auto',
            maxWidth: '100%',
            minWidth: 0,
            paddingBottom: 4,
            paddingLeft: 12,
            paddingRight: 12,
            marginLeft: -4,
            marginRight: -4,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <div key={item.key} style={{ position: 'relative' }}>
              <NavLink
                to={item.path}
                end={item.end}
                style={({ isActive }) => ({
                  padding: '8px 14px',
                  borderRadius: 4,
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 800 : 700,
                  color: isActive ? 'var(--myntra-pink)' : 'var(--myntra-text)',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
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
                    borderRadius: 6,
                    padding: '8px 0',
                    zIndex: 999,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
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
                      fontSize: '0.8rem',
                      color: 'var(--myntra-text)',
                      cursor: 'pointer',
                      fontWeight: 700,
                      textTransform: 'uppercase',
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
                      fontSize: '0.8rem',
                      color: 'var(--myntra-muted)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    🔜 {t('comingSoon')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Language dropdown + Theme toggle + Logout */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700,
              border: '1px solid var(--myntra-border)',
              background: 'var(--myntra-surface)',
              color: 'var(--myntra-text)',
              cursor: 'pointer', transition: 'all 0.15s',
              outline: 'none',
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          {/* Theme toggle */}
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

          {/* Profile dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: `2px solid ${profileOpen ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
                background: profileOpen ? 'rgba(255,63,108,0.1)' : 'var(--myntra-surface)',
                cursor: 'pointer',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
                flexShrink: 0,
                color: 'var(--myntra-text)',
              }}
              title="Profile"
            >
              👤
            </button>

            {profileOpen && (
              <div
                className="profile-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  background: 'var(--myntra-surface)',
                  border: '1px solid var(--myntra-border)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  zIndex: 999,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  minWidth: 180,
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{
                  fontSize: '0.85rem',
                  color: 'var(--myntra-text)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{ fontSize: '1.2rem' }}>👤</span>
                  <span>{sellerName}</span>
                </div>
              </div>
            )}
          </div>

          {/* Logout button */}
          <button
            id="logout-btn"
            onClick={handleLogout}
            title="Logout"
            style={{
              padding: '5px 14px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1px solid var(--myntra-border)',
              background: 'transparent',
              color: 'var(--myntra-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--myntra-error)'; e.currentTarget.style.color = 'var(--myntra-error)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--myntra-border)'; e.currentTarget.style.color = 'var(--myntra-muted)'; }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet context={{ lang, t }} />
      </main>

      {/* ── Mia help bot ── */}
      <MiaChat entry={null} language={lang} t={t} />
    </div>
  );
}
