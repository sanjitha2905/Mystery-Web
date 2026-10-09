import React, { useState } from 'react';
import { accusationAPI } from '../../services/api';
import { detectiveAudio } from '../../services/audioService';
import { Shield, AlertTriangle, CheckCircle, Scale, X, ArrowRight, Sparkles, UserCheck, HelpCircle } from 'lucide-react';

const FinalAccusationModal = ({ suspects = [], evidence = [], caseId, caseData, onClose, onResult }) => {
  const isNonCriminalCase = caseData?.conclusion_type === 'non_criminal' || caseData?.case_number === 'MW-005';

  const [selectedSuspectId, setSelectedSuspectId] = useState(null);
  const [conclusionType, setConclusionType] = useState(isNonCriminalCase ? 'non_criminal' : 'criminal');
  const [conclusionKey, setConclusionKey] = useState(isNonCriminalCase ? 'PLANNED_DISAPPEARANCE' : null);
  const [selectedEvidenceCodes, setSelectedEvidenceCodes] = useState([]);
  const [deductionText, setDeductionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleEvidenceCode = (code) => {
    detectiveAudio.playClick();
    if (selectedEvidenceCodes.includes(code)) {
      setSelectedEvidenceCodes(selectedEvidenceCodes.filter(c => c !== code));
    } else {
      setSelectedEvidenceCodes([...selectedEvidenceCodes, code]);
    }
  };

  const handleSelectNonCriminal = () => {
    detectiveAudio.playClick();
    setSelectedSuspectId('PLANNED_DISAPPEARANCE');
    setConclusionType('non_criminal');
    setConclusionKey('PLANNED_DISAPPEARANCE');
  };

  const handleSelectSuspect = (suspect) => {
    detectiveAudio.playClick();
    setSelectedSuspectId(suspect.id);
    if (isNonCriminalCase && suspect.name.toLowerCase().includes('nikhil')) {
      setConclusionType('non_criminal');
      setConclusionKey('PLANNED_DISAPPEARANCE');
    } else {
      setConclusionType('criminal');
      setConclusionKey(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSuspectId && !conclusionKey) {
      setError('You must select a conclusion or suspect before submitting your final report.');
      return;
    }
    if (!deductionText.trim() || deductionText.trim().length < 15) {
      setError('Please provide your investigative rationale (minimum 15 characters to satisfy the evaluation rubric).');
      return;
    }

    setSubmitting(true);
    setError('');
    detectiveAudio.playTypewriter();

    try {
      const res = await accusationAPI.submitAccusation(
        caseId,
        selectedSuspectId,
        deductionText,
        selectedEvidenceCodes,
        conclusionType,
        conclusionKey
      );

      if (res.success) {
        onResult(res);
      } else {
        setError(res.message || 'Failed to submit accusation.');
      }
    } catch (err) {
      console.error('Accusation error:', err);
      setError(err.response?.data?.message || 'Error recording accusation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '860px', border: '2px solid #EF4444' }}>
        
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(20, 10, 15, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="stamp-classified">FORMAL PROSECUTION WARRANT</span>
            <h3 style={{ fontSize: '1.4rem', color: '#FFF', margin: 0 }}>
              Filing Final Investigation Conclusion: {caseData?.case_number || 'CASE'}
            </h3>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.45rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem', maxHeight: '74vh', overflowY: 'auto' }}>
          
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#FCA5A5',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Non-Criminal Banner for Case 5 */}
          {isNonCriminalCase && (
            <div style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              color: '#BAE6FD',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.25rem' }}>
                <Sparkles size={16} /> Non-Criminal Case Resolution Notice
              </div>
              This case involves a student disappearance that may not constitute a criminal offense. If your investigation indicates a voluntary departure or absence, you may select the non-criminal outcome below without falsely accusing innocent persons.
            </div>
          )}

          {/* Step 1: Prime Suspect or Conclusion Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.95rem', color: '#F3C969', fontWeight: 700, marginBottom: '0.8rem' }}>
              STEP 1: SELECT CONCLUSION OR PRIME SUSPECT (40 POINTS)
            </label>

            {/* Non-Criminal Option Card (prominently shown if Case 5) */}
            {isNonCriminalCase && (
              <div
                onClick={handleSelectNonCriminal}
                className="noir-card"
                style={{
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                  cursor: 'pointer',
                  border: selectedSuspectId === 'PLANNED_DISAPPEARANCE' ? '2px solid #10B981' : '1px solid rgba(16, 185, 129, 0.3)',
                  background: selectedSuspectId === 'PLANNED_DISAPPEARANCE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 19, 30, 0.85)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981'
                }}>
                  <UserCheck size={28} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#A7F3D0', fontSize: '1.05rem' }}>
                    Non-Criminal Outcome: Planned Disappearance Solved
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                    Nikhil planned his own temporary absence voluntarily; no criminal foul play or abduction occurred.
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <input
                    type="radio"
                    checked={selectedSuspectId === 'PLANNED_DISAPPEARANCE'}
                    readOnly
                    style={{ accentColor: '#10B981', transform: 'scale(1.3)' }}
                  />
                </div>
              </div>
            )}

            {/* Suspect Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
              {suspects.map((s) => {
                const isSelected = selectedSuspectId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSuspect(s)}
                    className="noir-card"
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isSelected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(14, 19, 30, 0.8)',
                      transform: isSelected ? 'scale(1.03)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img
                      src={s.avatar_url}
                      alt={s.name}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        margin: '0 auto 0.6rem',
                        border: isSelected ? '2px solid #EF4444' : '2px solid #D4AF37'
                      }}
                    />
                    <div style={{ fontWeight: 700, color: '#FFF', fontSize: '0.95rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{s.occupation}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Evidence Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.95rem', color: '#38BDF8', fontWeight: 700, marginBottom: '0.4rem' }}>
              STEP 2: SELECT RELEVANT SUPPORTING EVIDENCE (25 POINTS)
            </label>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.8rem' }}>
              Select the decisive pieces of forensic evidence. Beware of misleading red herrings.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', maxHeight: '220px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {evidence.map((ev) => {
                const isChecked = selectedEvidenceCodes.includes(ev.code);
                return (
                  <div
                    key={ev.id}
                    onClick={() => toggleEvidenceCode(ev.code)}
                    style={{
                      background: isChecked ? 'rgba(56, 189, 248, 0.15)' : 'rgba(9, 13, 21, 0.75)',
                      border: isChecked ? '1.5px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '0.85rem',
                      color: isChecked ? '#FFF' : '#CBD5E1'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      style={{ cursor: 'pointer', accentColor: '#38BDF8' }}
                    />
                    <div>
                      <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.75rem' }}>{ev.code}: </span>
                      <span>{ev.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Deduction & Closing Argument */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.95rem', color: '#10B981', fontWeight: 700 }}>
                STEP 3: INVESTIGATIVE REASONING & CLOSING ARGUMENT (10 POINTS)
              </label>
              <span style={{ fontSize: '0.75rem', color: '#D4AF37' }}>
                Rubric: 15+ words (+3) • Citing forensics/times (+4) • Causal logic (+3)
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.6rem' }}>
              Explain your deductions clearly, mentioning key timeline timestamps, physical evidence, or access logs.
            </p>
            <textarea
              required
              rows={4}
              value={deductionText}
              onChange={(e) => setDeductionText(e.target.value)}
              placeholder="e.g. The automated access log at 8:07 PM firmly places the suspect in the corridor, contradicting their claim of leaving earlier, while matching velvet fibers confirm contact with the jewelry box..."
              className="noir-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Submit CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel & Continue Investigating
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-crimson"
              style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
            >
              <Scale size={18} /> {submitting ? 'Deliberating Case...' : 'Submit Formal Indictment'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default FinalAccusationModal;
