/**
 * ConfirmReadonly — shows pre-fetched key/value pairs for user confirmation.
 * Used for: GST-verified detail confirmation, entity type.
 * Props: entry, value, onChange, onSubmit, language, t
 * value = 'correct' | 'wrong' | null
 */
export default function ConfirmReadonly({ entry, value, onChange, onSubmit, language, t }) {
  const config = entry.inputConfig || {};
  const fields = config.fields || [];
  const data   = config.data   || {};

  return (
    <div className="flex flex-col gap-5 w-full animate-slideUp">
      {/* Key/value display */}
      <div style={{
        background: 'var(--myntra-surface)',
        border: '2px solid var(--myntra-border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {fields.map((field, i) => {
          const fieldLabel = typeof field === 'object' ? (field[language] || field.en || field.key) : field;
          const fieldKey   = typeof field === 'object' ? field.key : field;
          return (
            <div
              key={fieldKey}
              style={{
                display: 'flex', padding: '14px 18px',
                borderBottom: i < fields.length - 1 ? '1px solid var(--myntra-border)' : 'none',
                alignItems: 'flex-start', gap: 12,
              }}
            >
              <span style={{ color: 'var(--myntra-muted)', fontSize: '0.85rem', flexShrink: 0, minWidth: 110 }}>
                {fieldLabel}
              </span>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', wordBreak: 'break-all' }}>
                {data[fieldKey] || '—'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Confirm / Wrong tiles */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className={`tile-btn${value === 'correct' ? ' selected' : ''}`}
          onClick={() => { onChange('correct'); onSubmit(); }}
          style={{ flex: 1, borderColor: value === 'correct' ? 'var(--myntra-success)' : 'var(--myntra-border)',
                   background: value === 'correct' ? 'rgba(0,196,140,0.18)' : 'var(--myntra-card)' }}
        >
          ✅ {t('confirmCorrect')}
        </button>
        <button
          className={`tile-btn${value === 'wrong' ? ' selected' : ''}`}
          onClick={() => { onChange('wrong'); }}
          style={{ flex: 1, borderColor: value === 'wrong' ? 'var(--myntra-error)' : 'var(--myntra-border)',
                   background: value === 'wrong' ? 'rgba(255,82,82,0.18)' : 'var(--myntra-card)' }}
        >
          ❌ {t('confirmWrong')}
        </button>
      </div>
      {value === 'wrong' && (
        <p style={{ color: 'var(--myntra-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
          Please contact support to correct this information.
        </p>
      )}
    </div>
  );
}
