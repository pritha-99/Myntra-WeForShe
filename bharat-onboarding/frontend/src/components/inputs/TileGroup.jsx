/**
 * TileGroup — single-select tile group.
 * Used for: OMS choice, account type, yes/no, category.
 * Reads options from entry.inputConfig.options
 * Props: entry, value, onChange, onSubmit, language, t
 */
export default function TileGroup({ entry, value, onChange, onSubmit, language, t }) {
  const options = (entry.inputConfig && entry.inputConfig.options) || [];

  return (
    <div className="flex flex-col gap-4 w-full animate-slideUp">
      <p style={{ color: 'var(--myntra-subtext)', fontSize: '0.85rem', textAlign: 'center' }}>
        {t('selectOne')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((opt) => {
          const label = typeof opt === 'object' ? (opt[language] || opt.en || opt.value || opt) : opt;
          const val   = typeof opt === 'object' ? (opt.value || opt.en || opt) : opt;
          const selected = value === val;
          return (
            <button
              key={val}
              className={`tile-btn${selected ? ' selected' : ''}`}
              onClick={() => onChange(val)}
              style={{ justifyContent: 'flex-start', gap: 12, paddingLeft: 20, fontSize: '1rem' }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${selected ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
                background: selected ? 'var(--myntra-pink)' : 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </span>
              {label}
            </button>
          );
        })}
      </div>

      <button
        className="tile-btn primary w-full"
        onClick={onSubmit}
        disabled={!value}
        style={{ marginTop: 8 }}
      >
        {t('next')}
      </button>
    </div>
  );
}
