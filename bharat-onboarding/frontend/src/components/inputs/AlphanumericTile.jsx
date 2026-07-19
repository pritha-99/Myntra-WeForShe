import { useState, useEffect, useRef } from 'react';

/**
 * AlphanumericTile — enhanced with:
 * #3: Paste support (native text input + paste-from-clipboard button)
 * #4: Physical keyboard support (keydown listener)
 * #8: Hindi (Devanagari) and Tamil script onscreen keyboards
 */

// Key layouts per script
const LAYOUTS = {
  en: {
    label: 'A-Z',
    rows: [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L'],
      ['Z','X','C','V','B','N','M'],
    ],
  },
  hi: {
    label: 'हिंदी',
    rows: [
      ['क','ख','ग','घ','ङ','च','छ','ज','झ','ञ'],
      ['ट','ठ','ड','ढ','ण','त','थ','द','ध','न'],
      ['प','फ','ब','भ','म','य','र','ल','व','श'],
      ['ष','स','ह','ा','ि','ी','ु','ू','े','ै'],
      ['ो','ौ','ं','ः','्','अ','आ','इ','ई','उ'],
    ],
  },
  ta: {
    label: 'தமிழ்',
    rows: [
      ['அ','ஆ','இ','ஈ','உ','ஊ','எ','ஏ','ஐ','ஒ'],
      ['ஓ','ஔ','க','ங','ச','ஞ','ட','ண','த','ந'],
      ['ப','ம','ய','ர','ல','வ','ழ','ள','ற','ன'],
      ['ா','ி','ீ','ு','ூ','ெ','ே','ை','ொ','ோ'],
      ['ௌ','்','ஃ','ஷ','ஸ','ஹ','க்','ச்','ட்','ன்'],
    ],
  },
  num: {
    label: '0-9',
    rows: [['1','2','3','4','5','6','7','8','9','0']],
  },
};

export default function AlphanumericTile({ entry, value = '', onChange, onSubmit, language, t }) {
  const [script, setScript] = useState('en');
  const [pasteMode, setPasteMode] = useState(false);
  const inputRef = useRef(null);
  const config = entry.inputConfig || {};
  const maxLen = config.length || 15;

  // Physical keyboard support (#4) — Latin chars, Backspace, Enter
  useEffect(() => {
    function handleKeyDown(e) {
      // Allow native input in paste mode
      if (pasteMode) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        onChange(value.slice(0, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        // Accept printable characters
        const ch = script === 'en' ? e.key.toUpperCase() : e.key;
        if (value.length < maxLen) onChange(value + ch);
      }
    }
    if (!pasteMode) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, maxLen, onChange, onSubmit, pasteMode, script]);

  function handleKey(k) {
    if (value.length < maxLen) onChange(value + k);
  }

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      onChange((value + text).slice(0, maxLen).toUpperCase());
    } catch {
      // Fall back to focusing the native input
      if (inputRef.current) inputRef.current.focus();
    }
  }

  const layout = LAYOUTS[script] || LAYOUTS.en;

  const tabBtn = (key, lbl) => (
    <button
      key={key}
      onClick={() => setScript(key)}
      style={{
        flex: 1, padding: '7px 4px', borderRadius: 8,
        border: `1.5px solid ${script === key ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
        background: script === key ? 'rgba(255,63,108,0.18)' : 'var(--myntra-card)',
        color: script === key ? 'var(--myntra-pink)' : 'var(--myntra-muted)',
        fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
      }}
    >{lbl}</button>
  );

  return (
    <div className="flex flex-col gap-4 w-full animate-slideUp">
      {/* Display */}
      <div style={{
        background: 'var(--myntra-surface)',
        border: `2px solid ${value ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
        borderRadius: 12, padding: '14px 18px', minHeight: 54,
        fontSize: '1.3rem', fontWeight: 600, letterSpacing: '0.1em',
        color: value ? 'var(--myntra-text)' : 'var(--myntra-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>{value || <span style={{ fontWeight: 400, fontSize: '0.9rem' }}>{maxLen} chars</span>}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--myntra-muted)', fontWeight: 400 }}>
          {value.length}/{maxLen}
        </span>
      </div>

      {/* Paste mode toggle (#3) */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="tile-btn"
          style={{
            flex: 1, fontSize: '0.85rem', minHeight: 38, padding: '6px 12px',
            borderColor: !pasteMode ? 'var(--myntra-pink)' : 'var(--myntra-border)',
            background: !pasteMode ? 'rgba(255,63,108,0.12)' : 'var(--myntra-card)',
          }}
          onClick={() => setPasteMode(false)}
        >
          ⌨️ Onscreen Keyboard
        </button>
        <button
          className="tile-btn"
          style={{
            flex: 1, fontSize: '0.85rem', minHeight: 38, padding: '6px 12px',
            borderColor: pasteMode ? 'var(--myntra-pink)' : 'var(--myntra-border)',
            background: pasteMode ? 'rgba(255,63,108,0.12)' : 'var(--myntra-card)',
          }}
          onClick={() => { setPasteMode(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        >
          📋 Type / Paste
        </button>
      </div>

      {pasteMode ? (
        /* Native text input — allows copy-paste, physical keyboard, all OS methods */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            maxLength={maxLen}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmit(); } }}
            placeholder={`Paste or type (max ${maxLen} chars)`}
            style={{
              background: 'var(--myntra-surface)',
              border: `2px solid ${value ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
              borderRadius: 12, padding: '14px 18px',
              fontSize: '1.1rem', color: 'var(--myntra-text)',
              width: '100%', outline: 'none', fontFamily: 'monospace', letterSpacing: '0.12em',
            }}
            autoFocus
          />
          <button
            className="tile-btn"
            style={{ fontSize: '0.85rem', minHeight: 38 }}
            onClick={handlePasteFromClipboard}
          >
            📋 Paste from clipboard
          </button>
        </div>
      ) : (
        <>
          {/* Script selector tabs (#8) */}
          <div style={{ display: 'flex', gap: 6 }}>
            {tabBtn('en', 'A–Z')}
            {tabBtn('num', '0–9')}
            {tabBtn('hi', 'हिंदी')}
            {tabBtn('ta', 'தமிழ்')}
          </div>

          {/* Key grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {layout.rows.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                {row.map((k) => (
                  <button
                    key={k}
                    className="key-btn"
                    style={{ width: script === 'num' ? 52 : 40, height: 42, fontSize: script === 'en' ? '0.88rem' : '1rem', borderRadius: 8, padding: 0 }}
                    onClick={() => handleKey(k)}
                  >
                    {k}
                  </button>
                ))}
              </div>
            ))}
            {/* Delete key */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
              <button
                className="key-btn"
                style={{ width: 80, height: 42, borderRadius: 8, borderColor: 'var(--myntra-error)', color: 'var(--myntra-error)', fontSize: '1rem' }}
                onClick={() => onChange(value.slice(0, -1))}
              >
                ⌫ Del
              </button>
            </div>
          </div>
        </>
      )}

      <button
        className="tile-btn primary w-full"
        onClick={onSubmit}
        disabled={value.length === 0}
      >
        {t('next')}
      </button>
    </div>
  );
}
