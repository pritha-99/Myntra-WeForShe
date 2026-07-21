import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { fetchSeller } from '../api/client';
import { getSellerId } from '../state/sessionStore';

const USEFUL_LINKS = [
  { icon: '📋', label: 'Seller Agreement',          href: '#' },
  { icon: '📦', label: 'Packaging Guidelines',      href: '#' },
  { icon: '💰', label: 'Payment Schedule',           href: '#' },
  { icon: '📞', label: 'Seller Support Hotline',    href: '#' },
  { icon: '🎓', label: 'Seller Training Videos',    href: '#' },
  { icon: '📈', label: 'Price Benchmarking Tool',   href: '#' },
];

const ANNOUNCEMENTS = [
  {
    badge: '🆕 NEW',
    badgeColor: 'var(--myntra-pink)',
    title: 'Festival Season Boost: List by Aug 15',
    body: 'Sellers who list 10+ products before August 15 get featured placement during Myntra\'s Big Fashion Festival.',
  },
  {
    badge: '📢 UPDATE',
    badgeColor: '#5C6BC0',
    title: 'Revised Return Policy Effective Aug 1',
    body: 'The return window for apparel has been updated. Please review the Seller Agreement link below.',
  },
];

export default function HomePage() {
  const { lang, t } = useOutletContext();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = getSellerId();
    if (!id) { setLoading(false); return; }

    fetchSeller(id)
      .then((data) => setSeller(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const businessName =
    seller?.answers?.businessName ||
    seller?.answers?.business_name ||
    seller?.answers?.['business-name'] ||
    'Seller';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Greeting card ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--myntra-surface) 0%, rgba(255,63,108,0.08) 100%)',
          border: '1px solid var(--myntra-border)',
          borderRadius: 20,
          padding: '32px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--myntra-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            {t('sellerPortal')}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--myntra-text)', lineHeight: 1.2, marginBottom: 8 }}>
            {t('hello')},{' '}
            <span style={{ color: 'var(--myntra-pink)' }}>
              {loading ? '...' : businessName.toUpperCase()}!
            </span>
          </h1>
          {seller && (
            <div style={{ fontSize: '0.8rem', color: 'var(--myntra-muted)', display: 'flex', gap: 16, marginTop: 4 }}>
              <span>🆔 {seller.sellerId}</span>
              <span>📅 {new Date(seller.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span
                style={{
                  background: 'rgba(0,196,140,0.15)',
                  color: 'var(--myntra-success)',
                  padding: '2px 10px',
                  borderRadius: 20,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  border: '1px solid rgba(0,196,140,0.3)',
                }}
              >
                {seller.status?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <button
          className="tile-btn primary"
          style={{ padding: '14px 28px', fontSize: '0.9rem', fontWeight: 700, width: 'auto', flexShrink: 0 }}
          onClick={() => navigate('/dashboard/catalog/product-listing')}
        >
          + {t('dashboardProductListing')}
        </button>
      </div>

      {/* ── Two-column: Announcements + Useful Links ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Announcements */}
        <div style={{ background: 'var(--myntra-surface)', border: '1px solid var(--myntra-border)', borderRadius: 16, padding: '24px 28px' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--myntra-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            📣 Announcements
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ANNOUNCEMENTS.map((a, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--myntra-card)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  border: '1px solid var(--myntra-border)',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    background: `${a.badgeColor}22`,
                    color: a.badgeColor,
                    border: `1px solid ${a.badgeColor}44`,
                    borderRadius: 20,
                    padding: '2px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {a.badge}
                </div>
                <p style={{ fontWeight: 700, color: 'var(--myntra-text)', fontSize: '0.9rem', marginBottom: 6 }}>{a.title}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--myntra-subtext)', lineHeight: 1.6 }}>{a.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Useful Links */}
        <div style={{ background: 'var(--myntra-surface)', border: '1px solid var(--myntra-border)', borderRadius: 16, padding: '24px 28px' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--myntra-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            🔗 {t('usefulLinks')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {USEFUL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--myntra-card)',
                  border: '1px solid var(--myntra-border)',
                  textDecoration: 'none',
                  color: 'var(--myntra-text)',
                  fontSize: '0.83rem',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--myntra-pink)'; e.currentTarget.style.background = 'rgba(255,63,108,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--myntra-border)'; e.currentTarget.style.background = 'var(--myntra-card)'; }}
              >
                <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick stats strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Products', value: '—', icon: '📦' },
          { label: 'Orders Today',   value: '0',  icon: '🛒' },
          { label: 'Revenue (MTD)',  value: '₹ —', icon: '💰' },
          { label: 'Return Rate',    value: '—',   icon: '↩️' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'var(--myntra-surface)',
              border: '1px solid var(--myntra-border)',
              borderRadius: 14,
              padding: '20px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--myntra-text)' }}>{stat.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--myntra-muted)', fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
