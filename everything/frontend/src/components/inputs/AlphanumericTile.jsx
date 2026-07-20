import { useRef } from 'react';

/**
 * AlphanumericTile — single unified text box.
 * - Type directly / paste from clipboard / device keyboard
 * - Onscreen keyboard appends characters to the same box
 * - Script-switchable onscreen keyboard (A-Z, 0-9, Hindi, Tamil)
 */

const LAYOUTS = {
  en: {
    label: 'A–Z',
    rows: [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L'],
      ['Z','X','C','V','B','N','M'],
    ],
  },
  num: {
    label: '0–9',
    rows: [['1','2','3','4','5','6','7','8','9','0']],
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
};

import { useState } from 'react';

export default function AlphanumericTile({ entry, value = '', onChange, onSubmit, language, t }) {
  const [script, setScript] = useState('en');
  const inputRef = useRef(null);
  const config = entry.inputConfig || {};
  const maxLen = config.length || 15;

  const layout = LAYOUTS[script] || LAYOUTS.en;

  function appendKey(k) {
    if (value.length < maxLen) {
      onChange(value + k);
    }
    // Keep focus on the input so the user can keep typing
    inputRef.current?.focus();
  }

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

      {/* Single input box — type, paste, or use onscreen keyboard */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        maxLength={maxLen}
        autoFocus
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmit(); } }}
        placeholder={`Type, paste, or use keyboard below (max ${maxLen})`}
        style={{
          background: 'var(--myntra-surface)',
          border: `2px solid ${value ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
          borderRadius: 12, padding: '14px 18px',
          fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.12em',
          color: 'var(--myntra-text)', outline: 'none',
          fontFamily: 'monospace', width: '100%',
          boxSizing: 'border-box',
        }}
      />

      {/* Character count */}
      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--myntra-muted)', marginTop: -12 }}>
        {value.length}/{maxLen}
      </div>

      {/* Script selector tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {tabBtn('en', 'A–Z')}
        {tabBtn('num', '0–9')}
        {tabBtn('hi', 'हिंदी')}
        {tabBtn('ta', 'தமிழ்')}
      </div>

      {/* Onscreen keyboard grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {layout.rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            {row.map((k) => (
              <button
                key={k}
                className="key-btn"
                style={{
                  width: script === 'num' ? 52 : 40,
                  height: 42,
                  fontSize: script === 'en' ? '0.88rem' : '1rem',
                  borderRadius: 8,
                  padding: 0,
                }}
                onMouseDown={(e) => {
                  // Prevent input from losing focus when clicking keyboard keys
                  e.preventDefault();
                  appendKey(k);
                }}
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
            style={{
              width: 80, height: 42, borderRadius: 8,
              borderColor: 'var(--myntra-error)',
              color: 'var(--myntra-error)',
              fontSize: '1rem',
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              onChange(value.slice(0, -1));
              inputRef.current?.focus();
            }}
          >
            ⌫ Del
          </button>
        </div>
      </div>

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
