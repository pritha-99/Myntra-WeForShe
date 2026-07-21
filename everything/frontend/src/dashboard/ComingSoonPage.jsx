import { useOutletContext } from 'react-router-dom';

/**
 * Reusable "Coming Soon" page.
 * Receives `tabKey` (a translation key like 'dashboardOrders')
 * and renders a centred placeholder.
 */
export default function ComingSoonPage({ tabKey = 'comingSoon' }) {
  const { t } = useOutletContext();

  const tabName = t(tabKey);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 60px)',
        padding: 40,
        gap: 20,
        textAlign: 'center',
        background: 'var(--myntra-dark)',
      }}
    >
      {/* Illustration */}
      <div
        style={{
          fontSize: '5rem',
          lineHeight: 1,
          animation: 'slideUp 0.4s ease',
          marginBottom: 8,
        }}
      >
        🚀
      </div>

      <div
        style={{
          background: 'var(--myntra-surface)',
          border: '1px solid var(--myntra-border)',
          borderRadius: 20,
          padding: '40px 56px',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.35s ease',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(255,63,108,0.1)',
            color: 'var(--myntra-pink)',
            border: '1px solid rgba(255,63,108,0.25)',
            borderRadius: 20,
            padding: '4px 14px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          {t('comingSoon')}
        </div>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--myntra-text)',
            marginBottom: 12,
          }}
        >
          {tabName}
        </h1>

        <p
          style={{
            fontSize: '0.95rem',
            color: 'var(--myntra-subtext)',
            lineHeight: 1.7,
          }}
        >
          {t('comingSoonMsg')}
        </p>

        {/* Decorative progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i === 1 ? 'var(--myntra-pink)' : 'var(--myntra-border)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
