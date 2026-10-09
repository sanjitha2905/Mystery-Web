import React, { useState } from 'react';
import { contradictionAPI } from '../../services/api';
import { detectiveAudio } from '../../services/audioService';
import { 
  AlertTriangle, Shield, CheckCircle, Zap, 
  HelpCircle, Sparkles, ChevronRight, Scale 
} from 'lucide-react';

const ContradictionTab = ({ suspects = [], evidence = [], timeline = [], contradictions = [], caseId, progress, onProgressUpdate }) => {
  const [itemA, setItemA] = useState('');
  const [itemB, setItemB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate dynamic statement options from contradictions catalogue and suspects
  const rawStatementOptions = [
    ...(contradictions || []).map(c => ({
      id: c.item_a_code || `contra_a_${c.id}`,
      label: c.item_a_label
    })),
    ...(suspects || []).map(s => ({
      id: `suspect_${s.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      label: `${s.name}: “${s.alibi || s.statement}”`
    }))
  ];

  // Generate dynamic forensic options from contradictions catalogue and evidence
  const rawForensicOptions = [
    ...(contradictions || []).map(c => ({
      id: c.item_b_code || `contra_b_${c.id}`,
      label: c.item_b_label
    })),
    ...(evidence || []).map(e => ({
      id: e.code.toLowerCase(),
      label: `${e.code}: ${e.title}`
    }))
  ];

  // De-duplicate options by ID
  const statementOptions = Array.from(new Map(rawStatementOptions.map(o => [o.id, o])).values());
  const forensicOptions = Array.from(new Map(rawForensicOptions.map(o => [o.id, o])).values());

  const handleTest = async () => {
    if (!itemA || !itemB) return;
    setLoading(true);
    setResult(null);
    detectiveAudio.playTypewriter();

    try {
      const res = await contradictionAPI.checkContradiction(caseId, itemA, itemB, 'statement', 'evidence');
      setResult(res);

      if (res.isContradiction) {
        detectiveAudio.playContradictionAlert();
        if (onProgressUpdate) {
          onProgressUpdate();
        }
      } else {
        detectiveAudio.playClick();
      }
    } catch (err) {
      console.error('Contradiction check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const discoveredCodes = progress?.contradictions_discovered || [];
  const totalContradictions = contradictions?.length || 2;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="stamp-classified">CROSS-EXAMINATION CHAMBER</span>
          <h3 style={{ fontSize: '1.6rem', color: '#FFF', margin: '0.4rem 0 0.2rem' }}>
            Contradiction Engine & Alibi Disproval
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Select a suspect statement and cross-examine it against hard physical forensics.
          </p>
        </div>

        <span className="badge-tag badge-red">
          Contradictions Solved: {discoveredCodes.length}/{totalContradictions}
        </span>
      </div>

      {/* Cross-Examination Workbench */}
      <div className="noir-card" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid rgba(239, 68, 68, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <Scale size={20} color="#EF4444" />
          <h4 style={{ fontSize: '1.25rem', color: '#FFF', margin: 0 }}>
            Forensic Cross-Examination Workbench
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Item A: Suspect Statement */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#F3C969', marginBottom: '0.5rem', fontWeight: 700 }}>
              TESTIMONY A (Suspect Statement / Claim)
            </label>
            <select
              value={itemA}
              onChange={(e) => setItemA(e.target.value)}
              className="noir-input"
              style={{ background: '#090D15', cursor: 'pointer' }}
            >
              <option value="">-- Choose Suspect Statement --</option>
              {statementOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Item B: Forensic Record */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#38BDF8', marginBottom: '0.5rem', fontWeight: 700 }}>
              FORENSIC ITEM B (CCTV / Receipt / Log / Physical Object)
            </label>
            <select
              value={itemB}
              onChange={(e) => setItemB(e.target.value)}
              className="noir-input"
              style={{ background: '#090D15', cursor: 'pointer' }}
            >
              <option value="">-- Choose Forensic Evidence --</option>
              {forensicOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleTest}
            disabled={!itemA || !itemB || loading}
            className="btn-crimson"
            style={{ padding: '0.85rem 2.25rem', fontSize: '1rem', opacity: (!itemA || !itemB || loading) ? 0.6 : 1 }}
          >
            <Zap size={18} /> {loading ? 'Analyzing Logical Integrity...' : 'Cross-Examine Pair for Contradiction'}
          </button>
        </div>

        {/* Result Evaluation Output */}
        {result && (
          <div style={{ marginTop: '2rem', animation: 'fadeIn 0.3s ease' }}>
            {result.isContradiction ? (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '2px solid #EF4444',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-crimson)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span className="stamp-classified">FATAL CONTRADICTION DETECTED</span>
                  <span className="badge-tag badge-gold">+{result.pointsAwarded || 15} Points</span>
                </div>
                <h4 style={{ fontSize: '1.25rem', color: '#FFF', marginBottom: '0.5rem' }}>
                  {result.contradiction?.title}
                </h4>
                <p style={{ color: '#FCA5A5', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                  {result.contradiction?.explanation}
                </p>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '1.25rem',
                color: '#CBD5E1',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <HelpCircle size={20} color="#D4AF37" />
                <span>{result.message}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Discovered Contradictions Registry */}
      <div>
        <h4 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '1rem' }}>
          Official Bureau Contradiction Registry
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {(contradictions || []).map((c) => {
            const isProven = discoveredCodes.includes(c.code);

            return (
              <div
                key={c.id}
                className="noir-card"
                style={{
                  padding: '1.5rem',
                  borderLeft: isProven ? '4px solid #10B981' : '4px solid #64748B',
                  opacity: isProven ? 1 : 0.75
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="stamp-evidence" style={{ fontSize: '0.7rem' }}>{c.code}</span>
                  <span className={isProven ? 'badge-tag badge-green' : 'badge-tag badge-gold'} style={{ fontSize: '0.7rem' }}>
                    {isProven ? 'CONFIRMED' : 'UNSOLVED'}
                  </span>
                </div>

                <h5 style={{ fontSize: '1.05rem', color: '#FFF', marginBottom: '0.5rem' }}>
                  {c.title}
                </h5>

                <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
                  <strong>Item A:</strong> {c.item_a_label}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
                  <strong>Item B:</strong> {c.item_b_label}
                </div>

                {isProven && (
                  <div style={{ fontSize: '0.85rem', color: '#A7F3D0', background: 'rgba(16, 185, 129, 0.08)', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                    ✔ {c.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContradictionTab;
