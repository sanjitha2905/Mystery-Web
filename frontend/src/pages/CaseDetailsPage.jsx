import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { caseAPI } from '../services/api';
import { detectiveAudio } from '../services/audioService';
import { Shield, Search, ArrowLeft, Users, ChevronRight } from 'lucide-react';

const CaseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCase();
  }, [id]);

  const loadCase = async () => {
    try {
      const res = await caseAPI.getCaseDetails(id || 1);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load case details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    detectiveAudio.playDiscovery();
    navigate(`/investigation/${id || 1}`);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: '#D4AF37' }}>
        <Shield size={42} className="pulse-glow" style={{ margin: '0 auto 1rem' }} />
        <p>Loading classified case dossier...</p>
      </div>
    );
  }

  if (!data?.case) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h3 style={{ color: '#EF4444' }}>Case file not found</h3>
        <Link to="/cases" className="btn-gold" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
          Back to Cases
        </Link>
      </div>
    );
  }

  const { case: caseInfo, suspects = [], evidence = [] } = data;

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '90vh' }}>
      
      {/* Top Navigation */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => {
            detectiveAudio.playClick();
            navigate('/cases');
          }}
          className="btn-ghost"
          style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}
        >
          <ArrowLeft size={16} /> Back to Cases
        </button>

        <Link to="/dashboard" className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}>
          Dashboard
        </Link>
      </div>

      {/* Main Dossier Card */}
      <div className="noir-card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="stamp-classified">{caseInfo.case_number}</span>
            <span className="badge-tag badge-gold">CONFIDENTIAL INCIDENT REPORT</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', color: '#FFF', margin: '0 0 0.5rem' }}>
            {caseInfo.title}
          </h1>
          <div style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
            Crime Location: <span style={{ color: '#F1F5F9' }}>{caseInfo.crime_location}</span> • Crime Time: <span style={{ color: '#F1F5F9' }}>{caseInfo.crime_time}</span>
          </div>
        </div>

        {/* Incident Summary */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#D4AF37', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Forensic Incident Overview
          </h3>
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: 1.7, background: 'rgba(9, 13, 21, 0.6)', padding: '1.5rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            {caseInfo.scenario}
          </p>
        </div>

        {/* Metadata Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          <div className="noir-card" style={{ padding: '1.25rem', background: 'rgba(14, 19, 30, 0.7)' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase' }}>Victim</span>
            <div style={{ fontSize: '1.15rem', color: '#FFF', fontWeight: 700, marginTop: '0.3rem' }}>{caseInfo.victim_name}</div>
          </div>
          <div className="noir-card" style={{ padding: '1.25rem', background: 'rgba(14, 19, 30, 0.7)' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase' }}>Target Artifact / Stolen Item</span>
            <div style={{ fontSize: '1.15rem', color: '#D4AF37', fontWeight: 700, marginTop: '0.3rem' }}>{caseInfo.stolen_item}</div>
          </div>
          <div className="noir-card" style={{ padding: '1.25rem', background: 'rgba(14, 19, 30, 0.7)' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase' }}>Difficulty Rating</span>
            <div style={{ fontSize: '1.15rem', color: '#38BDF8', fontWeight: 700, marginTop: '0.3rem' }}>{caseInfo.difficulty}</div>
          </div>
          <div className="noir-card" style={{ padding: '1.25rem', background: 'rgba(14, 19, 30, 0.7)' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase' }}>Estimated Duration</span>
            <div style={{ fontSize: '1.15rem', color: '#10B981', fontWeight: 700, marginTop: '0.3rem' }}>{caseInfo.estimated_time}</div>
          </div>
        </div>

        {/* Suspects preview */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="#D4AF37" /> Persons of Interest ({suspects.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {suspects.map(s => (
              <div key={s.id} style={{
                background: 'rgba(9, 13, 21, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <img
                  src={s.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
                  alt={s.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #D4AF37' }}
                />
                <div>
                  <div style={{ color: '#F1F5F9', fontWeight: 700, fontSize: '0.92rem' }}>{s.name}</div>
                  <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{s.occupation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.75rem' }}>
          <button
            onClick={() => {
              detectiveAudio.playClick();
              navigate('/cases');
            }}
            className="btn-ghost"
            style={{ padding: '0.85rem 1.5rem' }}
          >
            Back to Case Archives
          </button>
          <button
            onClick={handleStart}
            className="btn-gold"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
          >
            <Search size={18} /> Enter Investigation Room <ChevronRight size={18} />
          </button>
        </div>

      </div>

    </div>
  );
};

export default CaseDetailsPage;
