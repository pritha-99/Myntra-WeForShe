/**
 * TextInput — plain text input (email, address).
 * Props: entry, value, onChange, onSubmit, language, t
 */
export default function TextInput({ entry, value = '', onChange, onSubmit, t }) {
  const config = entry.inputConfig || {};
  const inputType = config.inputType || 'text';
  const placeholder = config.placeholder || '';
  const maxLen = config.maxLength || 200;

  return (
    <div className="flex flex-col gap-5 w-full animate-slideUp">
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLen}
        style={{
          background: 'var(--myntra-surface)',
          border: `2px solid ${value ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
          borderRadius: 12,
          padding: '16px 20px',
          fontSize: '1rem',
          color: 'var(--myntra-text)',
          width: '100%',
          outline: 'none',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--myntra-pink)'; }}
        onBlur={(e) => { e.target.style.borderColor = value ? 'var(--myntra-pink)' : 'var(--myntra-border)'; }}
      />

      <button
        className="tile-btn primary"
        onClick={onSubmit}
        disabled={!value || !value.trim()}
      >
        {t('next')}
      </button>
    </div>
  );
}
