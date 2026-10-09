import React from 'react';
import { Shield, MapPin, Clock, AlertCircle, FileText, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

const CaseBriefTab = ({ caseData, progress }) => {
  if (!caseData) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Executive Crime Dossier */}
      <div className="noir-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="stamp-classified">CONFIDENTIAL DISPATCH</span>
            <h3 style={{ fontSize: '1.5rem', color: '#FFF', margin: 0 }}>
              {caseData.case_number}: {caseData.title}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <span className="badge-tag badge-gold">Difficulty: {caseData.difficulty}</span>
            <span className="badge-tag badge-blue"><Clock size={13} /> {caseData.estimated_time}</span>
          </div>
        </div>

        <p style={{ color: '#E2E8F0', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          {caseData.scenario}
        </p>

        {/* Primary Case Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          background: 'rgba(9, 13, 21, 0.75)',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid rgba(212, 175, 55, 0.15)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Victim of Incident</div>
            <div style={{ fontSize: '0.98rem', color: '#FFF', fontWeight: 600 }}>{caseData.victim_name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Primary Crime Scene</div>
            <div style={{ fontSize: '0.98rem', color: '#FFF', fontWeight: 600 }}>{caseData.crime_location}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Window of Theft</div>
            <div style={{ fontSize: '0.98rem', color: '#D4AF37', fontWeight: 600 }}>{caseData.crime_time}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Stolen Artifact</div>
            <div style={{ fontSize: '0.98rem', color: '#38BDF8', fontWeight: 600 }}>{caseData.stolen_item}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Victim & Manor Blueprint */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Victim Profile Card */}
        <div className="noir-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Shield size={20} color="#D4AF37" />
            <h4 style={{ fontSize: '1.25rem', color: '#FFF', margin: 0 }}>Victim & Incident Profile</h4>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
              alt="Lord Reginald Harrington"
              style={{
                width: '90px',
                height: '110px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1.5px solid #D4AF37',
                boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
              }}
            />
            <div>
              <h5 style={{ fontSize: '1.1rem', color: '#FFF', marginBottom: '0.2rem' }}>Lord Reginald Harrington</h5>
              <div style={{ fontSize: '0.85rem', color: '#D4AF37', marginBottom: '0.4rem' }}>Age 50 • Industrialist & Philanthropist</div>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Hosting his milestone golden birthday gala at Blackwood Manor. Personally showcased the necklace before securing it in his private study wall safe at 7:30 PM.
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', fontSize: '0.88rem', color: '#CBD5E1', borderLeft: '3px solid #D4AF37' }}>
            <strong>Forensic Observation:</strong> The wall safe was opened using a valid RFID master card and combination code. The lock mechanism was undamaged, indicating either insider authorization or illicit keycard duplication.
          </div>
        </div>

        {/* Manor Blueprint & Security Architecture */}
        <div className="noir-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <MapPin size={20} color="#38BDF8" />
            <h4 style={{ fontSize: '1.25rem', color: '#FFF', margin: 0 }}>Blackwood Manor Security Architecture</h4>
          </div>

          <div style={{
            background: '#070A0F',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '10px',
            padding: '1.25rem',
            position: 'relative',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#38BDF8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 700 }}>
              ESTATE SECTORS & ACCESS POINTS
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                <strong>2nd Floor West:</strong> Master Study (High-Security Vault & CCTV camera 8:16 PM)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                <strong>Ground Floor Center:</strong> Grand Ballroom (60 gala guests & piano recital)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                <strong>Ground Floor South:</strong> Garden Terrace (Rain awning, fountain pergola)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A855F7' }} />
                <strong>Basement East:</strong> Wine Cellar & Service Fuse Board (Circuit relay switch)
              </li>
            </ul>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5 }}>
            💡 <em>Tip: Inspect each location tab thoroughly. Some locations reveal hidden physical clues when searched twice.</em>
          </div>
        </div>

      </div>

      {/* Investigation Objectives & Protocol */}
      <div className="noir-card" style={{ padding: '1.75rem', borderLeft: '4px solid #D4AF37' }}>
        <h4 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#D4AF37" /> Official Bureau Investigation Directives
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', fontSize: '0.9rem', color: '#CBD5E1' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <CheckCircle2 size={16} color="#10B981" style={{ marginTop: '3px' }} />
            <span>Interrogate all 4 suspects to collect statements, uncover motives, and challenge false alibis.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <CheckCircle2 size={16} color="#10B981" style={{ marginTop: '3px' }} />
            <span>Examine evidence items (Photos, Documents, Messages, Objects) and discover 4 hidden clues.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <CheckCircle2 size={16} color="#10B981" style={{ marginTop: '3px' }} />
            <span>Unmask at least 3 logical contradictions in the Cross-Examination Lab to prove false testimonies.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <CheckCircle2 size={16} color="#10B981" style={{ marginTop: '3px' }} />
            <span>Identify and avoid red herrings before filing your final accusation to maximize your Detective Score.</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CaseBriefTab;
