import { useEffect, useState } from 'react';
import { speak, cancel } from '../api/ttsProvider';

/**
 * AudioPlayer — plays question text via TTS stub.
 * Shows play/stop controls and a visual waveform indicator while playing.
 */
export default function AudioPlayer({ text, language, autoPlay = true }) {
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed]   = useState(false);

  useEffect(() => {
    if (autoPlay && text) {
      playAudio();
    }
    return () => cancel();
  }, [text, language]);

  async function playAudio() {
    if (playing) { cancel(); setPlaying(false); return; }
    setPlaying(true);
    try {
      await speak(text, language);
      setPlayed(true);
    } catch {
      // TTS not available — silent fail
    } finally {
      setPlaying(false);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        onClick={playAudio}
        style={{
          width: 44, height: 44, borderRadius: '50%',
          border: `2px solid ${playing ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
          background: playing ? 'rgba(255,63,108,0.18)' : 'var(--myntra-card)',
          cursor: 'pointer', fontSize: '1.2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease', flexShrink: 0,
        }}
        aria-label={playing ? 'Stop audio' : 'Play audio'}
      >
        {playing ? '⏹' : '🔊'}
      </button>

      {playing && (
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {[1,2,3,4,3,2].map((h, i) => (
            <div key={i} className="animate-pulse" style={{
              width: 4, height: h * 5,
              background: 'var(--myntra-pink)',
              borderRadius: 2,
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>
      )}
      {!playing && played && (
        <span style={{ color: 'var(--myntra-muted)', fontSize: '0.8rem' }}>▶ Replay</span>
      )}
    </div>
  );
}
