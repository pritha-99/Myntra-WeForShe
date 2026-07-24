/**
 * ErrorMessage — shows validation error with optional retry hint.
 * Props: message, onRetry
 */
export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div style={{
      background: 'rgba(255,82,82,0.12)',
      border: '2px solid var(--myntra-error)',
      borderRadius: 12,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      animation: 'slideUp 0.25s ease forwards',
    }}>
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>❌</span>
      <div style={{ flex: 1 }}>
        <p style={{ color: 'var(--myntra-error)', fontSize: '0.9rem', lineHeight: 1.5 }}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--myntra-pink)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
          >
            Try again →
          </button>
        )}
      </div>
    </div>
  );
}
