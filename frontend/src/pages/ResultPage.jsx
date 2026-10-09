import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { accusationAPI } from '../services/api';
import { detectiveAudio } from '../services/audioService';
import { RotateCcw, Target, ArrowRight, Folder, Shield, CheckCircle, AlertTriangle, Key, Info } from 'lucide-react';

const ResultPage = () => {
  const { id } = useParams();
  const caseId = id || 1;
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);

  useEffect(() => {
    if (!result) {
      loadHistory();
    } else {
      triggerConfetti(result.isCorrect);
    }
  }, [caseId]);

  const loadHistory = async () => {
    try {
      const historyData = await accusationAPI.getHistory(caseId);
      if (historyData.success && historyData.scores?.length > 0) {
        const latest = historyData.scores[0];
        const resObj = {
          isCorrect: latest.score >= 50,
          score: latest.score || 85,
          rankTitle: latest.rank_title || 'Chief Detective',
          accuracyPercent: latest.accuracy_percent || 85,
          breakdown: typeof latest.breakdown === 'string' ? JSON.parse(latest.breakdown) : latest.breakdown,
          correctConclusionTitle: 'Case Solved',
          solution: {
            solutionBreakdown: 'Forensic cross-examination confirmed decisive timestamps and evidence links.',
            motiveSummary: 'Verified by automated access logs and physical forensic findings.',
            redHerringExplanation: 'Red herrings were accounted for and separated from core clues.'
          }
        };
        setResult(resObj);
        triggerConfetti(resObj.isCorrect);
      }
    } catch (e) {
      console.error('Failed to load result:', e);
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = (isCorrect) => {
    if (isCorrect) {
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
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: '#D4AF37' }}>
        <Shield size={42} className="pulse-glow" style={{ margin: '0 auto 1rem' }} />
        <p>Tabulating final forensic deliberation...</p>
      </div>
    );
  }

  const {
    isCorrect,
    score = 0,
    rankTitle = 'Novice Detective ⭐',
    accuracyPercent = 0,
    breakdown = {},
    actualCulprit,
    accusedSuspect,
    solution = {},
    correctConclusionTitle,
    investigationStats = {}
  } = result || {};

  const isNonCriminal = solution?.conclusionType === 'non_criminal' || String(caseId) === '6';

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '90vh' }}>
      
      {/* Top Banner */}
      <div className="noir-card" style={{
        padding: '2.5rem',
        marginBottom: '2rem',
        textAlign: 'center',
        border: isCorrect ? '2px solid #10B981' : '2px solid #EF4444',
        background: isCorrect ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, rgba(9, 13, 21, 0.95) 100%)' : 'linear-gradient(180deg, rgba(239, 68, 68, 0.15) 0%, rgba(9, 13, 21, 0.95) 100%)'
      }}>
        <span className="stamp-classified" style={{ borderColor: isCorrect ? '#10B981' : '#EF4444', color: isCorrect ? '#34D399' : '#F87171' }}>
          {isCorrect
            ? (isNonCriminal ? 'PLANNED DISAPPEARANCE SOLVED — NON-CRIMINAL RESOLUTION' : 'CASE SOLVED — GUILTY CULPRIT IDENTIFIED')
            : 'CASE UNRESOLVED — FLAWED INDICTMENT'}
        </span>

        <h1 style={{ fontSize: '2.6rem', color: '#FFF', margin: '1rem 0 0.5rem' }}>
          {isCorrect
            ? (isNonCriminal ? 'Planned Disappearance Solved!' : 'Case Solved, Detective!')
            : 'Investigation Incomplete'}
        </h1>

        <p style={{ color: '#CBD5E1', fontSize: '1.05rem', maxWidth: '700px', margin: '0 auto' }}>
          {isCorrect
            ? (isNonCriminal
                ? 'Your deductive analysis accurately determined that Nikhil planned his own temporary absence. No crime was committed, and no innocent person was falsely accused.'
                : `Your forensic cross-examination successfully incriminated ${actualCulprit?.name || 'the culprit'} with decisive timeline and forensic proof.`)
            : `You submitted an indictment for ${accusedSuspect?.name || 'the suspect'}, but the forensic evidence points toward a different conclusion.`}
        </p>
      </div>

      {/* Score & Rank Card */}
      <div className="noir-card" style={{
        padding: '2rem',
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2rem',
        alignItems: 'center',
        background: 'rgba(212, 175, 55, 0.05)',
        border: '1.5px solid #D4AF37'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.82rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
            FINAL DETECTIVE SCORE
          </div>
          <div style={{ fontSize: '3.6rem', fontFamily: 'var(--font-heading)', color: '#FFF', fontWeight: 900, lineHeight: 1.1 }}>
            {score} <span style={{ fontSize: '1.5rem', color: '#94A3B8' }}>/ 100</span>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.82rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            AWARDED DETECTIVE RANK
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F3C969', margin: '0.4rem 0' }}>
            {rankTitle}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Target size={16} /> Investigation Accuracy: {accuracyPercent}%
          </div>
        </div>
      </div>

      {/* 5-Criteria Points Breakdown Card */}
      <div className="noir-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#D4AF37', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Transparent 100-Point Rubric Deliberation
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(9, 13, 21, 0.7)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.82rem' }}>1. Correct Conclusion</span>
            <div style={{ color: '#10B981', fontWeight: 700, fontSize: '1.15rem' }}>
              +{breakdown.conclusionPoints !== undefined ? breakdown.conclusionPoints : (breakdown.culpritPoints || (isCorrect ? 40 : 0))} / 40 Pts
            </div>
          </div>
          <div style={{ background: 'rgba(9, 13, 21, 0.7)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.82rem' }}>2. Supporting Evidence</span>
            <div style={{ color: '#38BDF8', fontWeight: 700, fontSize: '1.15rem' }}>
              +{breakdown.evidencePoints !== undefined ? breakdown.evidencePoints : (breakdown.cluesPoints || 0)} / 25 Pts
            </div>
          </div>
          <div style={{ background: 'rgba(9, 13, 21, 0.7)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.82rem' }}>3. Hidden Clues Discovered</span>
            <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.15rem' }}>
              +{breakdown.hiddenCluesPoints !== undefined ? breakdown.hiddenCluesPoints : 0} / 15 Pts
            </div>
          </div>
          <div style={{ background: 'rgba(9, 13, 21, 0.7)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.82rem' }}>4. Contradictions Spotted</span>
            <div style={{ color: '#A855F7', fontWeight: 700, fontSize: '1.15rem' }}>
              +{breakdown.contradictionPoints !== undefined ? breakdown.contradictionPoints : 0} / 10 Pts
            </div>
          </div>
          <div style={{ background: 'rgba(9, 13, 21, 0.7)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.82rem' }}>5. Quality of Reasoning</span>
            <div style={{ color: '#F59E0B', fontWeight: 700, fontSize: '1.15rem' }}>
              +{breakdown.reasoningPoints !== undefined ? breakdown.reasoningPoints : 0} / 10 Pts
            </div>
          </div>
        </div>

        {/* Written Reasoning Evaluation Rubric Feedback */}
        {breakdown.reasoningRubricDetails && (
          <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.04)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', color: '#CBD5E1' }}>
            <strong style={{ color: '#F3C969' }}>Reasoning Rubric Audit: </strong>
            {breakdown.reasoningRubricDetails}
          </div>
        )}
      </div>

      {/* Case Solution Truth & Decisive Clues */}
      <div className="noir-card" style={{ padding: '2rem', marginBottom: '2.5rem', borderLeft: '4px solid #D4AF37' }}>
        <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '1rem' }}>
          Official Forensic Revelation & Decisive Evidence
        </h3>
        <p style={{ color: '#E2E8F0', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          {solution?.solutionBreakdown}
        </p>

        {/* Decisive Supporting Clues */}
        {solution?.keyEvidence && solution.keyEvidence.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Key size={15} /> Decisive Case Clues:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.5rem' }}>
              {solution.keyEvidence.map((ke, idx) => (
                <div key={idx} style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '0.85rem', color: '#BAE6FD' }}>
                  ✔ {ke}
                </div>
              ))}
            </div>
          </div>
        )}

        {solution?.motiveSummary && (
          <div style={{ background: 'rgba(9, 13, 21, 0.7)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <strong style={{ color: '#F87171' }}>Motive & Background: </strong>
            <span style={{ color: '#CBD5E1', fontSize: '0.92rem' }}>{solution.motiveSummary}</span>
          </div>
        )}

        {solution?.redHerringExplanation && (
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <strong style={{ color: '#FBBF24' }}>Red Herrings Encountered: </strong>
            <span style={{ color: '#FDE68A', fontSize: '0.92rem' }}>{solution.redHerringExplanation}</span>
          </div>
        )}
      </div>

      {/* Action Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={() => {
            detectiveAudio.playClick();
            navigate(`/investigation/${caseId}`);
          }}
          className="btn-outline-gold"
          style={{ padding: '0.85rem 1.75rem' }}
        >
          <RotateCcw size={16} /> Replay Case
        </button>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => {
              detectiveAudio.playClick();
              navigate('/cases');
            }}
            className="btn-ghost"
            style={{ padding: '0.85rem 1.75rem' }}
          >
            <Folder size={16} /> Return to Cases
          </button>

          <button
            onClick={() => {
              detectiveAudio.playClick();
              navigate('/dashboard');
            }}
            className="btn-gold"
            style={{ padding: '0.85rem 2rem' }}
          >
            Detective Dashboard <ArrowRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default ResultPage;
