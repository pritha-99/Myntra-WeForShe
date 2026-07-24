import { useState, useRef } from 'react';
import { transcribe, isSupported, stop } from '../../api/sttProvider';
import { cancel } from '../../api/ttsProvider';

/**
 * VoiceInput — single unified text box with inline mic button.
 * #3: One textbox for typing; mic icon fills it via STT.
 * Supports desktop keyboard typing + voice capture.
 */
export default function VoiceInput({ entry, value = '', onChange, onSubmit, language, t }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  async function toggleListening() {
    cancel();
    if (listening) {
      stop();
      return;
    }
    if (!isSupported()) {
      setError(
        language === 'ta' ? 'உங்கள் உலாவியில் குரல் ஆதரவு இல்லை.' :
        language === 'hi' ? 'आपके ब्राउज़र में voice support नहीं है।' :
        'Voice input not supported in this browser.'
      );
      return;
    }
    setListening(true);
    setError(null);
    try {
      const baseText = value ? value + ' ' : '';
      const transcript = await transcribe(language, (text) => {
        onChange((baseText + text).trim());
      });
      onChange((baseText + transcript).trim());
    } catch (e) {
      setError(
        language === 'ta' ? 'குரல் பதிவு தோல்வி. மீண்டும் முயற்சிக்கவும்.' :
        language === 'hi' ? 'आवाज़ नहीं पकड़ी। दोबारा कोशिश करें।' :
        'Could not capture voice. Please try again.'
      );
    } finally {
      setListening(false);
      textareaRef.current?.focus();
    }
  }

  const placeholder =
    language === 'ta' ? 'உங்கள் பதிலை தட்டச்சு செய்யுங்கள் அல்லது மைக்ரோஃபோன் ஐகானை அழுத்தவும்...' :
    language === 'hi' ? 'यहाँ टाइप करें या माइक आइकन दबाएं...' :
    'Type your answer, or press the mic icon to speak...';

  return (
    <div className="flex flex-col gap-4 w-full animate-slideUp">
      {/* Unified input box with mic icon */}
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          style={{
            width: '100%',
            background: 'var(--myntra-surface)',
            border: `2px solid ${value ? 'var(--myntra-pink)' : listening ? 'var(--myntra-warning)' : 'var(--myntra-border)'}`,
            borderRadius: 14,
            padding: '16px 56px 16px 18px', // right padding for mic button
            fontSize: '1rem',
            color: 'var(--myntra-text)',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.65,
            transition: 'border-color 0.18s',
            minHeight: 120,
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--myntra-pink)'; }}
          onBlur={(e) => { e.target.style.borderColor = value ? 'var(--myntra-pink)' : 'var(--myntra-border)'; }}
        />

        {/* Mic icon — top-right corner of textarea */}
        <button
          onClick={toggleListening}
          title={listening ? t('listening') : t('tapToSpeak')}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 38, height: 38, borderRadius: '50%',
            background: listening ? 'rgba(255,63,108,0.25)' : 'var(--myntra-card)',
            border: `2px solid ${listening ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', transition: 'all 0.18s',
            boxShadow: listening ? '0 0 0 3px rgba(255,63,108,0.2)' : 'none',
          }}
          aria-label={t('tapToSpeak')}
        >
          {listening ? <span className="animate-pulse">🎙️</span> : '🎙️'}
        </button>
      </div>

      {/* Listening indicator */}
      {listening && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {[3,5,4,6,3,4,5].map((h, i) => (
              <div key={i} className="animate-pulse" style={{
                width: 3, height: h * 3, background: 'var(--myntra-pink)',
                borderRadius: 2, animationDelay: `${i * 0.08}s`,
              }} />
            ))}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--myntra-pink)' }}>{t('listening')}</span>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--myntra-error)', fontSize: '0.85rem' }}>{error}</p>
      )}

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
