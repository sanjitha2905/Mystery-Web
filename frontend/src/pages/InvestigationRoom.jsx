import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caseAPI } from '../services/api';
import { detectiveAudio } from '../services/audioService';
import { 
  Shield, Search, AlertTriangle, Eye, Users, FileText, 
  MessageSquare, Clock, MapPin, Layers, Scale, BookOpen, 
  Terminal, Sparkles, ChevronRight, Award, CheckCircle 
} from 'lucide-react';

// Tab Components
import CaseBriefTab from '../components/investigation/CaseBriefTab';
import SuspectsTab from '../components/investigation/SuspectsTab';
import EvidenceTab from '../components/investigation/EvidenceTab';
import MessagesTab from '../components/investigation/MessagesTab';
import TimelineTab from '../components/investigation/TimelineTab';
import LocationsTab from '../components/investigation/LocationsTab';
import InvestigationBoardTab from '../components/investigation/InvestigationBoardTab';
import ContradictionTab from '../components/investigation/ContradictionTab';
import NotebookTab from '../components/investigation/NotebookTab';

// Modals
import AIAssistantModal from '../components/investigation/AIAssistantModal';
import FinalAccusationModal from '../components/investigation/FinalAccusationModal';
import InvestigationResultModal from '../components/investigation/InvestigationResultModal';

