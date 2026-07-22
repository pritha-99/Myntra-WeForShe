import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitSeller } from '../api/client';
import { getState } from '../state/sessionStore';
import { setSellerId } from '../state/sessionStore';
import { speak } from '../api/ttsProvider';

export default function ConfirmationScreen({ lang, t }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sellerId, setLocalSellerId] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function doSubmit() {
      setSubmitting(true);
      const { answers, language } = getState();
      try {
        const res = await submitSeller(answers, language || lang);
        setSellerId(res.sellerId);
        setLocalSellerId(res.sellerId);
        // Persist login session so the dashboard auth guard accepts this new seller
        localStorage.setItem('sellerId', res.sellerId);
        localStorage.setItem('sellerName', answers.brand_name || answers.companyName || 'Seller');
        localStorage.setItem('sellerEmail', answers.email || '');
        setSubmitted(true);
      } catch (err) {
        console.warn('MongoDB submit failed, continuing in demo mode:', err.message);
        setError(true);
        setSubmitted(false);
      } finally {
        setSubmitting(false);
      }
    }

    doSubmit();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const titleText = t('confirmationTitle');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--myntra-dark)',
        padding: '32px 24px',
      }}
    >
      {/* Confetti emoji area */}
      <div
        style={{
          fontSize: '5rem',
          marginBottom: 24,
          animation: 'slideUp 0.5s ease',
        }}
      >
        🎉
      </div>

      <div
        style={{
          background: 'var(--myntra-surface)',
          border: '1px solid var(--myntra-border)',
          borderRadius: 20,
          padding: '40px 48px',
          maxWidth: 560,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          animation: 'slideUp 0.4s ease',
        }}
      >
        {submitting ? (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                border: '4px solid var(--myntra-border)',
                borderTop: '4px solid var(--myntra-pink)',
                borderRadius: '50%',
                margin: '0 auto 20px',
              }}
              className="animate-spin"
            />
            <p style={{ color: 'var(--myntra-subtext)', fontSize: '1rem' }}>
              {t('confirmationSubmitting')}
            </p>
          </>
        ) : error ? (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(255,202,40,0.14)',
                border: '1px solid var(--myntra-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '2rem',
              }}
            >
              !
            </div>

            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--myntra-text)',
                lineHeight: 1.4,
                marginBottom: 16,
              }}
            >
              {t('confirmationTitle')}
            </h1>

            <p
              style={{
                color: 'var(--myntra-warning)',
                lineHeight: 1.8,
                marginBottom: 8,
                fontSize: '0.95rem',
              }}
            >
              Could not save your details to MongoDB. Fix the backend connection and try again.
            </p>

            <button
              className="tile-btn primary"
              style={{ padding: '16px 32px', fontSize: '1rem', fontWeight: 700 }}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </>
        ) : (
          <>
            {/* Success icon */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--myntra-success), #00e6a8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '2rem',
              }}
            >
              ✓
            </div>

            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--myntra-text)',
                lineHeight: 1.4,
                marginBottom: 16,
              }}
            >
              {titleText}
            </h1>

            <p
              style={{
                color: 'var(--myntra-subtext)',
                lineHeight: 1.8,
                marginBottom: 8,
                fontSize: '0.95rem',
              }}
            >
              {t('confirmationBody')}
            </p>

            {/* TTS listen button */}
            <button
              onClick={() => speak(titleText, lang)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--myntra-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 24,
                padding: '4px 8px',
                borderRadius: 8,
              }}
            >
              🔊 {t('listen')}
            </button>

            {error && (
              <div
                style={{
                  background: 'rgba(255,202,40,0.1)',
                  border: '1px solid var(--myntra-warning)',
                  borderRadius: 10,
                  padding: '10px 16px',
                  fontSize: '0.82rem',
                  color: 'var(--myntra-warning)',
                  marginBottom: 20,
                }}
              >
                ⚠️ {t('confirmationError')}
              </div>
            )}

            {sellerId && (
              <div
                style={{
                  background: 'rgba(255,63,108,0.08)',
                  border: '1px solid rgba(255,63,108,0.2)',
                  borderRadius: 10,
                  padding: '10px 16px',
                  fontSize: '0.85rem',
                  color: 'var(--myntra-subtext)',
                  marginBottom: 28,
                }}
              >
                {t('sellerIdLabel')}: <strong style={{ color: 'var(--myntra-pink)', fontFamily: 'monospace', fontSize: '1rem' }}>{sellerId}</strong>
              </div>
            )}

            <button
              className="tile-btn primary"
              style={{ padding: '16px 32px', fontSize: '1rem', fontWeight: 700 }}
              onClick={() => navigate('/dashboard')}
              disabled={!submitted}
            >
              {t('goToDashboard')} →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
