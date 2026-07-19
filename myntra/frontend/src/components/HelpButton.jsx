import { useState, useRef, useEffect } from 'react';
import { chatWithGemini } from '../api/client';
import { speak, cancel } from '../api/ttsProvider';
import { transcribe, stop as stopTranscribe, isSupported as sttSupported } from '../api/sttProvider';

/**
 * HelpButton — Gemini 2.5 Flash powered chat panel.
 *
 * Fixes:
 *  - Listen: tracks speaking state per message id (not filtered index)
 *  - Enter key: stopPropagation on input keydown so global listeners can't fire onNext
 *  - Voice input: mic button calls transcribe() → sets input text
 */
export default function HelpButton({ entry, language, t, onEscalate }) {
  const [open, setOpen] = useState(false);
  // Each message: { id, role, content, speaking?, grounded? }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const msgIdRef = useRef(0);

  const questionText = entry.questionText?.[language] || entry.questionText?.en || '';

  function handleClose() {
    cancel();
    setOpen(false);
  }

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Load initial explanation when panel opens for the first time
  useEffect(() => {
    if (open && messages.length === 0 && entry.explainDocKey) {
      sendMessage(
        language === 'ta' ? `இந்த கேள்வியை விளக்கவும்: ${questionText}` :
        language === 'hi' ? `इस प्रश्न को समझाएं: ${questionText}` :
        `Explain this question to me: ${questionText}`,
        true
      );
    }
  }, [open]);

  async function sendMessage(userText, isAuto = false) {
    if (!userText.trim() || loading) return;
    setInput('');

    const newUserMsg = { id: ++msgIdRef.current, role: 'user', content: userText };
    const updatedMsgs = isAuto ? [newUserMsg] : [...messages, newUserMsg];
    setMessages(updatedMsgs);
    setLoading(true);

    try {
      const res = await chatWithGemini({
        explainDocKey: entry.explainDocKey,
        language,
        questionText,
        messages: updatedMsgs.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [
        ...prev,
        { id: ++msgIdRef.current, role: 'model', content: res.reply, grounded: res.grounded },
      ]);
      if (!res.grounded && onEscalate) onEscalate();
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: ++msgIdRef.current, role: 'model', content: t('errorGeneric'), grounded: false },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    sendMessage(input);
  }

  function handleKeyDown(e) {
    // Stop propagation so global keydown listeners (e.g. AlphanumericTile onSubmit) don't fire
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // --- Listen (TTS) ---
  async function speakMsg(msgId, content) {
    cancel();
    // Mark this message as speaking, clear others
    setMessages((prev) => prev.map((m) => ({ ...m, speaking: m.id === msgId })));
    try {
      await speak(content, language);
    } catch {
      // silently ignore TTS errors
    } finally {
      setMessages((prev) => prev.map((m) => ({ ...m, speaking: false })));
    }
  }

  // --- Voice input (STT) ---
  async function handleMic() {
    if (listening) return;
    setListening(true);
    try {
      const text = await transcribe(language);
      if (text) {
        setInput((prev) => (prev ? prev + ' ' + text : text));
        inputRef.current?.focus();
      }
    } catch (err) {
      console.warn('STT error:', err.message);
    } finally {
      setListening(false);
    }
  }

  function handleMicStop() {
    stopTranscribe(); // aborts the active recognition → transcribe() Promise resolves with ''
    setListening(false);
  }

  const hasStt = sttSupported();

  // Placeholder suggestions
  const SUGGESTIONS = {
    en: ['Why is this needed?', 'What happens if I skip?', 'Where can I find this?'],
    ta: ['இது ஏன் தேவை?', 'தவிர்த்தால் என்ன ஆகும்?', 'இதை எங்கே கண்டுபிடிப்பேன்?'],
    hi: ['यह क्यों जरूरी है?', 'छोड़ने पर क्या होगा?', 'यह कहाँ मिलेगा?'],
  };
  const suggestions = SUGGESTIONS[language] || SUGGESTIONS.en;

  return (
    <>
      {/* Help trigger button */}
      <button
        onClick={() => setOpen(true)}
        title={t('help')}
        style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '2px solid var(--myntra-border)',
          background: open ? 'rgba(255,63,108,0.15)' : 'var(--myntra-card)',
          cursor: 'pointer', fontSize: '1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
          borderColor: open ? 'var(--myntra-pink)' : 'var(--myntra-border)',
        }}
        aria-label={t('help')}
      >
        ❓
      </button>

      {/* Chat drawer */}
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 400,
            display: 'flex', alignItems: 'stretch',
          }}
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} />

          {/* Panel */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 420, maxWidth: '92vw',
              background: 'var(--myntra-surface)',
              borderLeft: '1px solid var(--myntra-border)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
              animation: 'slideRight 0.25s ease',
            }}
          >
            {/* Panel header */}
            <div style={{
              padding: '18px 20px',
              borderBottom: '1px solid var(--myntra-border)',
              display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--myntra-pink), #ff7eb3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', flexShrink: 0,
              }}>✨</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {language === 'ta' ? 'உதவி அரட்டை' : language === 'hi' ? 'सहायता चैट' : 'Help Chat'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--myntra-muted)' }}>
                  Powered by Gemini 2.5 Flash
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--myntra-muted)', padding: '4px 8px' }}
              >✕</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.length === 0 && loading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,63,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>✨</div>
                  <div style={{ background: 'var(--myntra-card)', borderRadius: '0 12px 12px 12px', padding: '10px 14px' }}>
                    <span className="animate-pulse" style={{ color: 'var(--myntra-muted)', fontSize: '0.9rem' }}>
                      {language === 'ta' ? 'சிந்திக்கிறது...' : language === 'hi' ? 'सोच रहा हूँ...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              )}

              {messages
                .filter((m, i) => !(m.role === 'user' && i === 0))  // hide auto-opener user msg
                .map((msg) => {
                  const isModel = msg.role === 'model';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex', flexDirection: isModel ? 'row' : 'row-reverse', gap: 8, alignItems: 'flex-start',
                      }}
                    >
                      {isModel && (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,63,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>✨</div>
                      )}
                      <div style={{
                        maxWidth: '80%',
                        background: isModel ? 'var(--myntra-card)' : 'rgba(255,63,108,0.15)',
                        border: `1px solid ${isModel ? 'var(--myntra-border)' : 'rgba(255,63,108,0.3)'}`,
                        borderRadius: isModel ? '0 12px 12px 12px' : '12px 0 12px 12px',
                        padding: '10px 14px',
                      }}>
                        <p style={{ fontSize: '0.88rem', lineHeight: 1.65, margin: 0, color: msg.grounded === false ? 'var(--myntra-muted)' : 'var(--myntra-text)' }}>
                          {msg.content}
                        </p>
                        {isModel && (
                          <button
                            onClick={() => speakMsg(msg.id, msg.content)}
                            style={{
                              marginTop: 6, background: 'none', border: 'none', cursor: 'pointer',
                              fontSize: '0.75rem', color: msg.speaking ? 'var(--myntra-pink)' : 'var(--myntra-muted)',
                              padding: 0, display: 'flex', alignItems: 'center', gap: 4,
                            }}
                          >
                            {msg.speaking ? '🔊 Playing...' : '🔊 Listen'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

              {loading && messages.length > 0 && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,63,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>✨</div>
                  <div style={{ background: 'var(--myntra-card)', borderRadius: '0 12px 12px 12px', padding: '10px 14px' }}>
                    <span className="animate-pulse" style={{ color: 'var(--myntra-muted)', fontSize: '0.9rem' }}>
                      {language === 'ta' ? 'சிந்திக்கிறது...' : language === 'hi' ? 'सोच रहा हूँ...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestion chips */}
            {messages.length <= 1 && !loading && (
              <div style={{ padding: '0 16px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: '0.78rem',
                      border: '1px solid var(--myntra-border)', background: 'var(--myntra-card)',
                      color: 'var(--myntra-subtext)', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.target.style.borderColor = 'var(--myntra-pink)'; e.target.style.color = 'var(--myntra-pink)'; }}
                    onMouseLeave={(e) => { e.target.style.borderColor = 'var(--myntra-border)'; e.target.style.color = 'var(--myntra-subtext)'; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div style={{
              padding: '12px 16px', borderTop: '1px solid var(--myntra-border)',
              display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0,
            }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  language === 'ta' ? 'கேள்வி கேளுங்கள்...' :
                  language === 'hi' ? 'सवाल पूछें...' :
                  'Ask a follow-up question...'
                }
                disabled={loading}
                style={{
                  flex: 1, background: 'var(--myntra-card)',
                  border: '1.5px solid var(--myntra-border)',
                  borderRadius: 10, padding: '10px 14px',
                  fontSize: '0.88rem', color: 'var(--myntra-text)',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--myntra-pink)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--myntra-border)'; }}
                autoFocus
              />

              {/* Mic button — toggles between start and stop */}
              {hasStt && (
                <button
                  onClick={listening ? handleMicStop : handleMic}
                  disabled={loading}
                  title={listening ? 'Stop listening' : 'Speak your question'}
                  style={{
                    height: 40, borderRadius: 10, flexShrink: 0,
                    padding: listening ? '0 10px' : '0',
                    width: listening ? 'auto' : 40,
                    background: listening ? 'rgba(255,63,108,0.2)' : 'var(--myntra-card)',
                    border: `1.5px solid ${listening ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: listening ? '0.78rem' : '1.1rem',
                    fontWeight: 700,
                    color: listening ? 'var(--myntra-pink)' : 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    transition: 'all 0.18s',
                    animation: listening ? 'pulse 1s infinite' : 'none',
                  }}
                >
                  {listening ? <>⏹ Stop</> : '🎤'}
                </button>
              )}

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: input.trim() && !loading ? 'var(--myntra-pink)' : 'var(--myntra-card)',
                  border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s',
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
