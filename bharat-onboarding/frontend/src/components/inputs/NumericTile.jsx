import { useEffect, useRef } from 'react';

/**
 * NumericTile — tappable keypad + physical keyboard support.
 * #4: Added keydown listener for 0-9, Backspace, Enter.
 */
export default function NumericTile({ entry, value = '', onChange, onSubmit, t }) {
  const config = entry.inputConfig || {};
  const maxLen = config.length || 10;
  const containerRef = useRef(null);

  // Physical keyboard support (#4)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key >= '0' && e.key <= '9') {
        if (value.length < maxLen) onChange(value + e.key);
      } else if (e.key === 'Backspace') {
        onChange(value.slice(0, -1));
      } else if (e.key === 'Enter') {
        onSubmit();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, maxLen, onChange, onSubmit]);

  function handleKey(key) {
    if (key === 'del') {
      onChange(value.slice(0, -1));
    } else {
      if (value.length < maxLen) onChange(value + key);
    }
  }

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-5 w-full animate-slideUp">
      {/* Display */}
      <div className="display-box w-full max-w-sm tracking-widest" style={{ fontSize: '1.6rem', letterSpacing: '0.18em' }}>
        {value || <span style={{ color: 'var(--myntra-muted)', fontSize: '1rem', fontWeight: 400 }}>
          {'•'.repeat(maxLen)}
        </span>}
        {value.length > 0 && (
          <span style={{ fontSize: '0.7rem', color: 'var(--myntra-muted)', marginLeft: 10 }}>
            {value.length}/{maxLen}
          </span>
        )}
      </div>

      {/* Keypad */}
      <div className="keypad" style={{ maxWidth: 280 }}>
        {keys.map((k, i) => (
          <button
            key={i}
            className="key-btn"
            onClick={() => k && handleKey(k)}
            disabled={!k && k !== '0'}
            style={!k ? { visibility: 'hidden' } : { fontSize: '1.3rem' }}
            aria-label={k === 'del' ? 'Delete' : k}
          >
            {k === 'del' ? '⌫' : k}
          </button>
        ))}
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--myntra-muted)', marginTop: -8 }}>
        ⌨️ Physical keyboard supported
      </p>

      <button
        className="tile-btn primary"
        style={{ maxWidth: 280, width: '100%' }}
        onClick={onSubmit}
        disabled={value.length === 0}
      >
        {t('next')}
      </button>
    </div>
  );
}
