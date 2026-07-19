import { useState, useRef } from 'react';
import { transcribe, stop as stopTranscribe, isSupported as sttSupported } from '../../api/sttProvider';

/**
 * EmailInput — text input with mic dictation for email addresses.
 * Props: entry, value, onChange, onSubmit, language, t
 */
export default function EmailInput({ entry, value = '', onChange, onSubmit, language, t }) {
  const config = entry.inputConfig || {};
  const placeholder = config.placeholder || 'example@email.com';
  const maxLen = config.maxLength || 100;
  
  const [listening, setListening] = useState(false);
  const inputRef = useRef(null);
  
  const hasStt = sttSupported();

  async function handleMic() {
    if (listening) return;
    setListening(true);
    try {
      const text = await transcribe(language);
      if (text) {
        // Simple heuristic to remove spaces and replace "at" / "dot"
        const formatted = text.toLowerCase().replace(/\s+/g, '').replace(/at/g, '@').replace(/dot/g, '.');
        onChange(formatted);
        inputRef.current?.focus();
      }
    } catch (err) {
      console.warn('STT error:', err.message);
    } finally {
      setListening(false);
    }
  }

  function handleMicStop() {
    stopTranscribe();
    setListening(false);
  }

  return (
    <div className="flex flex-col gap-5 w-full animate-slideUp">
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          ref={inputRef}
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLen}
          style={{
            flex: 1,
            background: 'var(--myntra-surface)',
            border: `2px solid ${value ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
            borderRadius: 12,
            padding: '16px 20px',
            fontSize: '1rem',
            color: 'var(--myntra-text)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--myntra-pink)'; }}
          onBlur={(e) => { e.target.style.borderColor = value ? 'var(--myntra-pink)' : 'var(--myntra-border)'; }}
        />
        
        {hasStt && (
          <button
            onClick={listening ? handleMicStop : handleMic}
            title={listening ? 'Stop listening' : 'Dictate email'}
            style={{
              height: 54, borderRadius: 12, flexShrink: 0,
              padding: listening ? '0 12px' : '0',
              width: listening ? 'auto' : 54,
              background: listening ? 'rgba(255,63,108,0.2)' : 'var(--myntra-card)',
              border: `2px solid ${listening ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
              cursor: 'pointer',
              fontSize: listening ? '0.85rem' : '1.3rem',
              fontWeight: 700,
              color: listening ? 'var(--myntra-pink)' : 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.18s',
              animation: listening ? 'pulse 1s infinite' : 'none',
            }}
          >
            {listening ? <>⏹ Stop</> : '🎤'}
          </button>
        )}
      </div>

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
