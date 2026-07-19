import { useState } from 'react';

/**
 * SupportCallButton — demo modal only (Section 4.3).
 * NO live agent view, NO session broadcasting, NO telephony.
 * On tap: shows a modal explaining this is a demo.
 * Close returns seller to the same screen with all answers untouched.
 */
export default function SupportCallButton({ t }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={t('callSupport')}
        style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '2px solid var(--myntra-border)',
          background: 'var(--myntra-card)',
          cursor: 'pointer', fontSize: '1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        aria-label={t('callSupport')}
      >
        📞
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 300, padding: 24,
        }}>
          <div style={{
            background: 'var(--myntra-surface)',
            border: '1px solid var(--myntra-border)',
            borderRadius: 20, padding: 28,
            width: '100%', maxWidth: 420,
            display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center',
          }}>
            <div style={{ fontSize: '3rem' }}>📞</div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}>
              {t('supportModalTitle')}
            </h2>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--myntra-subtext)', textAlign: 'center' }}>
              {t('supportModalBody')}
            </p>
            <button
              className="tile-btn primary"
              style={{ width: '100%', marginTop: 8 }}
              onClick={() => setOpen(false)}
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
