import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { detectiveAudio } from '../../services/audioService';
import { 
  Award, CheckCircle, AlertTriangle, Shield, 
  HelpCircle, Eye, ArrowRight, RotateCcw, Target, Key 
} from 'lucide-react';

const InvestigationResultModal = ({ result, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (result?.isCorrect) {
      detectiveAudio.playDiscovery();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#EF4444', '#38BDF8', '#10B981', '#FFFFFF']
      });
    } else {
      detectiveAudio.playContradictionAlert();
    }
  }, [result]);

  if (!result) return null;

  const {
    isCorrect,
    score,
    rankTitle,
    accuracyPercent,
    breakdown = {},
    actualCulprit,
    accusedSuspect,
    solution = {},
    correctConclusionTitle,
    investigationStats
  } = result;

  const isNonCriminal = solution?.conclusionType === 'non_criminal';

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '880px', border: isCorrect ? '2px solid #10B981' : '2px solid #EF4444' }}>
        
        {/* Banner */}
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: isCorrect ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.25) 0%, rgba(9, 13, 21, 0.95) 100%)' : 'linear-gradient(180deg, rgba(239, 68, 68, 0.25) 0%, rgba(9, 13, 21, 0.95) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="stamp-classified" style={{ borderColor: isCorrect ? '#10B981' : '#EF4444', color: isCorrect ? '#34D399' : '#F87171' }}>
              {isCorrect
                ? (isNonCriminal ? 'PLANNED DISAPPEARANCE SOLVED' : 'GUILTY CULPRIT BROUGHT TO JUSTICE')
                : 'CASE UNRESOLVED — WRONG INDICTMENT'}
            </span>
          </div>

          <h2 style={{ fontSize: '2.4rem', color: '#FFF', margin: '0 0 0.5rem' }}>
            {isCorrect
              ? (isNonCriminal ? 'Planned Disappearance Solved!' : 'Case Solved, Detective!')
              : 'Flawed Deduction Recorded'}
          </h2>

          <p style={{ color: '#CBD5E1', fontSize: '1.02rem', maxWidth: '650px', margin: '0 auto' }}>
            {isCorrect
              ? (isNonCriminal
                  ? 'You correctly determined that Nikhil planned his own temporary absence. No innocent individual was falsely accused, and the case has been closed.'
                  : `You correctly identified ${actualCulprit?.name} as the person responsible for ${solution?.title || 'the crime'}!`)
              : `You accused ${accusedSuspect?.name}, but the forensic evidence proves another conclusion.`}
          </p>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '2rem', maxHeight: '65vh', overflowY: 'auto' }}>
          
          {/* Score & Rank Card */}
          <div className="noir-card" style={{
            padding: '1.75rem',
            marginBottom: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center',
            background: 'rgba(212, 175, 55, 0.06)',
            border: '1.5px solid #D4AF37'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                FINAL DETECTIVE SCORE
              </div>
              <div style={{ fontSize: '3.4rem', fontFamily: 'var(--font-heading)', color: '#FFF', fontWeight: 900, lineHeight: 1.1 }}>
                {score} <span style={{ fontSize: '1.5rem', color: '#94A3B8' }}>/ 100</span>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                AWARDED DETECTIVE RANK
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#F3C969', margin: '0.3rem 0' }}>
                {rankTitle}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                <Target size={14} /> Investigation Accuracy: {accuracyPercent}%
              </div>
            </div>
          </div>

          {/* Points Breakdown Grid */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem', fontWeight: 700 }}>
              100-Point Forensic Rubric Breakdown
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ background: 'rgba(9, 13, 21, 0.7)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94A3B8' }}>1. Conclusion:</span>
                <div style={{ color: '#10B981', fontWeight: 700, fontSize: '1rem' }}>
                  +{breakdown.conclusionPoints !== undefined ? breakdown.conclusionPoints : (isCorrect ? 40 : 0)} / 40 Pts
                </div>
              </div>
              <div style={{ background: 'rgba(9, 13, 21, 0.7)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94A3B8' }}>2. Supporting Proof:</span>
                <div style={{ color: '#38BDF8', fontWeight: 700, fontSize: '1rem' }}>
                  +{breakdown.evidencePoints !== undefined ? breakdown.evidencePoints : (breakdown.cluesPoints || 0)} / 25 Pts
                </div>
              </div>
              <div style={{ background: 'rgba(9, 13, 21, 0.7)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94A3B8' }}>3. Hidden Clues:</span>
                <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1rem' }}>
                  +{breakdown.hiddenCluesPoints || 0} / 15 Pts
                </div>
              </div>
              <div style={{ background: 'rgba(9, 13, 21, 0.7)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94A3B8' }}>4. Contradictions:</span>
                <div style={{ color: '#A855F7', fontWeight: 700, fontSize: '1rem' }}>
                  +{breakdown.contradictionPoints || 0} / 10 Pts
                </div>
              </div>
              <div style={{ background: 'rgba(9, 13, 21, 0.7)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94A3B8' }}>5. Written Reasoning:</span>
                <div style={{ color: '#F59E0B', fontWeight: 700, fontSize: '1rem' }}>
                  +{breakdown.reasoningPoints || 0} / 10 Pts
                </div>
              </div>
            </div>

            {breakdown.reasoningRubricDetails && (
              <div style={{ marginTop: '0.85rem', background: 'rgba(255,255,255,0.04)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', color: '#CBD5E1' }}>
                <strong style={{ color: '#F3C969' }}>Reasoning Audit: </strong> {breakdown.reasoningRubricDetails}
              </div>
            )}
          </div>

          {/* Full Case Revelation Story Breakdown */}
          <div className="noir-card" style={{ padding: '1.75rem', marginBottom: '2rem', borderLeft: '4px solid #D4AF37' }}>
            <h4 style={{ fontSize: '1.25rem', color: '#FFF', marginBottom: '0.75rem' }}>
              The Full Truth: How the Incident Unfolded
            </h4>
            <p style={{ color: '#E2E8F0', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              {solution?.solutionBreakdown}
            </p>

            {/* Decisive Evidence */}
            {solution?.keyEvidence && solution.keyEvidence.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.82rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Key size={14} /> Decisive Forensic Clues:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.4rem' }}>
                  {solution.keyEvidence.map((ke, idx) => (
                    <div key={idx} style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', color: '#BAE6FD' }}>
                      ✔ {ke}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {solution?.motiveSummary && (
              <div style={{ background: 'rgba(9, 13, 21, 0.7)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong style={{ color: '#F87171' }}>Motive / Context: </strong>
                <span style={{ color: '#CBD5E1', fontSize: '0.9rem' }}>{solution?.motiveSummary}</span>
              </div>
            )}

            {solution?.redHerringExplanation && (
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <strong style={{ color: '#FBBF24' }}>Red Herrings Clarification: </strong>
                <span style={{ color: '#FDE68A', fontSize: '0.9rem' }}>{solution?.redHerringExplanation}</span>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'rgba(9, 13, 21, 0.98)'
        }}>
          <button
            onClick={onClose}
            className="btn-outline-gold"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          >
            <RotateCcw size={16} /> Replay & Review Case
          </button>

          <button
            onClick={() => navigate('/cases')}
            className="btn-gold"
            style={{ padding: '0.75rem 1.8rem', fontSize: '0.95rem' }}
          >
            Return to Cases <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default InvestigationResultModal;
