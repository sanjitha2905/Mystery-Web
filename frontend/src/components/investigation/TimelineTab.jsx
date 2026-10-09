import React, { useState } from 'react';
import { detectiveAudio } from '../../services/audioService';
import { Clock, AlertTriangle, CheckCircle, MapPin, ChevronRight, Eye } from 'lucide-react';

const TimelineTab = ({ timeline }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterConflicts, setFilterConflicts] = useState(false);

  const displayedEvents = filterConflicts
    ? timeline.filter(t => t.has_conflict)
    : timeline;

  const handleSelectEvent = (event) => {
    detectiveAudio.playClick();
    setSelectedEvent(event === selectedEvent ? null : event);
  };

  return (
    <div>
      
      {/* Header & Conflict Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="stamp-classified">CHRONOLOGICAL RECONSTRUCTION</span>
          <h3 style={{ fontSize: '1.6rem', color: '#FFF', margin: '0.4rem 0 0.2rem' }}>
            Crime Night Timeline & Conflict Matrix
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Cross-reference timestamps against suspect testimonies to detect fabricated alibis.
          </p>
        </div>

        <button
          onClick={() => {
            detectiveAudio.playClick();
            setFilterConflicts(!filterConflicts);
          }}
          className={filterConflicts ? 'btn-crimson' : 'btn-outline-gold'}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
        >
          <AlertTriangle size={15} /> {filterConflicts ? 'Show Full Timeline' : 'Highlight Conflicts Only'}
        </button>
      </div>

      {/* Visual Timeline Stream */}
      <div style={{ position: 'relative', maxWidth: '880px', margin: '0 auto', paddingLeft: '2.5rem' }}>
        
        {/* Continuous Central Neon Line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          bottom: '25px',
          left: '11px',
          width: '3px',
          background: 'linear-gradient(180deg, #D4AF37 0%, rgba(212, 175, 55, 0.4) 50%, #EF4444 80%, #38BDF8 100%)',
          borderRadius: '2px'
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {displayedEvents.map((evt, index) => {
            const isSelected = selectedEvent?.id === evt.id;

            return (
              <div key={evt.id} style={{ position: 'relative' }}>
                
                {/* Node Dot Icon on line */}
                <div style={{
                  position: 'absolute',
                  left: '-2.5rem',
                  top: '1.25rem',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: evt.has_conflict ? '#EF4444' : '#0E131E',
                  border: evt.has_conflict ? '3px solid #FFF' : '3px solid #D4AF37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: evt.has_conflict ? '0 0 12px rgba(239, 68, 68, 0.8)' : '0 0 10px rgba(212, 175, 55, 0.4)',
                  zIndex: 2
                }} />

                {/* Event Card */}
                <div
                  onClick={() => handleSelectEvent(evt)}
                  className="noir-card"
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer',
                    border: evt.has_conflict
                      ? '1px solid rgba(239, 68, 68, 0.4)'
                      : (isSelected ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.08)'),
                    boxShadow: isSelected ? 'var(--shadow-gold)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: evt.has_conflict ? '#F87171' : '#F3C969',
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}>
                        {evt.time_str}
                      </span>
                      <h4 style={{ fontSize: '1.2rem', color: '#FFF', margin: 0 }}>
                        {evt.title}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {evt.location_name && (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} color="#38BDF8" /> {evt.location_name}
                        </span>
                      )}
                      {evt.has_conflict && (
                        <span className="badge-tag badge-red" style={{ fontSize: '0.7rem' }}>
                          <AlertTriangle size={12} /> Conflict Detected
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
                    {evt.description}
                  </p>

                  {/* Conflict Breakdown Banner */}
                  {evt.has_conflict && (
                    <div style={{
                      marginTop: '1rem',
                      background: 'rgba(239, 68, 68, 0.09)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      color: '#FCA5A5',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      animation: 'fadeIn 0.25s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.2rem', color: '#EF4444' }}>
                        <AlertTriangle size={14} /> ⚠ Timeline Conflict Detected
                      </div>
                      <div>
                        {evt.conflict_details}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#FDA4AF', marginTop: '0.4rem', fontStyle: 'italic' }}>
                        * Cross-examine this timestamp against the suspect's statements in the Contradiction Lab.
                      </div>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};

export default TimelineTab;
