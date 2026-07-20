/**
 * TileGroupMulti — multi-select tile group.
 * Used for: Operational Readiness checklist, Myntra for Earth tags.
 * value should be an array of selected option values.
 * Props: entry, value, onChange, onSubmit, language, t
 */
export default function TileGroupMulti({ entry, value = [], onChange, onSubmit, language, t }) {
  const options = (entry.inputConfig && entry.inputConfig.options) || [];

  const inputOption = options.find(o => o.requiresInput);
  const inputVal = inputOption ? (inputOption.value || inputOption.en || inputOption) : null;
  const customItems = value.filter(v => !options.some(o => (o.value || o.en || o) === v));

  function toggle(val) {
    const isInputOption = (val === inputVal);
    const checked = value.includes(val) || (isInputOption && customItems.length > 0);

    if (checked) {
      onChange(value.filter(v => v !== val && !customItems.includes(v)));
    } else {
      onChange([...value, val]);
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full animate-slideUp">
      <p style={{ color: 'var(--myntra-subtext)', fontSize: '0.85rem', textAlign: 'center' }}>
        {t('selectAll')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((opt) => {
          const label = typeof opt === 'object' ? (opt[language] || opt.en || opt.value || opt) : opt;
          const val   = typeof opt === 'object' ? (opt.value || opt.en || opt) : opt;
          const isInputOption = (val === inputVal);
          const checked = value.includes(val) || (isInputOption && customItems.length > 0);
          return (
            <div key={val} style={{display:'flex', flexDirection:'column'}}>
            <button
              className={`tile-btn${checked ? ' selected' : ''}`}
              onClick={() => toggle(val)}
              style={{ justifyContent: 'flex-start', gap: 12, paddingLeft: 20, fontSize: '1rem' }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                border: `2px solid ${checked ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
                background: checked ? 'var(--myntra-pink)' : 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {checked && <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>}
              </span>
              {label}
            </button>
            {checked && isInputOption && (
              <input
                type="text"
                value={customItems.length > 0 ? customItems[0] : ''}
                onChange={(e) => {
                  const text = e.target.value;
                  const newVal = value.filter(v => v !== val && !customItems.includes(v));
                  onChange([...newVal, text || val]);
                }}
                placeholder="Please specify..."
                style={{
                  marginTop: 8, padding: '12px 16px', borderRadius: 8,
                  border: '1.5px solid var(--myntra-border)', width: '100%',
                  background: 'transparent', color: 'var(--myntra-text)',
                  fontSize: '1rem', outline: 'none'
                }}
              />
            )}
            </div>
          );
        })}
      </div>

      <button
        className="tile-btn primary w-full"
        onClick={onSubmit}
        disabled={value.length === 0}
        style={{ marginTop: 8 }}
      >
        {t('next')} ({value.length} selected)
      </button>
    </div>
  );
}
