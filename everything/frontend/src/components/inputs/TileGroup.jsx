/**
 * TileGroup — single-select tile group.
 * Behaviour: tap once to select (highlights), tap the same tile again to confirm and advance.
 * This prevents accidental mis-taps on touch screens.
 */
export default function TileGroup({ entry, value, onChange, onSubmit, language, t }) {
  const options = (entry.inputConfig && entry.inputConfig.options) || [];

  function handleTap(val) {
    if (value === val) {
      // Second tap on already-selected option → confirm and advance
      onSubmit();
    } else {
      // First tap → just select
      onChange(val);
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full animate-slideUp">
      <p style={{ color: 'var(--myntra-subtext)', fontSize: '0.85rem', textAlign: 'center' }}>
        {value
          ? (language === 'ta' ? 'உறுதிப்படுத்த மீண்டும் தட்டவும்' :
             language === 'hi' ? 'पुष्टि करने के लिए फिर से टैप करें' :
             'Tap again to confirm')
          : t('selectOne')}
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
              onClick={() => handleTap(val)}
              style={{
                justifyContent: 'flex-start', gap: 12, paddingLeft: 20, fontSize: '1rem',
                boxShadow: selected ? '0 0 0 3px rgba(255,63,108,0.25)' : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${selected ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
                background: selected ? 'var(--myntra-pink)' : 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s',
              }}>
                {selected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </span>
              {label}
              {selected && (
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--myntra-pink)', fontWeight: 600 }}>
                  {language === 'ta' ? '↵ மீண்டும் தட்டவும்' :
                   language === 'hi' ? '↵ फिर टैप करें' :
                   '↵ tap again'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explicit Next button as fallback */}
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
