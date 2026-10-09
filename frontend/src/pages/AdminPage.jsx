import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { detectiveAudio } from '../services/audioService';
import { Shield, Plus, Award, Users, Folder, CheckCircle, AlertTriangle, FileText, Search } from 'lucide-react';

const AdminPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('scores');

  // Form states
  const [newCaseNumber, setNewCaseNumber] = useState('CASE #02');
  const [newTitle, setNewTitle] = useState('');
  const [newScenario, setNewScenario] = useState('');
  const [newVictim, setNewVictim] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('Hard');
  const [creatingCase, setCreatingCase] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  // Add evidence state
  const [evCode, setEvCode] = useState('');
  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evType, setEvType] = useState('photograph');
  const [evIsHidden, setEvIsHidden] = useState(false);
  const [evIsRedHerring, setEvIsRedHerring] = useState(false);
  const [addingEv, setAddingEv] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const res = await adminAPI.getOverview();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setCreatingCase(true);
    setCreateMsg('');
    detectiveAudio.playTypewriter();

    try {
      const res = await adminAPI.createCase({
        case_number: newCaseNumber,
        title: newTitle,
        scenario: newScenario,
        victim_name: newVictim,
        crime_location: newLocation,
        difficulty: newDifficulty
      });
      if (res.success) {
        detectiveAudio.playDiscovery();
        setCreateMsg('New case registered successfully!');
        setNewTitle('');
        setNewScenario('');
        loadAdminData();
      }
    } catch (err) {
      setCreateMsg('Error creating case.');
    } finally {
      setCreatingCase(false);
    }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    setAddingEv(true);
    detectiveAudio.playTypewriter();

    try {
      const res = await adminAPI.addEvidence({
        case_id: 1,
        code: evCode,
        title: evTitle,
        description: evDesc,
        type: evType,
        is_hidden: evIsHidden,
        is_red_herring: evIsRedHerring
      });
      if (res.success) {
        detectiveAudio.playDiscovery();
        setEvCode('');
        setEvTitle('');
        setEvDesc('');
        loadAdminData();
      }
    } catch (err) {
      console.error('Error adding evidence:', err);
    } finally {
      setAddingEv(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#38BDF8', textAlign: 'center' }}>Loading Administrative Console...</div>
      </div>
    );
  }

  const { stats = {}, scores = [], cases = [], users = [], evidence = [] } = data || {};

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '90vh' }}>
      
      {/* Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={24} color="#38BDF8" />
            <span className="stamp-classified" style={{ borderColor: '#38BDF8', color: '#38BDF8' }}>CHIEF INSPECTOR DIRECTORY</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', color: '#FFF', margin: '0.4rem 0 0.2rem' }}>
            Administrative Command Terminal
          </h2>
          <p style={{ color: '#94A3B8' }}>
            Bureau oversight, case curation, forensic cataloging, and detective score records.
          </p>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="noir-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Registered Detectives</div>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#38BDF8', fontWeight: 800 }}>{stats.totalUsers || users.length}</div>
        </div>
        <div className="noir-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Total Forensic Cases</div>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#D4AF37', fontWeight: 800 }}>{stats.totalCases || cases.length}</div>
        </div>
        <div className="noir-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Cataloged Evidence</div>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#10B981', fontWeight: 800 }}>{stats.totalEvidence || evidence.length}</div>
        </div>
        <div className="noir-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Indictments Filed</div>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#EF4444', fontWeight: 800 }}>{stats.totalScoresRecorded || scores.length}</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveSubTab('scores')}
          className={activeSubTab === 'scores' ? 'btn-gold' : 'btn-ghost'}
        >
          <Award size={16} /> Detective Scores & Leaderboard
        </button>
        <button
          onClick={() => setActiveSubTab('createCase')}
          className={activeSubTab === 'createCase' ? 'btn-gold' : 'btn-ghost'}
        >
          <Plus size={16} /> Author New Case
        </button>
        <button
          onClick={() => setActiveSubTab('evidence')}
          className={activeSubTab === 'evidence' ? 'btn-gold' : 'btn-ghost'}
        >
          <Search size={16} /> Add Forensic Evidence
        </button>
      </div>

      {/* Subtab 1: Scores Table */}
      {activeSubTab === 'scores' && (
        <div className="noir-card" style={{ padding: '2rem' }}>
          <h4 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '1.25rem' }}>
            Official Case Submission Scores
          </h4>

          {scores.length === 0 ? (
            <div style={{ color: '#94A3B8', textAlign: 'center', padding: '2rem' }}>
              No detective final accusations submitted yet. Complete Case #01 to record the first verdict!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#D4AF37' }}>
                    <th style={{ padding: '0.75rem' }}>Detective</th>
                    <th style={{ padding: '0.75rem' }}>Case</th>
                    <th style={{ padding: '0.75rem' }}>Score</th>
                    <th style={{ padding: '0.75rem' }}>Rank Awarded</th>
                    <th style={{ padding: '0.75rem' }}>Accuracy</th>
                    <th style={{ padding: '0.75rem' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#CBD5E1' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#FFF' }}>{s.user_name || 'Detective Vance'}</td>
                      <td style={{ padding: '0.75rem' }}>{s.case_title || 'Case #01'}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 800, color: '#D4AF37' }}>{s.score} / 100</td>
                      <td style={{ padding: '0.75rem', color: '#38BDF8' }}>{s.rank_title}</td>
                      <td style={{ padding: '0.75rem' }}>{s.accuracy_percent}%</td>
                      <td style={{ padding: '0.75rem', color: '#64748B' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Create Case */}
      {activeSubTab === 'createCase' && (
        <div className="noir-card" style={{ padding: '2rem', maxWidth: '780px' }}>
          <h4 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '1.25rem' }}>
            Commission New Case File
          </h4>

          {createMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', padding: '0.75rem', borderRadius: '8px', color: '#A7F3D0', marginBottom: '1.5rem' }}>
              {createMsg}
            </div>
          )}

          <form onSubmit={handleCreateCase} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.3rem' }}>Case Code</label>
                <input type="text" value={newCaseNumber} onChange={(e) => setNewCaseNumber(e.target.value)} required className="noir-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.3rem' }}>Case Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. The Cipher of Blackwood" required className="noir-input" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.3rem' }}>Victim</label>
                <input type="text" value={newVictim} onChange={(e) => setNewVictim(e.target.value)} placeholder="Victim name" className="noir-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.3rem' }}>Scene</label>
                <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Crime location" className="noir-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.3rem' }}>Difficulty</label>
                <select value={newDifficulty} onChange={(e) => setNewDifficulty(e.target.value)} className="noir-input" style={{ background: '#090D15' }}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Master Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.3rem' }}>Scenario & Plot Description</label>
              <textarea rows={5} value={newScenario} onChange={(e) => setNewScenario(e.target.value)} placeholder="Describe the mystery scenario..." required className="noir-input" />
            </div>

            <button type="submit" disabled={creatingCase} className="btn-gold" style={{ padding: '0.85rem' }}>
              <Plus size={18} /> {creatingCase ? 'Deploying Case...' : 'Publish Mystery Case'}
            </button>
          </form>
        </div>
      )}

      {/* Subtab 3: Add Evidence */}
      {activeSubTab === 'evidence' && (
        <div className="noir-card" style={{ padding: '2rem', maxWidth: '780px' }}>
          <h4 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '1.25rem' }}>
            Log New Evidence Item into Case #01
          </h4>

          <form onSubmit={handleAddEvidence} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.3rem' }}>Evidence Code</label>
                <input type="text" value={evCode} onChange={(e) => setEvCode(e.target.value)} placeholder="e.g. EVD-DOC-06" required className="noir-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.3rem' }}>Title</label>
                <input type="text" value={evTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Evidence title" required className="noir-input" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.3rem' }}>Type</label>
              <select value={evType} onChange={(e) => setEvType(e.target.value)} className="noir-input" style={{ background: '#090D15' }}>
                <option value="photograph">Photograph</option>
                <option value="document">Document</option>
                <option value="object">Physical Object</option>
                <option value="message">Communication</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.3rem' }}>Description</label>
              <textarea rows={3} value={evDesc} onChange={(e) => setEvDesc(e.target.value)} required className="noir-input" />
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#CBD5E1', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={evIsHidden} onChange={(e) => setEvIsHidden(e.target.checked)} /> Mark as Hidden Clue
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#CBD5E1', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={evIsRedHerring} onChange={(e) => setEvIsRedHerring(e.target.checked)} /> Mark as Red Herring
              </label>
            </div>

            <button type="submit" disabled={addingEv} className="btn-gold" style={{ padding: '0.85rem' }}>
              <Plus size={18} /> {addingEv ? 'Cataloging...' : 'Add Evidence Item'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminPage;
