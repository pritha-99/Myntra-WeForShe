import { useState, useRef, useEffect } from 'react';
import { chatWithGemini } from '../api/client';
import { speak, cancel } from '../api/ttsProvider';

/**
 * HelpButton — Gemini 2.5 Flash powered chat panel.
 * Opens as a right-side drawer showing multi-turn conversation.
 * User can ask follow-up questions. Each AI reply has a speak button.
 * Audio stops when the panel closes (#6).
 */
export default function HelpButton({ entry, language, t, onEscalate }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // {role:'user'|'model', content:string, speaking?:bool}
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const questionText = entry.questionText?.[language] || entry.questionText?.en || '';

  function handleClose() {
    cancel(); // stop any playing audio (#6)
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
        true // is auto-opener
      );
    }
  }, [open]);

  async function sendMessage(userText, isAuto = false) {
    if (!userText.trim() || loading) return;
    setInput('');

    const newUserMsg = { role: 'user', content: userText };
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
      setMessages((prev) => [...prev, { role: 'model', content: res.reply, grounded: res.grounded }]);
      if (!res.grounded && onEscalate) onEscalate();
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'model',
        content: t('errorGeneric'),
        grounded: false,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    sendMessage(input);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function speakMsg(content, idx) {
    cancel();
    setMessages((prev) => prev.map((m, i) => ({ ...m, speaking: i === idx })));
    try {
      await speak(content, language);
    } finally {
      setMessages((prev) => prev.map((m) => ({ ...m, speaking: false })));
    }
  }

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

              {messages.filter((m) => m.role !== 'user' || messages.indexOf(m) > 0).map((msg, idx) => {
                const isModel = msg.role === 'model';
                if (!isModel && idx === 0) return null; // hide auto-opener user msg
                return (
                  <div
                    key={idx}
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
                          onClick={() => speakMsg(msg.content, idx)}
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
              display: 'flex', gap: 8, flexShrink: 0,
            }}>
              <input
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
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: input.trim() && !loading ? 'var(--myntra-pink)' : 'var(--myntra-card)',
                  border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s', flexShrink: 0,
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
