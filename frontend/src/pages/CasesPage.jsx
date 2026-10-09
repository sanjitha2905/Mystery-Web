import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { caseAPI } from '../services/api';
import { detectiveAudio } from '../services/audioService';
import { 
  Shield, Search, Eye, Filter, ArrowRight, Play, 
  MapPin, Users, Key, CheckCircle, Clock, AlertCircle, RefreshCw 
} from 'lucide-react';

const caseCoverImages = {
  'MW-001': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80', // Mansion Safe / Jewels
  'MW-002': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', // Tech Office / Corporate
  'MW-003': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80', // College Hallway / Study
  'MW-004': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', // Grand Hotel / Display
  'MW-005': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80'  // Campus Grounds / Bench
};

const CasesPage = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await caseAPI.getAllCases();
      if (data.success) {
        setCases(data.cases || []);
      } else {
        setError(data.message || 'Failed to retrieve cases from archive.');
      }
    } catch (err) {
      console.error('Failed to load cases:', err);
      setError('Unable to connect to archive database. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInvestigation = (caseId) => {
    detectiveAudio.playDiscovery();
    navigate(`/investigation/${caseId}`);
  };

  const handleViewDetails = (caseId) => {
    detectiveAudio.playClick();
    navigate(`/cases/${caseId}`);
  };

  // Filtered cases calculation
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.case_number && c.case_number.toLowerCase().includes(q)) ||
        (c.crime_location && c.crime_location.toLowerCase().includes(q));

      // Difficulty filter
      const matchesDifficulty = difficultyFilter === 'ALL' ||
        (c.difficulty && c.difficulty.toUpperCase() === difficultyFilter);

      // Status filter
      const currentStatus = c.investigationStatus || (c.solved ? 'Completed' : 'Not Started');
      const matchesStatus = statusFilter === 'ALL' ||
        (statusFilter === 'Not Started' && (currentStatus === 'Not Started' || !c.investigationStatus)) ||
        (statusFilter === 'In Progress' && currentStatus === 'In Progress') ||
        (statusFilter === 'Completed' && (currentStatus === 'Completed' || c.solved));

      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [cases, searchQuery, difficultyFilter, statusFilter]);

  const resetFilters = () => {
    detectiveAudio.playClick();
    setSearchQuery('');
    setDifficultyFilter('ALL');
    setStatusFilter('ALL');
  };

  const getDifficultyBadgeClass = (diff) => {
    const d = (diff || '').toLowerCase();
    if (d === 'easy') return 'badge-tag badge-green';
    if (d === 'hard') return 'badge-tag badge-red';
    return 'badge-tag badge-gold';
  };

  const getStatusBadge = (c) => {
    const status = c.investigationStatus || (c.solved ? 'Completed' : 'Not Started');
    if (status === 'Completed' || c.solved) {
      return <span className="badge-tag badge-green"><CheckCircle size={12} /> Completed</span>;
    }
    if (status === 'In Progress') {
      return <span className="badge-tag badge-blue"><Clock size={12} /> In Progress</span>;
    }
    return <span className="badge-tag" style={{ background: 'rgba(255,255,255,0.08)', color: '#CBD5E1' }}>Not Started</span>;
  };

  const getActionButtonText = (c) => {
    const status = c.investigationStatus || (c.solved ? 'Completed' : 'Not Started');
    if (status === 'Completed' || c.solved) return 'Review Case';
    if (status === 'In Progress') return 'Continue Investigation';
    return 'Start Investigation';
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '90vh' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span className="stamp-classified">ARCHIVAL REPOSITORY</span>
            <span className="badge-tag badge-gold">5 ACTIVE DOSSIERS</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', color: '#FFF', margin: '0 0 0.5rem' }}>
            Active Case Dossier Files
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '650px' }}>
            Inspect confidential incident files across the bureau. Cross-examine suspects, unlock forensic evidence, and bring the truth to light.
          </p>
        </div>

        <Link to="/dashboard" className="btn-outline-gold" style={{ padding: '0.65rem 1.25rem' }}>
          Back to Dashboard
        </Link>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="noir-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search Input */}
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <Search size={16} color="#D4AF37" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by case title, case number (MW-001), or location..."
            className="noir-input"
            style={{ paddingLeft: '2.25rem', width: '100%', fontSize: '0.88rem' }}
          />
        </div>

        {/* Filters Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          
          {/* Difficulty Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="noir-input"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', background: '#090D15', cursor: 'pointer' }}
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="noir-input"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', background: '#090D15', cursor: 'pointer' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Reset Button */}
          {(searchQuery || difficultyFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={resetFilters}
              className="btn-ghost"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem', color: '#F3C969' }}
            >
              Reset Filters
            </button>
          )}

        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#D4AF37' }}>
          <Shield size={44} className="pulse-glow" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', color: '#FFF' }}>Retrieving Classified Case Dossiers...</h3>
          <p style={{ color: '#94A3B8' }}>Accessing secure database archive records.</p>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="noir-card" style={{ padding: '2rem', textAlign: 'center', borderColor: '#EF4444', marginBottom: '2rem' }}>
          <AlertCircle size={36} color="#EF4444" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ color: '#FCA5A5', marginBottom: '0.5rem' }}>Error Accessing Archive</h4>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{error}</p>
          <button onClick={loadCases} className="btn-gold" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            <RefreshCw size={14} /> Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCases.length === 0 && (
        <div className="noir-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', border: '1px dashed rgba(212, 175, 55, 0.4)' }}>
          <Filter size={36} color="#D4AF37" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#FFF', marginBottom: '0.5rem' }}>No Matching Case Files Found</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
            No cases match your active search and filter settings. Try adjusting the difficulty, clearing the search term, or resetting filters.
          </p>
          <button onClick={resetFilters} className="btn-gold" style={{ padding: '0.65rem 1.5rem' }}>
            Reset All Filters
          </button>
        </div>
      )}

      {/* Responsive Case Cards Grid */}
      {!loading && !error && filteredCases.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          {filteredCases.map((c) => {
            const coverImage = caseCoverImages[c.case_number] || 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80';
            const actionText = getActionButtonText(c);

            return (
              <div
                key={c.id}
                className="noir-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                }}
              >
                {/* Visual Banner Header */}
                <div style={{
                  height: '180px',
                  background: `linear-gradient(180deg, rgba(5,7,11,0.2) 0%, rgba(5,7,11,0.95) 100%), url(${coverImage}) center/cover`,
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.25)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="stamp-classified">{c.case_number}</span>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span className={getDifficultyBadgeClass(c.difficulty)}>
                        {c.difficulty || 'Medium'}
                      </span>
                      {getStatusBadge(c)}
                    </div>
                  </div>

                  <h3 style={{
                    fontSize: '1.35rem',
                    color: '#FFF',
                    margin: 0,
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {c.title}
                  </h3>
                </div>

                {/* Card Content Details */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    {/* Short Story Description */}
                    <p style={{
                      color: '#CBD5E1',
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      marginBottom: '1.25rem',
                      minHeight: '68px'
                    }}>
                      {c.scenario ? c.scenario.substring(0, 190) + '...' : 'Classified incident file requiring forensic deduction.'}
                    </p>

                    {/* Metadata Grid (Location, Suspects, Clues, Time) */}
                    <div style={{
                      background: 'rgba(9, 13, 21, 0.65)',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                      fontSize: '0.82rem',
                      marginBottom: '1.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} color="#38BDF8" />
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem' }}>LOCATION</span>
                          <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{c.crime_location || 'Classified'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Users size={14} color="#F3C969" />
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem' }}>SUSPECTS</span>
                          <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{c.suspectCount || 4} Persons of Interest</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Key size={14} color="#10B981" />
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem' }}>CLUES DISCOVERED</span>
                          <span style={{ color: '#F1F5F9', fontWeight: 600 }}>
                            {c.cluesDiscovered !== undefined ? c.cluesDiscovered : 0} / {c.cluesTotal || 6}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} color="#A855F7" />
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem' }}>ESTIMATED TIME</span>
                          <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{c.estimated_time || '25-35 mins'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleViewDetails(c.id)}
                      className="btn-outline-gold"
                      style={{ justifyContent: 'center', padding: '0.7rem', fontSize: '0.85rem' }}
                    >
                      <Eye size={15} /> Case Brief
                    </button>
                    <button
                      onClick={() => handleStartInvestigation(c.id)}
                      className="btn-gold"
                      style={{ justifyContent: 'center', padding: '0.7rem', fontSize: '0.85rem' }}
                    >
                      <Play size={14} /> {actionText}
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default CasesPage;
