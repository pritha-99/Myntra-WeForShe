import { useState, useRef, useEffect } from 'react';
import { chatWithGemini } from '../api/client';
import { speak, cancel } from '../api/ttsProvider';
import { transcribe, stop as stopTranscribe, isSupported as sttSupported } from '../api/sttProvider';

export default function MiaChat({ entry, language, t, onEscalate }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const msgIdRef = useRef(0);

  const questionText = entry?.questionText?.[language] || entry?.questionText?.en || '';

  function handleClose() {
    cancel();
    setOpen(false);
  }

  // Auto-scroll
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  async function sendMessage(userText, isAuto = false) {
    if (!userText.trim() || loading) return;
    setInput('');

    const newUserMsg = { id: ++msgIdRef.current, role: 'user', content: userText };
    const updatedMsgs = isAuto ? [newUserMsg] : [...messages, newUserMsg];
    setMessages(updatedMsgs);
    setLoading(true);

    try {
      const res = await chatWithGemini({
        explainDocKey: entry?.explainDocKey, // might be undefined, that's okay
        language,
        questionText,
        messages: updatedMsgs.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [
        ...prev,
        { id: ++msgIdRef.current, role: 'model', content: res.reply, grounded: res.grounded },
      ]);
      if (res.grounded === false && onEscalate) onEscalate();
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: ++msgIdRef.current, role: 'model', content: t('errorGeneric') || 'Something went wrong.', grounded: false },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    sendMessage(input);
  }

  function handleKeyDown(e) {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // TTS
  async function speakMsg(msgId, content) {
    cancel();
    setMessages((prev) => prev.map((m) => ({ ...m, speaking: m.id === msgId })));
    try {
      await speak(content, language);
    } catch {} finally {
      setMessages((prev) => prev.map((m) => ({ ...m, speaking: false })));
    }
  }

  // STT
  async function handleMic() {
    cancel();
    if (listening) return;
    setListening(true);
    try {
      const text = await transcribe(language);
      if (text) {
        setInput((prev) => (prev ? prev + ' ' + text : text));
        inputRef.current?.focus();
      }
    } catch (err) {
      console.warn('STT error:', err);
    } finally {
      setListening(false);
    }
  }

  function handleMicStop() {
    stopTranscribe();
    setListening(false);
  }

  const hasStt = sttSupported();

  const SUGGESTIONS = {
    en: ['How do I fill this?', 'What is this step for?'],
    ta: ['இதை எப்படி நிரப்புவது?', 'இந்த படி எதற்காக?'],
    hi: ['इसे कैसे भरें?', 'यह कदम किस लिए है?'],
  };
  const suggestions = SUGGESTIONS[language] || SUGGESTIONS.en;

  const miaGreeting = language === 'ta' ? 'வணக்கம்! நான் மியா (Mia), உங்கள் உதவி பாட்.' :
                      language === 'hi' ? 'नमस्ते! मैं मिया (Mia) हूँ, आपकी सहायता बॉट।' :
                      'Hi! I am Mia, your AI Assistant.';

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
      
      {/* Maximized chat window */}
      {open && (
        <div style={{
          width: 380, height: 550, maxHeight: 'calc(100vh - 100px)',
          background: 'var(--myntra-surface)', border: '1px solid var(--myntra-border)',
          borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideUp 0.3s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px', background: 'linear-gradient(135deg, var(--myntra-pink), #ff7eb3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', color: 'var(--myntra-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>M</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}>Mia</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>AI Assistant</div>
              </div>
            </div>
            <button onClick={handleClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
          </div>

          {/* Messages body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--myntra-dark)' }}>
            
            {/* Initial Greeting */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,63,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>✨</div>
              <div style={{ maxWidth: '80%', background: 'var(--myntra-card)', border: '1px solid var(--myntra-border)', borderRadius: '0 12px 12px 12px', padding: '10px 14px' }}>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.65, margin: 0, color: 'var(--myntra-text)' }}>{miaGreeting}</p>
              </div>
            </div>

            {messages.map((msg) => {
              const isModel = msg.role === 'model';
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: isModel ? 'row' : 'row-reverse', gap: 8, alignItems: 'flex-start' }}>
                  {isModel && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,63,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>✨</div>
                  )}
                  <div style={{ maxWidth: '80%', background: isModel ? 'var(--myntra-card)' : 'rgba(255,63,108,0.15)', border: `1px solid ${isModel ? 'var(--myntra-border)' : 'rgba(255,63,108,0.3)'}`, borderRadius: isModel ? '0 12px 12px 12px' : '12px 0 12px 12px', padding: '10px 14px' }}>
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.65, margin: 0, color: msg.grounded === false ? 'var(--myntra-muted)' : 'var(--myntra-text)' }}>{msg.content}</p>
                    {isModel && (
                      <button onClick={() => speakMsg(msg.id, msg.content)} style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: msg.speaking ? 'var(--myntra-pink)' : 'var(--myntra-muted)', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {msg.speaking ? '🔊 Playing...' : '🔊 Listen'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {loading && (
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
          {messages.length === 0 && !loading && (
            <div style={{ padding: '8px 16px', display: 'flex', gap: 6, flexWrap: 'wrap', background: 'var(--myntra-dark)' }}>
              {suggestions.map((s) => (
                <button key={s} onClick={() => sendMessage(s)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: '0.78rem', border: '1px solid var(--myntra-border)', background: 'var(--myntra-card)', color: 'var(--myntra-subtext)', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--myntra-border)', display: 'flex', gap: 8, alignItems: 'center', background: 'var(--myntra-surface)' }}>
            <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={language === 'ta' ? 'கேள்வி கேளுங்கள்...' : language === 'hi' ? 'सवाल पूछें...' : 'Ask Mia...'} disabled={loading} style={{ flex: 1, background: 'var(--myntra-card)', border: '1.5px solid var(--myntra-border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.88rem', color: 'var(--myntra-text)', outline: 'none' }} />
            
            {hasStt && (
              <button onClick={listening ? handleMicStop : handleMic} disabled={loading} style={{ height: 40, borderRadius: 10, padding: listening ? '0 10px' : '0', width: listening ? 'auto' : 40, background: listening ? 'rgba(255,63,108,0.2)' : 'var(--myntra-card)', border: `1.5px solid ${listening ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`, cursor: loading ? 'not-allowed' : 'pointer', fontSize: listening ? '0.78rem' : '1.1rem', fontWeight: 700, color: listening ? 'var(--myntra-pink)' : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {listening ? <>⏹</> : '🎤'}
              </button>
            )}

            <button onClick={handleSend} disabled={!input.trim() || loading} style={{ width: 40, height: 40, borderRadius: 10, background: input.trim() && !loading ? 'var(--myntra-pink)' : 'var(--myntra-card)', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Minimized Panel */}
      {!open && (
        <div 
          onClick={() => setOpen(true)}
          style={{
            background: 'var(--myntra-surface)', border: '1px solid var(--myntra-border)',
            padding: '12px 20px', borderRadius: 24, display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
          }}
        >
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--myntra-pink), #ff7eb3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>M</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--myntra-text)' }}>Chat with Mia ✨</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--myntra-muted)' }}>AI Assistant</span>
          </div>
        </div>
      )}

    </div>
  );
}