const InvestigationRoom = () => {
  const { id } = useParams();
  const caseId = id || 1;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('brief');
  const [caseBundle, setCaseBundle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAccuseModal, setShowAccuseModal] = useState(false);
  const [accusationResult, setAccusationResult] = useState(null);

  useEffect(() => {
    fetchCaseDetails();
  }, [caseId]);

  const fetchCaseDetails = async () => {
    try {
      const data = await caseAPI.getCaseDetails(caseId);
      if (data.success) {
        setCaseBundle(data);
      }
    } catch (err) {
      console.error('Failed to load case data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    detectiveAudio.playClick();
    setActiveTab(tabId);
  };

  // Calculate live overall investigation progress %
  const calculateProgressPercent = () => {
    if (!caseBundle) return 0;
    const { evidence = [], progress = {} } = caseBundle;
    const totalClues = evidence.length || 15;
    const cluesFound = progress.clues_found?.length || 6;
    const hiddenFound = progress.hidden_clues_found?.length || 0;
    const contraFound = progress.contradictions_discovered?.length || 0;
    const questionsAsked = progress.questions_asked?.length || 0;

    // Weightings
    const clueScore = (cluesFound / totalClues) * 40;
    const hiddenScore = (hiddenFound / 4) * 20;
    const contraScore = (contraFound / 4) * 20;
    const questionScore = (questionsAsked / 13) * 20;

    const total = Math.min(100, Math.round(clueScore + hiddenScore + contraScore + questionScore));
    return Math.max(15, total);
  };

  const handleSaveProgress = async (partialProgress) => {
    if (!caseBundle) return;
    try {
      const merged = {
        ...caseBundle.progress,
        ...partialProgress
      };
      await caseAPI.saveProgress(caseId, merged);
      setCaseBundle(prev => ({
        ...prev,
        progress: merged
      }));
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#D4AF37' }}>
          <Shield size={48} className="pulse-glow" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', color: '#FFF' }}>Initializing Investigation Room...</h3>
          <p style={{ color: '#94A3B8' }}>Deciphering encrypted evidence files and crime scene maps.</p>
        </div>
      </div>
    );
  }

  if (!caseBundle?.case) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h3 style={{ color: '#F87171' }}>Case dossier not found.</h3>
        <button onClick={() => navigate('/dashboard')} className="btn-gold" style={{ marginTop: '1.5rem' }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { case: caseData, suspects = [], evidence = [], messages = [], timeline = [], locations = [], contradictions = [], progress = {} } = caseBundle;
  const progressPercent = calculateProgressPercent();

  const tabs = [
    { id: 'brief', label: '1. Case Brief', icon: FileText },
    { id: 'suspects', label: '2. Suspects & Interrogation', icon: Users, badge: `${suspects.length}` },
    { id: 'evidence', label: '3. Evidence Vault', icon: Search, badge: `${evidence.length}` },
    { id: 'messages', label: '4. Communications', icon: MessageSquare, badge: `${messages.length}` },
    { id: 'timeline', label: '5. Chronology Matrix', icon: Clock },
    { id: 'locations', label: '6. Crime Scenes', icon: MapPin },
    { id: 'board', label: '7. Investigation Board', icon: Layers },
    { id: 'contradiction', label: '8. Contradiction Lab', icon: Scale },
    { id: 'notebook', label: '9. Detective Notebook', icon: BookOpen }
  ];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* Top Detective HUD Bar */}
      <div style={{
        background: 'rgba(9, 13, 21, 0.95)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        padding: '1.25rem 0',
        position: 'sticky',
        top: '68px',
        zIndex: 90,
        backdropFilter: 'blur(16px)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          
          {/* Case Info and Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button
              onClick={() => {
                detectiveAudio.playClick();
                navigate('/cases');
              }}
              className="btn-ghost"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
              title="Return to Cases"
            >
              ← Back to Cases
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="stamp-classified" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>{caseData.case_number}</span>
                <h2 style={{ fontSize: '1.35rem', color: '#FFF', margin: 0 }}>
                  {caseData.title}
                </h2>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                Scene: {caseData.crime_location} • Item: {caseData.stolen_item}
              </div>
            </div>
          </div>

          {/* Progress Counters & Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            
            {/* Live Progress Bar */}
            <div style={{ width: '180px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#CBD5E1', fontWeight: 600 }}>Investigation Progress</span>
                <span style={{ color: '#D4AF37', fontWeight: 800 }}>{progressPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #D4AF37 0%, #10B981 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge-tag badge-gold" title="Clues found in case">
                <Search size={12} /> Clues: {progress.clues_found?.length || 6}/{evidence.length}
              </span>
              <span className="badge-tag badge-blue" title="Hidden clues discovered">
                <Eye size={12} /> Hidden: {progress.hidden_clues_found?.length || 0}/4
              </span>
              <span className="badge-tag badge-red" title="Contradictions spotted">
                <Scale size={12} /> Conflicts: {progress.contradictions_discovered?.length || 0}/4
              </span>
            </div>

            {/* Actions: AI Assistant & Final Accusation */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={() => {
                  detectiveAudio.playClick();
                  setShowAIModal(true);
                }}
                className="btn-ghost"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                title="Open Inspector AI Assistant"
              >
                <Terminal size={15} color="#C084FC" /> AI Assistant
              </button>

              <button
                onClick={() => {
                  detectiveAudio.playDiscovery();
                  setShowAccuseModal(true);
                }}
                className="btn-crimson crime-beacon"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem' }}
              >
                <Shield size={16} /> Final Accusation
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Main Investigation Content Area */}
      <div className="container" style={{ marginTop: '2rem' }}>
        
        {/* Navigation Tabs Bar */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={isActive ? 'btn-gold' : 'btn-ghost'}
                style={{
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  borderRadius: '10px'
                }}
              >
                <Icon size={16} />
                <span>{t.label}</span>
                {t.badge && (
                  <span style={{
                    background: isActive ? '#0B0E14' : 'rgba(255,255,255,0.1)',
                    color: isActive ? '#D4AF37' : '#94A3B8',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div>
          {activeTab === 'brief' && (
            <CaseBriefTab caseData={caseData} progress={progress} />
          )}

          {activeTab === 'suspects' && (
            <SuspectsTab
              suspects={suspects}
              caseId={caseId}
              progress={progress}
              onProgressUpdate={fetchCaseDetails}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceTab
              evidence={evidence}
              caseId={caseId}
              progress={progress}
              onProgressUpdate={fetchCaseDetails}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesTab messages={messages} />
          )}

          {activeTab === 'timeline' && (
            <TimelineTab timeline={timeline} />
          )}

          {activeTab === 'locations' && (
            <LocationsTab
              locations={locations}
              caseId={caseId}
              progress={progress}
              onProgressUpdate={fetchCaseDetails}
            />
          )}

          {activeTab === 'board' && (
            <InvestigationBoardTab
              suspects={suspects}
              evidence={evidence}
              timeline={timeline}
              locations={locations}
              progress={progress}
              onSaveProgress={handleSaveProgress}
            />
          )}

          {activeTab === 'contradiction' && (
            <ContradictionTab
              suspects={suspects}
              evidence={evidence}
              timeline={timeline}
              contradictions={contradictions}
              caseId={caseId}
              progress={progress}
              onProgressUpdate={fetchCaseDetails}
            />
          )}

          {activeTab === 'notebook' && (
            <NotebookTab caseId={caseId} />
          )}
        </div>

      </div>

      {/* AI Assistant Modal */}
      {showAIModal && (
        <AIAssistantModal
          caseId={caseId}
          progress={progress}
          onClose={() => setShowAIModal(false)}
        />
      )}

      {/* Final Accusation Modal */}
      {showAccuseModal && (
        <FinalAccusationModal
          suspects={suspects}
          evidence={evidence}
          caseId={caseId}
          caseData={caseData}
          onClose={() => setShowAccuseModal(false)}
          onResult={(res) => {
            setShowAccuseModal(false);
            navigate(`/result/${caseId}`, { state: { result: res } });
          }}
        />
      )}

      {/* Investigation Result Modal */}
      {accusationResult && (
        <InvestigationResultModal
          result={accusationResult}
          onClose={() => setAccusationResult(null)}
        />
      )}

    </div>
  );
};

export default InvestigationRoom;
