import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { caseAPI } from '../services/api';
import { detectiveAudio } from '../services/audioService';
import { 
  Shield, Award, CheckCircle, Clock, Search, Folder, 
  Target, BarChart3, ChevronRight, AlertTriangle, Sparkles, BookOpen, Eye, CheckCircle2 
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [welcomeBanner, setWelcomeBanner] = useState(location.state?.welcomeMessage || '');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const data = await caseAPI.getAllCases();
      if (data.success) {
        setCases(data.cases || []);
      }
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCase = (caseId) => {
    detectiveAudio.playDiscovery();
    navigate(`/investigation/${caseId}`);
  };

  const casesCompleted = cases.filter(c => c.solved).length;
  const bestScore = user?.stats?.bestScore || 0;
  const accuracy = user?.stats?.avgAccuracy || (casesCompleted > 0 ? 88 : 0);

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '90vh' }}>
      
      {/* Toast Welcome Banner from Login */}
      {welcomeBanner && (
        <div style={{
          background: 'rgba(212, 175, 55, 0.15)',
          border: '1.5px solid #D4AF37',
          borderRadius: '10px',
          padding: '1rem 1.5rem',
          color: '#F8FAFC',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={20} color="#D4AF37" />
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{welcomeBanner}</span>
          </div>
          <button
            onClick={() => setWelcomeBanner('')}
            className="btn-ghost"
            style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Welcome Banner & Detective ID Card */}
      <div className="noir-card" style={{
        padding: '2.5rem',
        marginBottom: '2.5rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(212, 175, 55, 0.3)'
      }}>
        <div style={{
          position: 'absolute',
          right: '-20px',
          top: '-20px',
          opacity: 0.05,
          pointerEvents: 'none'
        }}>
          <Shield size={240} color="#D4AF37" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span className="stamp-classified">OFFICIAL DOSSIER</span>
              <span className="badge-tag badge-gold">
                <Sparkles size={12} /> ACTIVE DETECTIVE SERVICE
              </span>
            </div>
            
            <h1 style={{ fontSize: '2.4rem', color: '#FFF', margin: '0 0 0.5rem' }}>
              Welcome, <span style={{ color: '#D4AF37' }}>{user?.name || 'Detective'}</span>!
            </h1>
            
            <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '600px', marginBottom: '1.25rem' }}>
              Your forensic terminal is synchronized. Investigate unresolved incident files and log your deductions.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                id="dashboard-view-cases-btn"
                onClick={() => {
                  detectiveAudio.playClick();
                  navigate('/cases');
                }}
                className="btn-gold"
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem' }}
              >
                <Folder size={16} /> View Cases
              </button>
              <button
                onClick={() => handleStartCase(1)}
                className="btn-outline-gold"
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem' }}
              >
                <Search size={16} /> Start Investigation
              </button>
            </div>
          </div>

          {/* Detective Badge Plaque */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 28, 43, 0.95) 0%, rgba(10, 14, 23, 0.95) 100%)',
            border: '2px solid #D4AF37',
            borderRadius: '16px',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            boxShadow: '0 0 25px rgba(212, 175, 55, 0.2)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #D4AF37 0%, #856404 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
              <Shield size={30} color="#0B0E14" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#D4AF37', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800 }}>
                CRIME INVESTIGATION BUREAU
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC' }}>
                {user?.badge_number || `DET-${String(user?.id || 1).padStart(4, '0')}`}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 600 }}>
                {casesCompleted > 0 ? (cases[0]?.userRank || 'Senior Detective ⭐⭐⭐') : 'Active Detective'}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Detective Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        
        <div className="noir-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Folder size={14} color="#D4AF37" /> Available Cases
          </div>
          <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', color: '#FFF', fontWeight: 800 }}>
            {cases.length || 1}
          </div>
        </div>

        <div className="noir-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <CheckCircle size={14} color="#10B981" /> Cases Completed
          </div>
          <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', color: '#10B981', fontWeight: 800 }}>
            {casesCompleted}
          </div>
        </div>

        <div className="noir-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Award size={14} color="#D4AF37" /> Best Detective Score
          </div>
          <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', color: '#D4AF37', fontWeight: 800 }}>
            {cases[0]?.userScore ? `${cases[0].userScore}/100` : (bestScore ? `${bestScore}/100` : '—')}
          </div>
        </div>

        <div className="noir-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Target size={14} color="#38BDF8" /> Investigation Accuracy
          </div>
          <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', color: '#38BDF8', fontWeight: 800 }}>
            {accuracy ? `${accuracy}%` : '92%'}
          </div>
        </div>

      </div>

      {/* Case Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="stamp-evidence">INCIDENT ROSTER</span>
          <h2 style={{ fontSize: '1.8rem', color: '#FFF', marginTop: '0.4rem' }}>
            Available Forensic Cases
          </h2>
        </div>

        <button
          onClick={() => navigate('/cases')}
          className="btn-ghost"
          style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
        >
          <Folder size={16} /> View All Archives <ChevronRight size={16} />
        </button>
      </div>

      {/* Case Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {cases.map((c) => (
          <div key={c.id} className="noir-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            {/* Case Image / Preview Banner */}
            <div style={{
              height: '180px',
              background: 'linear-gradient(180deg, rgba(5,7,11,0.2) 0%, rgba(5,7,11,0.95) 100%), url(https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80) center/cover',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="stamp-classified">{c.case_number}</span>
                <span className={c.solved ? 'badge-tag badge-green' : 'badge-tag badge-gold'}>
                  {c.solved ? 'SOLVED' : 'UNSOLVED'}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.45rem', color: '#FFF', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  {c.title}
                </h3>
              </div>
            </div>

            {/* Case Details Content */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {c.scenario ? c.scenario.substring(0, 190) + '...' : 'Incident awaiting full investigation.'}
                </p>

                {/* Meta details */}
                <div style={{
                  background: 'rgba(9, 13, 21, 0.65)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Victim:</span>
                    <div style={{ color: '#F1F5F9', fontWeight: 600 }}>{c.victim_name || 'Classified'}</div>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Difficulty:</span>
                    <div style={{ color: '#F3C969', fontWeight: 600 }}>{c.difficulty || 'Medium'}</div>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Estimated Time:</span>
                    <div style={{ color: '#F1F5F9', fontWeight: 600 }}>{c.estimated_time || '25-35 mins'}</div>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Crime Time:</span>
                    <div style={{ color: '#F1F5F9', fontWeight: 600 }}>{c.crime_time || '8:15 PM'}</div>
                  </div>
                </div>

                {/* Solved Performance if completed */}
                {c.solved && c.userScore && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600 }}>
                      Awarded: {c.userRank}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#D4AF37' }}>
                      {c.userScore}/100
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    detectiveAudio.playClick();
                    navigate(`/cases/${c.id}`);
                  }}
                  className="btn-outline-gold"
                  style={{ justifyContent: 'center', padding: '0.8rem', fontSize: '0.88rem' }}
                >
                  <Eye size={16} /> View Case
                </button>
                <button
                  onClick={() => handleStartCase(c.id)}
                  className="btn-gold"
                  style={{ justifyContent: 'center', padding: '0.8rem', fontSize: '0.88rem' }}
                >
                  <Search size={16} /> {c.solved ? 'Review' : 'Investigate'}
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default DashboardPage;
