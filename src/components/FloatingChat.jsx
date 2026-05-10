import React, { useState, useRef, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your FlowPOS assistant. How can I help?" }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chat`, { // ✅ fixed URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '24px',
          width: '340px', height: '460px',
          background: '#1e1e3a', border: '0.5px solid rgba(255,255,255,0.12)',
          borderRadius: '16px', display: 'flex', flexDirection: 'column',
          zIndex: 9998, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{
            background: '#7c3aed', padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px'
              }}>✦</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Flow Assistant</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                  Online · Powered by Groq
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
              fontSize: '18px', cursor: 'pointer', padding: '4px'
            }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '8px 12px', borderRadius: '12px',
                  fontSize: '13px', lineHeight: 1.5,
                  background: m.role === 'user' ? '#7c3aed' : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  borderBottomRightRadius: m.role === 'user' ? '3px' : '12px',
                  borderBottomLeftRadius: m.role === 'assistant' ? '3px' : '12px',
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', gap: '4px', padding: '8px 12px' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.4)',
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px', borderTop: '0.5px solid rgba(255,255,255,0.08)',
            display: 'flex', gap: '8px', alignItems: 'center'
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              style={{
                flex: 1, background: 'rgba(255,255,255,0.07)',
                border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '20px',
                padding: '8px 14px', fontSize: '13px', color: '#fff', outline: 'none'
              }}
            />
            <button onClick={handleSend} disabled={loading} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: loading ? 'rgba(124,58,237,0.5)' : '#7c3aed',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', flexShrink: 0, transition: 'background 0.2s'
            }}>➤</button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button onClick={() => setOpen(o => !o)} style={{
        position: 'fixed', bottom: '24px', right: '24px',
        width: '56px', height: '56px', borderRadius: '50%',
        background: '#7c3aed', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', zIndex: 9999,
        boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
        transition: 'transform 0.2s'
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? '✕' : '💬'}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}