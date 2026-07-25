import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginSeller } from './api/client';
import { setSellerId } from './state/sessionStore';
import MyntraLogo from './components/MyntraLogo';

/* ─────────────────────────────────────────────────────────────────
   LandingPage — Myntra Seller Portal entry page
   Matches the reference design: nav + hero banner + steps section
   REGISTER → /onboarding   |   LOGIN → modal → /dashboard
───────────────────────────────────────────────────────────────── */

const STEPS = [
  { icon: '📋', title: 'Register', desc: 'Fill in your business details, GSTIN, and bank info to get started.' },
  { icon: '✅', title: 'Get Approved', desc: 'Our team reviews your application within 2–5 business days.' },
  { icon: '📦', title: 'List Products', desc: 'Upload your catalog with AI-assisted automation tools.' },
  { icon: '🚀', title: 'Start Selling', desc: 'Go live and reach 55 million+ active Myntra shoppers.' },
];

const STATS = [
  { value: '55M+', label: 'Monthly Active Users' },
  { value: '5,000+', label: 'Brands' },
  { value: '7,00,000+', label: 'Products' },
  { value: '19,000+', label: 'Pin Codes Served' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your business email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const seller = await loginSeller(email.trim(), password);
      // Persist session
      setSellerId(seller.sellerId);
      localStorage.setItem('sellerId', seller.sellerId);
      localStorage.setItem('sellerName', seller.brandName || seller.companyName || 'Seller');
      localStorage.setItem('sellerEmail', seller.email || '');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function closeModal(e) {
    if (e.target === e.currentTarget) {
      setShowLogin(false);
      setError('');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#282C3F', fontFamily: "'Assistant', sans-serif" }}>

      {/* ── Top Navigation ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: '#FFFFFF',
        borderBottom: '1px solid #EAEAEC',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MyntraLogo subtitle="PARTNER PORTAL" height={40} />
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {['Sell On Myntra', 'Success Stories', 'Services', 'FAQs'].map((label) => (
            <button key={label} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.88rem', fontWeight: 600, color: '#282C3F',
              padding: '8px 14px', borderRadius: 4,
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => e.target.style.color = '#FF3F6C'}
              onMouseLeave={e => e.target.style.color = '#282C3F'}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            id="landing-register-btn"
            onClick={() => navigate('/onboarding')}
            style={{
              padding: '9px 24px', borderRadius: 4,
              background: '#FF3F6C', border: 'none',
              color: '#fff', fontWeight: 800, fontSize: '0.85rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              cursor: 'pointer', transition: 'all 0.18s ease',
              boxShadow: '0 4px 14px rgba(255,63,108,0.4)',
            }}
            onMouseEnter={e => { e.target.style.background = '#e73961'; e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.background = '#FF3F6C'; e.target.style.transform = 'translateY(0)'; }}
          >
            Register
          </button>
          <button
            id="landing-login-btn"
            onClick={() => { setShowLogin(true); setError(''); }}
            style={{
              padding: '8px 24px', borderRadius: 4,
              background: 'transparent',
              border: '2px solid #FF3F6C',
              color: '#FF3F6C', fontWeight: 800, fontSize: '0.85rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              cursor: 'pointer', transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(255,63,108,0.06)'; e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.transform = 'translateY(0)'; }}
          >
            Login
          </button>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'linear-gradient(135deg, #f8f0ff 0%, #fff0f5 50%, #fff5f0 100%)',
          minHeight: 420, padding: '0 60px',
          gap: 40,
        }}>
          {/* Left content */}
          <div style={{ flex: 1, maxWidth: 480, zIndex: 2 }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #FF3F6C, #7B2FBE)',
              color: '#fff', padding: '4px 14px', borderRadius: 20,
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: 16,
            }}>
              🌟 India's #1 Fashion Destination
            </div>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900,
              color: '#282C3F', lineHeight: 1.15, marginBottom: 16,
            }}>
              Grow Your Business<br />
              <span style={{
                background: 'linear-gradient(135deg, #FF3F6C, #7B2FBE)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>With Myntra</span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#535766', lineHeight: 1.7, marginBottom: 28, maxWidth: 400 }}>
              Join 5,000+ brands reaching <strong>55 million+</strong> monthly active shoppers.
              List your products and start selling today.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
              {STATS.slice(0, 2).map(s => (
                <div key={s.value}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FF3F6C' }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#7E818C', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => navigate('/onboarding')}
                style={{
                  padding: '14px 32px', borderRadius: 6,
                  background: '#FF3F6C', border: 'none',
                  color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 6px 20px rgba(255,63,108,0.4)',
                }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 28px rgba(255,63,108,0.5)'; }}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 20px rgba(255,63,108,0.4)'; }}
              >
                Enroll Now
              </button>
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  padding: '14px 32px', borderRadius: 6,
                  background: 'transparent',
                  border: '2px solid #282C3F',
                  color: '#282C3F', fontWeight: 700, fontSize: '0.95rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#FF3F6C'; e.target.style.color = '#FF3F6C'; }}
                onMouseLeave={e => { e.target.style.borderColor = '#282C3F'; e.target.style.color = '#282C3F'; }}
              >
                Already a partner? Login
              </button>
            </div>
          </div>

          {/* Right — Hero image */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: 380 }}>
            <div style={{
              borderRadius: 24, overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(123,47,190,0.2)',
              maxWidth: 560, width: '100%',
              background: 'linear-gradient(135deg, #7B2FBE, #FF3F6C)',
            }}>
              <img
                src="/hero-banner.png"
                alt="Sell on Myntra — Fashion couple"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          background: '#282C3F',
          display: 'flex', justifyContent: 'center', gap: 0,
          padding: '20px 40px',
        }}>
          {STATS.map((s, i) => (
            <div key={s.value} style={{
              textAlign: 'center', flex: 1, maxWidth: 200,
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              padding: '0 20px',
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FF3F6C' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#A8B8D8', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4 Steps Section ── */}
      <section style={{ padding: '72px 40px', background: '#FAFAFA', textAlign: 'center' }}>
        <div style={{ marginBottom: 8, fontSize: '0.8rem', fontWeight: 700, color: '#FF3F6C', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Simple Process
        </div>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: '#282C3F', marginBottom: 8 }}>
          Start Selling In 4 Simple Steps
        </h2>
        <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg, #FF3F6C, #7B2FBE)', borderRadius: 2, margin: '0 auto 48px' }} />

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24, maxWidth: 960, margin: '0 auto',
        }}>
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              style={{
                background: '#FFFFFF', borderRadius: 16,
                padding: '32px 24px', textAlign: 'center',
                border: '1.5px solid #EAEAEC',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'all 0.25s ease',
                cursor: 'default',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(255,63,108,0.15)';
                e.currentTarget.style.borderColor = '#FF3F6C';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#EAEAEC';
              }}
            >
              {/* Step number badge */}
              <div style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF3F6C, #7B2FBE)',
                color: '#fff', fontSize: '0.78rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255,63,108,0.4)',
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: '2.5rem', marginBottom: 16, marginTop: 8 }}>{step.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#282C3F', marginBottom: 10 }}>{step.title}</div>
              <div style={{ fontSize: '0.85rem', color: '#7E818C', lineHeight: 1.65 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA Banner ── */}
      <section style={{
        background: 'linear-gradient(135deg, #7B2FBE 0%, #FF3F6C 100%)',
        padding: '60px 40px', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
          Ready to grow your fashion brand?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', marginBottom: 32 }}>
          Join thousands of successful sellers on India's biggest fashion platform.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/onboarding')}
            style={{
              padding: '14px 40px', borderRadius: 6,
              background: '#fff', border: 'none',
              color: '#FF3F6C', fontWeight: 800, fontSize: '0.95rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 28px rgba(0,0,0,0.25)'; }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; }}
          >
            Register Now — It's Free
          </button>
          <button
            onClick={() => setShowLogin(true)}
            style={{
              padding: '14px 40px', borderRadius: 6,
              background: 'transparent',
              border: '2px solid rgba(255,255,255,0.7)',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#fff'; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.7)'; e.target.style.background = 'transparent'; }}
          >
            Partner Login
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        background: '#282C3F', color: '#A8B8D8',
        padding: '24px 40px', textAlign: 'center',
        fontSize: '0.82rem',
      }}>
        © {new Date().getFullYear()} Myntra Designs Pvt. Ltd. All rights reserved.
        &nbsp;·&nbsp; Partner Portal &nbsp;·&nbsp; Fashion for Everyone
      </footer>

      {/* ── Login Modal ── */}
      {showLogin && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              background: '#FFFFFF', borderRadius: 20,
              padding: '40px 36px', width: '100%', maxWidth: 420,
              boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
              position: 'relative',
              animation: 'slideUpModal 0.25s ease',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => { setShowLogin(false); setError(''); }}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: '#F5F5F6', border: 'none', borderRadius: '50%',
                width: 32, height: 32, cursor: 'pointer',
                fontSize: '1rem', color: '#7E818C',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#EAEAEC'}
              onMouseLeave={e => e.currentTarget.style.background = '#F5F5F6'}
            >
              ✕
            </button>

            {/* Modal header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
                <MyntraLogo height={52} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#282C3F', margin: 0 }}>
                Partner Login
              </h2>
              <p style={{ color: '#7E818C', fontSize: '0.88rem', marginTop: 6 }}>
                Sign in to your Myntra Seller account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#535766', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Business Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="yourname@company.com"
                  autoComplete="email"
                  style={{
                    width: '100%', padding: '13px 16px',
                    border: `1.5px solid ${error ? '#FF3F6C' : '#EAEAEC'}`,
                    borderRadius: 10, fontSize: '0.95rem', color: '#282C3F',
                    outline: 'none', transition: 'border-color 0.15s',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => { if (!error) e.target.style.borderColor = '#7B2FBE'; }}
                  onBlur={e => { if (!error) e.target.style.borderColor = '#EAEAEC'; }}
                />
              </div>

              {/* Password field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#535766', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      width: '100%', padding: '13px 48px 13px 16px',
                      border: `1.5px solid ${error ? '#FF3F6C' : '#EAEAEC'}`,
                      borderRadius: 10, fontSize: '0.95rem', color: '#282C3F',
                      outline: 'none', transition: 'border-color 0.15s',
                      fontFamily: 'inherit',
                    }}
                    onFocus={e => { if (!error) e.target.style.borderColor = '#7B2FBE'; }}
                    onBlur={e => { if (!error) e.target.style.borderColor = '#EAEAEC'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '1.1rem', color: '#7E818C',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div style={{
                  background: '#FFF0F2', border: '1.5px solid #FFB3C1',
                  borderRadius: 8, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: '0.9rem' }}>⚠️</span>
                  <span style={{ fontSize: '0.85rem', color: '#C91A46', fontWeight: 600 }}>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px', borderRadius: 10,
                  background: loading
                    ? '#EAEAEC'
                    : 'linear-gradient(135deg, #FF3F6C, #7B2FBE)',
                  border: 'none',
                  color: loading ? '#7E818C' : '#fff',
                  fontWeight: 800, fontSize: '0.95rem',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(255,63,108,0.35)',
                  marginTop: 4,
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {loading ? '⏳ Signing in…' : 'Sign In to Dashboard'}
              </button>

              {/* Register link */}
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#7E818C', margin: 0 }}>
                New partner?{' '}
                <button
                  type="button"
                  onClick={() => { setShowLogin(false); navigate('/onboarding'); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#FF3F6C', fontWeight: 700, fontSize: '0.85rem',
                    textDecoration: 'underline', padding: 0,
                  }}
                >
                  Register here
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Inline keyframes for modal animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUpModal { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}
