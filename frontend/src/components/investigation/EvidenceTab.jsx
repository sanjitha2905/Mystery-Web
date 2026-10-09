import React, { useState } from 'react';
import { evidenceAPI } from '../../services/api';
import { detectiveAudio } from '../../services/audioService';
import { 
  Camera, FileText, MessageCircle, Package, Eye, 
  ZoomIn, Sparkles, AlertTriangle, CheckCircle, X, 
  Search, Shield, Key, Sun, Lock 
} from 'lucide-react';

const EvidenceTab = ({ evidence, caseId, progress, onProgressUpdate }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [uvMode, setUvMode] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [discoveredAlert, setDiscoveredAlert] = useState(null);

  const filterTypes = [
    { id: 'all', label: 'All Evidence' },
    { id: 'photograph', label: 'Photographs', icon: Camera },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'object', label: 'Physical Objects', icon: Package },
    { id: 'message', label: 'Communications', icon: MessageCircle },
    { id: 'hidden', label: 'Hidden Clues', icon: Eye }
  ];

  const filteredEvidence = evidence.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'hidden') return item.is_hidden;
    return item.type === activeFilter;
  });

  const isDiscovered = (code) => {
    return (progress?.clues_found || []).includes(code);
  };

  const isHiddenDiscovered = (code) => {
    return (progress?.hidden_clues_found || []).includes(code);
  };

  const openInspection = (item) => {
    detectiveAudio.playClick();
    setSelectedEvidence(item);
    setUvMode(false);
    setZoomed(false);
    setDiscoveredAlert(null);
  };

  const closeInspection = () => {
    detectiveAudio.playClick();
    setSelectedEvidence(null);
    setDiscoveredAlert(null);
  };

  const triggerHiddenDiscovery = async (item) => {
    detectiveAudio.playDiscovery();
    try {
      const res = await evidenceAPI.discoverHidden(caseId, item.code);
      if (res.success) {
        setDiscoveredAlert({
          message: res.message,
          points: res.pointsAwarded
        });
        if (onProgressUpdate) {
          onProgressUpdate();
        }
      }
    } catch (err) {
      console.error('Failed to register hidden discovery:', err);
    }
  };

  const handleToggleUV = (item) => {
    detectiveAudio.playClick();
    const next = !uvMode;
    setUvMode(next);
    if (next && item.is_hidden && !isHiddenDiscovered(item.code)) {
      triggerHiddenDiscovery(item);
    }
  };

  const handleToggleZoom = (item) => {
    detectiveAudio.playClick();
    const next = !zoomed;
    setZoomed(next);
    if (next && item.is_hidden && !isHiddenDiscovered(item.code)) {
      triggerHiddenDiscovery(item);
    }
  };

  return (
    <div>
      
      {/* Tab Header & Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="stamp-evidence">PHYSICAL & DIGITAL FORENSICS</span>
          <h3 style={{ fontSize: '1.6rem', color: '#FFF', margin: '0.4rem 0 0.2rem' }}>
            Evidence Vault & Crime Scene Artifacts
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Click any piece of evidence to open high-resolution forensic inspection.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {filterTypes.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  detectiveAudio.playClick();
                  setActiveFilter(tab.id);
                }}
                className={isActive ? 'btn-gold' : 'btn-ghost'}
                style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}
              >
                {Icon && <Icon size={14} />} {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {filteredEvidence.map((item) => {
          const discovered = isDiscovered(item.code);
          const hiddenFound = isHiddenDiscovered(item.code);

          return (
            <div
              key={item.id}
              onClick={() => openInspection(item)}
              className="noir-card"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: item.is_red_herring
                  ? '1px solid rgba(245, 158, 11, 0.35)'
                  : (item.is_hidden ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(212, 175, 55, 0.25)'),
                transition: 'all 0.2s ease'
              }}
            >
              
              {/* Evidence Top Tag Banner */}
              <div style={{ padding: '1.5rem 1.5rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="stamp-evidence" style={{ fontSize: '0.7rem' }}>
                    {item.code}
                  </span>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {item.is_hidden && (
                      <span className="badge-tag badge-blue" style={{ fontSize: '0.7rem' }}>
                        <Eye size={12} /> {hiddenFound ? 'Revealed' : 'Hidden Clue'}
                      </span>
                    )}
                    {item.is_red_herring && (
                      <span className="badge-tag badge-red" style={{ fontSize: '0.7rem' }}>
                        <AlertTriangle size={12} /> Red Herring
                      </span>
                    )}
                    <span className="badge-tag badge-gold" style={{ fontSize: '0.7rem' }}>
                      +{item.points || 10} Pts
                    </span>
                  </div>
                </div>

                <h4 style={{ fontSize: '1.2rem', color: '#FFF', margin: '0 0 0.5rem' }}>
                  {item.title}
                </h4>

                <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {item.description}
                </p>
              </div>

              {/* Card Footer */}
              <div style={{
                padding: '0.85rem 1.5rem',
                background: 'rgba(9, 13, 21, 0.65)',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: '#CBD5E1'
              }}>
                <span style={{ textTransform: 'capitalize', color: '#D4AF37', fontWeight: 600 }}>
                  {item.type}
                </span>

                <span style={{ color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Search size={13} /> Click to Inspect
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Forensic Inspection Modal */}
      {selectedEvidence && (
        <div className="modal-overlay" onClick={closeInspection}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '840px' }}>
            
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(14, 19, 30, 0.95)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                  <span className="stamp-classified">{selectedEvidence.code}</span>
                  <span className="badge-tag badge-gold" style={{ textTransform: 'capitalize' }}>
                    Type: {selectedEvidence.type}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.4rem', color: '#FFF', margin: 0 }}>
                  {selectedEvidence.title}
                </h3>
              </div>

              <button onClick={closeInspection} className="btn-ghost" style={{ padding: '0.45rem', borderRadius: '50%' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem', maxHeight: '68vh', overflowY: 'auto' }}>
              
              {/* Discovered Notification */}
              {discoveredAlert && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.5rem',
                  color: '#A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  fontSize: '0.95rem'
                }}>
                  <Sparkles size={20} color="#10B981" />
                  <div>
                    <strong>{discoveredAlert.message}</strong>
                    <div style={{ fontSize: '0.82rem', color: '#6EE7B7' }}>Your forensic score has been credited.</div>
                  </div>
                </div>
              )}

              {/* Photo Inspection Mode */}
              {selectedEvidence.type === 'photograph' && (
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    border: '2px solid rgba(212, 175, 55, 0.4)',
                    maxHeight: '380px'
                  }}>
                    <img
                      src={selectedEvidence.image_url || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'}
                      alt={selectedEvidence.title}
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'cover',
                        transform: zoomed ? 'scale(1.8)' : 'scale(1)',
                        transition: 'transform 0.4s ease',
                        filter: zoomed ? 'contrast(1.3) brightness(1.1)' : 'none'
                      }}
                    />

                    {zoomed && selectedEvidence.secret_content && (
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        right: '12px',
                        background: 'rgba(5, 7, 11, 0.92)',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #38BDF8',
                        color: '#38BDF8',
                        fontSize: '0.88rem',
                        textAlign: 'left'
                      }}>
                        🔍 <strong>Forensic Magnification:</strong> {selectedEvidence.secret_content}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button
                      onClick={() => handleToggleZoom(selectedEvidence)}
                      className={zoomed ? 'btn-crimson' : 'btn-gold'}
                      style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem' }}
                    >
                      <ZoomIn size={16} /> {zoomed ? 'Reset Zoom' : 'Forensic Magnifying Glass (Inspect Hotspot)'}
                    </button>
                  </div>
                </div>
              )}

              {/* Document UV Mode */}
              {selectedEvidence.type === 'document' && (
                <div style={{
                  background: uvMode ? '#0A0818' : '#141A26',
                  border: uvMode ? '2px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  marginBottom: '1.5rem',
                  boxShadow: uvMode ? '0 0 25px rgba(139, 92, 246, 0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: uvMode ? '#C4B5FD' : '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                      {uvMode ? '⚡ UV FLUORESCENCE ACTIVE' : 'STANDARD POLICE TRANSCRIPT'}
                    </span>

                    {selectedEvidence.interactive_type === 'uv_reveal' && (
                      <button
                        onClick={() => handleToggleUV(selectedEvidence)}
                        className="btn-ghost"
                        style={{
                          background: uvMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: uvMode ? '1px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.1)',
                          color: uvMode ? '#C4B5FD' : '#F1F5F9',
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        <Sun size={14} /> {uvMode ? 'Turn Off UV Light' : 'Examine Under UV Light'}
                      </button>
                    )}
                  </div>

                  <p style={{ color: '#E2E8F0', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                    {selectedEvidence.detailed_content || selectedEvidence.description}
                  </p>

                  {uvMode && selectedEvidence.secret_content && (
                    <div style={{
                      background: 'rgba(139, 92, 246, 0.15)',
                      border: '1px dashed #A78BFA',
                      borderRadius: '8px',
                      padding: '1rem',
                      color: '#DDD6FE',
                      fontSize: '0.92rem',
                      fontFamily: 'var(--font-mono)',
                      lineHeight: 1.6,
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      ⚡ <strong>Hidden UV Fluorescence Revealed:</strong> {selectedEvidence.secret_content}
                    </div>
                  )}
                </div>
              )}

              {/* Physical Object Detailed Inspection */}
              {selectedEvidence.type === 'object' && (
                <div style={{
                  background: 'rgba(9, 13, 21, 0.75)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem', fontWeight: 700 }}>
                    Physical Evidence Forensics
                  </div>

                  <p style={{ color: '#F1F5F9', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                    {selectedEvidence.detailed_content || selectedEvidence.description}
                  </p>

                  {selectedEvidence.secret_content && (
                    <div style={{
                      background: 'rgba(56, 189, 248, 0.08)',
                      borderLeft: '3px solid #38BDF8',
                      padding: '0.85rem 1rem',
                      borderRadius: '4px',
                      color: '#BAE6FD',
                      fontSize: '0.9rem'
                    }}>
                      🔍 <strong>Forensic Detail:</strong> {selectedEvidence.secret_content}
                    </div>
                  )}

                  {selectedEvidence.is_hidden && !isHiddenDiscovered(selectedEvidence.code) && (
                    <button
                      onClick={() => triggerHiddenDiscovery(selectedEvidence)}
                      className="btn-gold"
                      style={{ marginTop: '1.25rem', padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                    >
                      <Sparkles size={16} /> Record as Hidden Clue (+15 Pts)
                    </button>
                  )}
                </div>
              )}

              {/* Message Chat Style */}
              {selectedEvidence.type === 'message' && (
                <div style={{
                  background: '#070B12',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', fontWeight: 700 }}>
                    Digital Communications Forensics
                  </div>
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    borderLeft: '4px solid #38BDF8',
                    color: '#F8FAFC',
                    fontSize: '0.95rem',
                    lineHeight: 1.6
                  }}>
                    {selectedEvidence.detailed_content || selectedEvidence.description}
                  </div>
                </div>
              )}

              {/* Red Herring Explanation if applicable */}
              {selectedEvidence.is_red_herring && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  marginTop: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FBBF24', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                    <AlertTriangle size={16} /> Red Herring Advisory
                  </div>
                  <p style={{ color: '#FDE68A', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                    {selectedEvidence.red_herring_explanation || 'This evidence initially appears highly incriminating, but can be accounted for by prior routine actions.'}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(9, 13, 21, 0.95)' }}>
              <button onClick={closeInspection} className="btn-ghost">
                Close Forensic Viewer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default EvidenceTab;
