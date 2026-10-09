import React, { useState } from 'react';
import { interrogationAPI } from '../../services/api';
import { detectiveAudio } from '../../services/audioService';
import { 
  User, MessageSquare, AlertTriangle, CheckCircle, Shield, 
  HelpCircle, ChevronRight, X, Sparkles, FileText 
} from 'lucide-react';

const SuspectsTab = ({ suspects, caseId, progress, onProgressUpdate }) => {
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [activeQA, setActiveQA] = useState([]);
  const [askingId, setAskingId] = useState(null);
  const [unlockedNotice, setUnlockedNotice] = useState(null);

  const openInterrogation = async (suspect) => {
    detectiveAudio.playClick();
    setSelectedSuspect(suspect);
    setLoadingQuestions(true);
    setActiveQA([]);
    setUnlockedNotice(null);

    try {
      const data = await interrogationAPI.getQuestions(suspect.id);
      if (data.success) {
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.error('Failed to load suspect questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const closeInterrogation = () => {
    detectiveAudio.playClick();
    setSelectedSuspect(null);
    setQuestions([]);
    setActiveQA([]);
  };

  const handleAskQuestion = async (q) => {
    detectiveAudio.playTypewriter();
    setAskingId(q.id);
    setUnlockedNotice(null);

    try {
      const data = await interrogationAPI.askQuestion(q.id, caseId);
      if (data.success) {
        setActiveQA(prev => [
          ...prev,
          {
            questionId: q.id,
            question_text: data.question_text,
            answer_text: data.answer_text,
            contradiction_hint: data.contradiction_hint,
            unlockedEvidence: data.unlockedEvidence
          }
        ]);

        if (data.unlockedEvidence) {
          detectiveAudio.playDiscovery();
          setUnlockedNotice(`New Evidence Unlocked: ${data.unlockedEvidence.title} (${data.unlockedEvidence.code})!`);
        }

        // Notify parent to refresh progress stats
        if (onProgressUpdate) {
          onProgressUpdate();
        }
      }
    } catch (err) {
      console.error('Error asking question:', err);
    } finally {
      setAskingId(null);
    }
  };

  const isQuestionAsked = (qId) => {
    return (progress?.questions_asked || []).includes(qId) || activeQA.some(a => a.questionId === qId);
  };

  return (
    <div>
      
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="stamp-classified">PERSONS OF INTEREST</span>
          <h3 style={{ fontSize: '1.6rem', color: '#FFF', margin: '0.4rem 0 0.2rem' }}>
            Suspect Profiles & Interrogation Chamber
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Examine motives, verify alibis, and conduct direct interviews to identify discrepancies.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <span className="badge-tag badge-gold">
            Questions Asked: {progress?.questions_asked?.length || 0}/13
          </span>
        </div>
      </div>

      {/* Suspects Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {suspects.map((suspect) => {
          return (
            <div
              key={suspect.id}
              className="noir-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                transition: 'all 0.25s ease'
              }}
            >
              {/* Profile Header */}
              <div style={{ padding: '1.75rem 1.75rem 1rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <img
                    src={suspect.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={suspect.name}
                    style={{
                      width: '84px',
                      height: '96px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #D4AF37',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.6)'
                    }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1.35rem', color: '#FFF', margin: '0 0 0.25rem' }}>
                      {suspect.name}
                    </h4>
                    <div style={{ fontSize: '0.82rem', color: '#D4AF37', fontWeight: 600, marginBottom: '0.3rem' }}>
                      Age {suspect.age} • {suspect.occupation}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      {suspect.relationship}
                    </div>
                  </div>
                </div>

                {/* Statement Quote */}
                <div style={{
                  background: 'rgba(9, 13, 21, 0.7)',
                  borderRadius: '10px',
                  padding: '1rem',
                  borderLeft: '3px solid #D4AF37',
                  marginBottom: '1.25rem',
                  fontStyle: 'italic',
                  fontSize: '0.88rem',
                  color: '#CBD5E1',
                  lineHeight: 1.5
                }}>
                  {suspect.statement}
                </div>

                {/* Dossier Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#94A3B8', fontWeight: 600 }}>Known Location: </span>
                    <span style={{ color: '#E2E8F0' }}>{suspect.known_location}</span>
                  </div>
                  <div>
                    <span style={{ color: '#F87171', fontWeight: 600 }}>Possible Motive: </span>
                    <span style={{ color: '#CBD5E1' }}>{suspect.motive}</span>
                  </div>
                  <div>
                    <span style={{ color: '#38BDF8', fontWeight: 600 }}>Claimed Alibi: </span>
                    <span style={{ color: '#CBD5E1' }}>{suspect.alibi}</span>
                  </div>
                </div>
              </div>

              {/* Interrogate CTA Button */}
              <div style={{ padding: '1rem 1.75rem 1.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <button
                  onClick={() => openInterrogation(suspect)}
                  className="btn-gold"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                >
                  <MessageSquare size={17} /> Interrogate {suspect.name.split(' ')[0]} <ChevronRight size={17} />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Interrogation Chamber Modal */}
      {selectedSuspect && (
        <div className="modal-overlay" onClick={closeInterrogation}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px' }}>
            
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(14, 19, 30, 0.95)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={selectedSuspect.avatar_url}
                  alt={selectedSuspect.name}
                  style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #D4AF37' }}
                />
                <div>
                  <span className="stamp-classified" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>INTERROGATION ROOM</span>
                  <h3 style={{ fontSize: '1.35rem', color: '#FFF', margin: '0.2rem 0 0' }}>
                    Cross-Examining {selectedSuspect.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    {selectedSuspect.occupation} • {selectedSuspect.relationship}
                  </div>
                </div>
              </div>

              <button onClick={closeInterrogation} className="btn-ghost" style={{ padding: '0.45rem', borderRadius: '50%' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem', maxHeight: '65vh', overflowY: 'auto' }}>
              
              {/* Notification Banner when evidence is unlocked */}
              {unlockedNotice && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  borderRadius: '8px',
                  padding: '0.85rem 1.25rem',
                  marginBottom: '1.5rem',
                  color: '#A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.92rem',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <Sparkles size={18} color="#10B981" />
                  <strong>{unlockedNotice}</strong>
                </div>
              )}

              {/* Answers Transcript History */}
              {activeQA.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem', fontWeight: 700 }}>
                    Official Interrogation Transcript
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {activeQA.map((qa, index) => (
                      <div key={index} style={{
                        background: 'rgba(9, 13, 21, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '1.25rem'
                      }}>
                        {/* Detective Question */}
                        <div style={{ color: '#38BDF8', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={16} /> Detective: “{qa.question_text}”
                        </div>
                        {/* Suspect Answer */}
                        <div style={{ color: '#F1F5F9', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.6, paddingLeft: '1.5rem', borderLeft: '2px solid #D4AF37' }}>
                          {qa.answer_text}
                        </div>
                        {/* Contradiction Hint if present */}
                        {qa.contradiction_hint && (
                          <div style={{
                            marginTop: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '4px',
                            color: '#F87171',
                            fontSize: '0.78rem'
                          }}>
                            <AlertTriangle size={13} />
                            <span>Detective Notice: {qa.contradiction_hint}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Selection Menu */}
              <div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem', fontWeight: 700 }}>
                  Choose Question to Present to {selectedSuspect.name}
                </div>

                {loadingQuestions ? (
                  <div style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem' }}>
                    Loading suspect interrogation logs...
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {questions.map((q) => {
                      const asked = isQuestionAsked(q.id);
                      return (
                        <button
                          key={q.id}
                          onClick={() => handleAskQuestion(q)}
                          disabled={askingId === q.id}
                          className="noir-card"
                          style={{
                            padding: '1rem 1.25rem',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            border: asked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(212, 175, 55, 0.2)',
                            background: asked ? 'rgba(16, 185, 129, 0.05)' : 'rgba(20, 28, 43, 0.65)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <HelpCircle size={18} color={asked ? '#10B981' : '#D4AF37'} />
                            <span style={{ fontSize: '0.95rem', color: asked ? '#E2E8F0' : '#FFF', fontWeight: 500 }}>
                              {q.question_text}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            {asked && (
                              <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <CheckCircle size={13} /> Asked
                              </span>
                            )}
                            <ChevronRight size={17} color="#94A3B8" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(9, 13, 21, 0.95)' }}>
              <button onClick={closeInterrogation} className="btn-ghost">
                Conclude Interview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SuspectsTab;
