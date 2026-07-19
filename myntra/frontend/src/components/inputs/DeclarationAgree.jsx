import { useState } from 'react';
import { speak, cancel } from '../../api/ttsProvider';

/**
 * DeclarationAgree — Terms & Conditions with optional audio.
 * #4: Audio is NOT auto-played. User clicks "Listen" to hear it.
 * "I agree" button is always enabled — audio is an option, not a gate.
 */
export default function DeclarationAgree({ entry, declarationText, value, onChange, onSubmit, language, t }) {
  const [playing, setPlaying]   = useState(false);
  const [played, setPlayed]     = useState(false);

  async function handlePlayAudio() {
    if (playing) {
      cancel();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    try {
      await speak(declarationText, language);
      setPlayed(true);
    } catch {
      // TTS not available — silent fail
    } finally {
      setPlaying(false);
    }
  }

  const listenLabel =
    language === 'ta' ? (playing ? '⏹ நிறுத்து' : played ? '🔊 மீண்டும் கேளுங்கள்' : '🔊 அறிவிப்பை கேளுங்கள்') :
    language === 'hi' ? (playing ? '⏹ रोकें' : played ? '🔊 फिर से सुनें' : '🔊 घोषणा सुनें') :
    playing ? '⏹ Stop' : played ? '🔊 Listen again' : '🔊 Listen to declaration';

  return (
    <div className="flex flex-col gap-5 w-full animate-slideUp">
      {/* Scrollable declaration text */}
      <div className="scrollable" style={{
        background: 'var(--myntra-surface)',
        border: '2px solid var(--myntra-border)',
        borderRadius: 14, padding: '18px 22px',
        maxHeight: 280, fontSize: '0.92rem', lineHeight: 1.8,
        color: 'var(--myntra-subtext)',
      }}>
        {declarationText || (
          <span style={{ color: 'var(--myntra-muted)', fontStyle: 'italic' }}>
            {language === 'ta' ? 'விதிமுறைகள் ஏற்றுகிறது...' :
             language === 'hi' ? 'शर्तें लोड हो रही हैं...' :
             'Loading terms and conditions...'}
          </span>
        )}
      </div>

      {/* Audio option — prominent but voluntary */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(255,63,108,0.06)',
        border: `1.5px solid ${playing ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
        borderRadius: 12, padding: '12px 16px',
        transition: 'border-color 0.2s',
      }}>
        <button
          onClick={handlePlayAudio}
          style={{
            width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
            background: playing ? 'var(--myntra-pink)' : 'var(--myntra-card)',
            border: `2px solid ${playing ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
            cursor: 'pointer', fontSize: '1.2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', boxShadow: playing ? '0 0 0 4px rgba(255,63,108,0.18)' : 'none',
          }}
          aria-label={listenLabel}
        >
          {playing ? <span className="animate-pulse">🔊</span> : '🔊'}
        </button>
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{listenLabel}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--myntra-muted)' }}>
            {language === 'ta' ? 'விருப்பமான — படிக்கவும் அல்லது கேட்கவும்' :
             language === 'hi' ? 'वैकल्पिक — पढ़ें या सुनें' :
             'Optional — you may read or listen'}
          </p>
        </div>
        {playing && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 3, alignItems: 'center' }}>
            {[3,5,6,4,5,3].map((h, i) => (
              <div key={i} className="animate-pulse" style={{
                width: 3, height: h * 3, background: 'var(--myntra-pink)',
                borderRadius: 2, animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Agree button — always enabled, not gated by audio */}
      <button
        className="tile-btn primary"
        onClick={() => { onChange('agreed'); onSubmit(); }}
        style={{ fontSize: '1rem', padding: '16px', fontWeight: 700 }}
      >
        ✅ {t('agreeAndSubmit')}
      </button>
    </div>
  );
}
