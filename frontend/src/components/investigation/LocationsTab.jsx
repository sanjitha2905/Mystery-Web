import React, { useState } from 'react';
import { evidenceAPI } from '../../services/api';
import { detectiveAudio } from '../../services/audioService';
import { MapPin, Search, Sparkles, CheckCircle2, Shield, Users, Archive, Compass, AlertCircle } from 'lucide-react';

const LocationsTab = ({ locations, caseId, progress, onProgressUpdate }) => {
  const [inspectedLocation, setInspectedLocation] = useState(null);
  const [inspectionStage, setInspectionStage] = useState({}); // locationId -> count (1 or 2)
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'shield': return Shield;
      case 'users': return Users;
      case 'archive': return Archive;
      case 'compass': return Compass;
      default: return MapPin;
    }
  };

  const handleInspect = async (loc) => {
    detectiveAudio.playClick();
    const currentCount = inspectionStage[loc.id] || 0;
    const isSecond = currentCount >= 1;
    const nextCount = isSecond ? 2 : 1;

    setLoading(true);
    setNotification(null);

    try {
      const res = await evidenceAPI.inspectLocation(caseId, loc.id, isSecond);
      if (res.success) {
        setInspectionStage({ ...inspectionStage, [loc.id]: nextCount });
        setInspectedLocation({
          ...loc,
          currentFinding: res.finding,
          isSecond,
          unlockedEvidence: res.unlockedEvidence
        });

        if (res.unlockedEvidence) {
          detectiveAudio.playDiscovery();
          setNotification({
            title: 'Hidden Clue Discovered!',
            detail: `Found: ${res.unlockedEvidence.title} (${res.unlockedEvidence.code})! +10 Detective Points`
          });
          if (onProgressUpdate) {
            onProgressUpdate();
          }
        }
      }
    } catch (err) {
      console.error('Error inspecting location:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="stamp-classified">ESTATE SECTORS</span>
          <h3 style={{ fontSize: '1.6rem', color: '#FFF', margin: '0.4rem 0 0.2rem' }}>
            Crime Scene Locations & Physical Searches
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Conduct forensics at each estate location. Thorough double-inspections may uncover overlooked secrets!
          </p>
        </div>
        <span className="badge-tag badge-gold">
          Explored: {progress?.locations_explored?.length || 0}/4
        </span>
      </div>

      {/* Discovered Notification */}
      {notification && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10B981',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          color: '#A7F3D0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          animation: 'fadeIn 0.3s ease'
        }}>
          <Sparkles size={22} color="#10B981" />
          <div>
            <strong style={{ fontSize: '1rem', color: '#FFF' }}>{notification.title}</strong>
            <div style={{ fontSize: '0.88rem', color: '#6EE7B7' }}>{notification.detail}</div>
          </div>
        </div>
      )}

      {/* Locations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {locations.map((loc) => {
          const Icon = getIcon(loc.icon_name);
          const stage = inspectionStage[loc.id] || 0;
          const isExplored = (progress?.locations_explored || []).includes(loc.id) || stage > 0;

          return (
            <div
              key={loc.id}
              className="noir-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.75rem',
                border: stage === 2 ? '1px solid rgba(16, 185, 129, 0.4)' : (stage === 1 ? '1px solid rgba(212, 175, 55, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)')
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid #D4AF37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={22} color="#D4AF37" />
                  </div>

                  <span className={stage === 2 ? 'badge-tag badge-green' : (stage === 1 ? 'badge-tag badge-gold' : 'badge-tag badge-blue')}>
                    {stage === 2 ? 'Fully Searched (2/2)' : (stage === 1 ? 'Searched (1/2)' : 'Unexamined')}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#38BDF8', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>
                  {loc.floor}
                </div>

                <h4 style={{ fontSize: '1.3rem', color: '#FFF', margin: '0 0 0.5rem' }}>
                  {loc.name}
                </h4>

                <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {loc.description}
                </p>

                {/* Search Findings Box */}
                {stage >= 1 && (
                  <div style={{
                    background: 'rgba(9, 13, 21, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    fontSize: '0.88rem',
                    color: '#E2E8F0',
                    lineHeight: 1.5,
                    borderLeft: '3px solid #D4AF37'
                  }}>
                    <strong style={{ color: '#D4AF37' }}>Search Finding: </strong>
                    {stage === 2 ? loc.second_inspection_finding : loc.search_findings}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => handleInspect(loc)}
                  disabled={loading}
                  className={stage === 1 ? 'btn-crimson' : 'btn-gold'}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.88rem' }}
                >
                  <Search size={16} />
                  {stage === 0 && 'Inspect Location'}
                  {stage === 1 && 'Perform Deep Second Search (Look Closely)'}
                  {stage === 2 && 'Re-examine Sector'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default LocationsTab;
