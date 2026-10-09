import React, { useState } from 'react';
import { detectiveAudio } from '../../services/audioService';
import { MessageSquare, Shield, AlertTriangle, Smartphone, Lock, Unlock, Search } from 'lucide-react';

const MessagesTab = ({ messages }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [decodedCodes, setDecodedCodes] = useState([]);

  const platforms = ['all', 'WhatsApp', 'Signal', 'SMS'];

  const filteredMessages = messages.filter((m) => {
    if (selectedPlatform === 'all') return true;
    return m.platform.toLowerCase() === selectedPlatform.toLowerCase();
  });

  const toggleDecode = (id) => {
    detectiveAudio.playTypewriter();
    if (decodedCodes.includes(id)) {
      setDecodedCodes(decodedCodes.filter(i => i !== id));
    } else {
      setDecodedCodes([...decodedCodes, id]);
    }
  };

  return (
    <div>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="stamp-classified">DIGITAL INTERCEPTS</span>
          <h3 style={{ fontSize: '1.6rem', color: '#FFF', margin: '0.4rem 0 0.2rem' }}>
            Extracted Communications & Encrypted Threads
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Forensic dumps from suspect smartphones recovered at Blackwood Manor.
          </p>
        </div>

        {/* Platform filter buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => {
                detectiveAudio.playClick();
                setSelectedPlatform(p);
              }}
              className={selectedPlatform === p ? 'btn-gold' : 'btn-ghost'}
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', textTransform: 'capitalize' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List / Messenger View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '850px', margin: '0 auto' }}>
        {filteredMessages.map((msg) => {
          const isDecoded = decodedCodes.includes(msg.id);
          const isSignal = msg.platform.toLowerCase() === 'signal';

          return (
            <div
              key={msg.id}
              className="noir-card"
              style={{
                padding: '1.5rem',
                borderLeft: msg.is_suspicious ? '4px solid #EF4444' : '4px solid #38BDF8'
              }}
            >
              
              {/* Header Info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Smartphone size={16} color={msg.is_suspicious ? '#EF4444' : '#38BDF8'} />
                  <span style={{ fontSize: '0.82rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                    {msg.platform} Thread
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#D4AF37', fontFamily: 'var(--font-mono)' }}>
                    {msg.timestamp_str}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {msg.is_suspicious && (
                    <span className="badge-tag badge-red" style={{ fontSize: '0.7rem' }}>
                      <AlertTriangle size={12} /> High Suspicion
                    </span>
                  )}
                  {isSignal && (
                    <span className="badge-tag badge-blue" style={{ fontSize: '0.7rem' }}>
                      <Lock size={12} /> Encrypted
                    </span>
                  )}
                </div>
              </div>

              {/* Sender & Receiver */}
              <div style={{ fontSize: '0.9rem', color: '#E2E8F0', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <strong style={{ color: '#F1F5F9' }}>{msg.sender}</strong>
                <span style={{ color: '#64748B' }}>➔</span>
                <span style={{ color: '#94A3B8' }}>{msg.receiver}</span>
              </div>

              {/* Chat Bubble Content */}
              <div style={{
                background: isSignal ? '#070C16' : 'rgba(9, 13, 21, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                color: '#F8FAFC',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                fontFamily: isSignal ? 'var(--font-mono)' : 'var(--font-sans)',
                position: 'relative'
              }}>
                {msg.content}
              </div>

              {/* If Encrypted Signal: Provide Decoder Toggle Mini-Tool */}
              {isSignal && (
                <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    SHA-256 Verified Message Header: <span style={{ fontFamily: 'var(--font-mono)', color: '#D4AF37' }}>0x7A9F...</span>
                  </span>
                  <button
                    onClick={() => toggleDecode(msg.id)}
                    className="btn-ghost"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    {isDecoded ? <Lock size={13} /> : <Unlock size={13} />} {isDecoded ? 'Mask Metadata' : 'Examine Origin IP'}
                  </button>
                </div>
              )}

              {isDecoded && isSignal && (
                <div style={{
                  marginTop: '0.75rem',
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px dashed #D4AF37',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontSize: '0.8rem',
                  color: '#FDE68A',
                  fontFamily: 'var(--font-mono)',
                  animation: 'fadeIn 0.25s ease'
                }}>
                  📡 <strong>Cell Tower Triangulation:</strong> Originating cellular IP traced to West Wing Service Corridor router at Blackwood Manor at 7:12 PM.
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default MessagesTab;
