import React, { useState } from 'react';
import { assistantAPI } from '../../services/api';
import { detectiveAudio } from '../../services/audioService';
import { Terminal, Send, Sparkles, X, Bot, User, Clock, HelpCircle } from 'lucide-react';

const AIAssistantModal = ({ caseId, progress, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Good evening, Detective. I am the Inspector’s Forensic Advisor. I will analyze your case file and provide progressive investigative guidance without spoiling the solution. What would you like to examine?',
      time: 'Just now'
    }
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const presetQuestions = [
    'Who should I investigate next?',
    'Is Julian lying about his alibi?',
    'Are Marcus’s fingerprints real proof of theft?',
    'Where can I find hidden clues in the manor?'
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim() || loading) return;

    detectiveAudio.playTypewriter();
    const userMsg = {
      role: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await assistantAPI.askAssistant(caseId, textToSend, progress);
      detectiveAudio.playDiscovery();
      const botMsg = {
        role: 'assistant',
        text: res.reply || 'Check the CCTV timeline around 8:16 PM carefully.',
        time: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('AI assistant error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Forensic communications are busy. Cross-examine the suspect alibis against the 8:16 PM corridor CCTV.',
          time: 'Now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', height: '82vh' }}>
        
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(14, 19, 30, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1.5px solid #A855F7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Terminal size={20} color="#C084FC" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#FFF', margin: 0 }}>
                Inspector’s AI Detective Assistant
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#C084FC' }}>
                Progressive Forensic Deduction Guide
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Chat History Box */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m, idx) => {
            const isBot = m.role === 'assistant';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignSelf: isBot ? 'flex-start' : 'flex-end',
                  maxWidth: '85%'
                }}
              >
                {isBot && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={18} color="#C084FC" />
                  </div>
                )}

                <div>
                  <div style={{
                    background: isBot ? 'rgba(20, 28, 43, 0.9)' : 'linear-gradient(135deg, #D4AF37 0%, #B89025 100%)',
                    color: isBot ? '#F1F5F9' : '#0B0E14',
                    border: isBot ? '1px solid rgba(212, 175, 55, 0.2)' : 'none',
                    borderRadius: isBot ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
                    padding: '0.9rem 1.15rem',
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    fontWeight: isBot ? 400 : 600,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}>
                    {m.text}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.25rem', textAlign: isBot ? 'left' : 'right' }}>
                    {m.time}
                  </div>
                </div>

                {!isBot && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} color="#D4AF37" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', color: '#C084FC', fontSize: '0.85rem' }}>
              <Bot size={16} /> <span>Analyzing forensic case files...</span>
            </div>
          )}
        </div>

        {/* Preset Question Pills */}
        <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(9, 13, 21, 0.8)' }}>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>
            Quick Investigative Prompts
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.3rem' }}>
            {presetQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="btn-ghost"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', whiteSpace: 'nowrap' }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(212, 175, 55, 0.15)',
            display: 'flex',
            gap: '0.75rem',
            background: 'rgba(14, 19, 30, 0.98)'
          }}
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the Inspector for investigative guidance..."
            className="noir-input"
            style={{ fontSize: '0.9rem' }}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="btn-gold"
            style={{ padding: '0.75rem 1.25rem' }}
          >
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
};

export default AIAssistantModal;
