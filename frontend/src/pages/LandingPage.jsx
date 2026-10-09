import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { detectiveAudio } from '../services/audioService';
import { 
  Search, Clock, AlertTriangle, 
  Sparkles, Compass, ArrowRight,
  ChevronRight, Lock, Folder,
  UserCheck, Eye, Zap, Layers, Terminal
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartInvestigation = () => {
    detectiveAudio.playDiscovery();
    navigate('/cases');
  };

  const handleGetStarted = () => {
    detectiveAudio.playClick();
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const scrollToHowItWorks = () => {
    detectiveAudio.playClick();
    const elem = document.getElementById('how-it-works');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '6rem 0 5rem',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
      }}>
        {/* Ambient background glow elements */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          
          {/* Top Bureau Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span className="stamp-classified">OFFICIAL CLASSIFIED DOSSIER</span>
            <span className="badge-tag badge-gold">
              <Sparkles size={13} /> DIGITAL FORENSICS 2.0
            </span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            color: '#FFFFFF',
            lineHeight: 1.05,
            marginBottom: '1.25rem',
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.9)'
          }}>
            MYSTERY <span style={{ color: '#D4AF37', textShadow: '0 0 25px rgba(212, 175, 55, 0.4)' }}>WEB</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.2rem, 2.5vw, 1.65rem)',
            fontStyle: 'italic',
            color: '#CBD5E1',
            maxWidth: '750px',
            margin: '0 auto 2.25rem',
            lineHeight: 1.4
          }}>
            “Every clue tells a story. Every story hides a secret.”
          </p>

          <p style={{
            color: '#94A3B8',
            maxWidth: '620px',
            margin: '0 auto 2.75rem',
            fontSize: '1.05rem',
            lineHeight: 1.6
          }}>
            Step into the boots of an elite detective. Cross-examine interconnected digital evidence, interrogate evasive suspects, expose fatal contradictions, and solve cold cases.
          </p>

          {/* Action CTA Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap'
          }}>
            <button
              id="hero-get-started-btn"
              onClick={handleGetStarted}
              className="btn-gold"
              style={{ padding: '0.95rem 2.2rem', fontSize: '1.05rem', cursor: 'pointer' }}
            >
              <Sparkles size={20} /> Get Started
            </button>

            <button
              id="hero-start-investigation-btn"
              onClick={handleStartInvestigation}
              className="btn-outline-gold"
              style={{ padding: '0.95rem 2rem', fontSize: '1.05rem', cursor: 'pointer' }}
            >
              <Search size={20} /> Start Investigation
            </button>

            <button
              onClick={scrollToHowItWorks}
              className="btn-ghost"
              style={{ padding: '0.95rem 1.8rem', fontSize: '1.05rem', cursor: 'pointer' }}
            >
              <Compass size={18} /> How It Works
            </button>

            {!user && (
              <Link
                id="hero-login-btn"
                to="/login"
                className="btn-ghost"
                style={{ padding: '0.95rem 1.8rem', fontSize: '1.05rem', textDecoration: 'none' }}
              >
                <Lock size={18} /> Login
              </Link>
            )}
          </div>

          {/* Sample Case Teaser Preview Card */}
          <div style={{ marginTop: '4.5rem', maxWidth: '980px', marginInline: 'auto' }}>
            <div className="noir-card" style={{ padding: '2rem', textAlign: 'left', position: 'relative' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="stamp-classified" style={{ transform: 'none' }}>CASE FILE #01</span>
                  <h3 style={{ fontSize: '1.35rem', color: '#F8FAFC', margin: 0 }}>
                    THE MISSING NECKLACE
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="badge-tag badge-gold">Difficulty: Medium</span>
                  <span className="badge-tag badge-blue"><Clock size={12} /> 25-35 Mins</span>
                  <span className="badge-tag badge-red"><AlertTriangle size={12} /> Active Crime Scene</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
                <div>
                  <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    During Lord Reginald Harrington’s 50th birthday gala at Blackwood Manor, the historic 50-carat 
                    <strong style={{ color: '#D4AF37' }}> "Tears of Cleopatra" </strong> diamond necklace disappeared from the high-security study safe during a sudden 3-minute blackout at 8:15 PM.
                  </p>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#94A3B8' }}>
                      👤 4 Suspects
                    </span>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#94A3B8' }}>
                      📸 15 Evidence Items
                    </span>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#94A3B8' }}>
                      🔍 4 Hidden Clues
                    </span>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#94A3B8' }}>
                      ⚡ 4 Contradictions
                    </span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(9, 13, 21, 0.7)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', fontWeight: 700 }}>
                      Lead Forensics Brief
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#94A3B8', fontStyle: 'italic', lineHeight: 1.5 }}>
                      “The safe door was opened with a VIP keycard. A smashed gold watch stopped at 8:14 PM was found on the study floor. One innocent suspect was set up with a red herring.”
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '1.25rem' }}>
                    <button
                      onClick={() => navigate('/cases/1')}
                      className="btn-outline-gold"
                      style={{ justifyContent: 'center', padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}
                    >
                      View Case
                    </button>
                    <button
                      onClick={() => navigate('/investigation/1')}
                      className="btn-gold"
                      style={{ justifyContent: 'center', padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}
                    >
                      Start Case <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Interactive Platform Highlights */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="stamp-evidence">MODERN FORENSIC SUITE</span>
            <h2 style={{ fontSize: '2.4rem', color: '#FFF', marginTop: '0.8rem' }}>
              Advanced Digital Investigation Features
            </h2>
            <p style={{ color: '#94A3B8', maxWidth: '650px', margin: '0.6rem auto 0' }}>
              An immersive detective experience designed with genuine forensic deduction mechanics.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* Feature 1: Suspect Interrogation */}
            <div className="noir-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid #D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <UserCheck size={26} color="#D4AF37" />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '0.6rem' }}>
                Suspect Interrogation Chamber
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Interrogate 4 fully realized suspects. Ask targeted questions regarding timestamps, motives, and alibis. Each answer unlocks secret evidence and reveals subtle lies.
              </p>
            </div>

            {/* Feature 2: Contradiction Engine */}
            <div className="noir-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid #EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <AlertTriangle size={26} color="#EF4444" />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '0.6rem' }}>
                Contradiction Detection Engine
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Compare suspect statements against CCTV logs, receipts, and concert schedules in the Cross-Examination Lab. Spotting discrepancies officially breaks their alibis!
              </p>
            </div>

            {/* Feature 3: Hidden Clues */}
            <div className="noir-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid #38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Eye size={26} color="#38BDF8" />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '0.6rem' }}>
                Hidden Clues & UV Revelations
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Explore photographs with zoom lenses, inspect documents under UV fluorescent lighting, and search crime scene locations multiple times to uncover concealed evidence.
              </p>
            </div>

            {/* Feature 4: Red Herrings */}
            <div className="noir-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Zap size={26} color="#F59E0B" />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '0.6rem' }}>
                Deceptive Red Herrings
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Not all leads point to guilt. Misleading fingerprints and torn fabric tempt careless detectives. Discern legitimate clues from circumstantial coincidences.
              </p>
            </div>

            {/* Feature 5: Investigation Pinboard */}
            <div className="noir-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid #10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Layers size={26} color="#10B981" />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '0.6rem' }}>
                Interactive Corkboard & Red String
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Map your mental model on an authentic detective pinboard. Connect suspects, timeline events, locations, and evidence with interactive red yarn connections.
              </p>
            </div>

            {/* Feature 6: AI Detective Assistant */}
            <div className="noir-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.12)',
                border: '1px solid #A855F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Terminal size={26} color="#A855F7" />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: '#FFF', marginBottom: '0.6rem' }}>
                AI Assistant & Progressive Hints
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Stuck on a lead? Consult the Inspector’s Desk. The intelligent assistant offers progressive, non-spoiling guidance to nudge your deduction in the right direction.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ padding: '5rem 0', background: 'rgba(15, 20, 32, 0.45)', borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="stamp-classified">INVESTIGATION PROTOCOL</span>
            <h2 style={{ fontSize: '2.4rem', color: '#FFF', marginTop: '0.8rem' }}>
              The 4 Steps of Forensic Deduction
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            
            <div className="noir-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{
                fontSize: '1.8rem',
                fontFamily: 'var(--font-heading)',
                color: '#D4AF37',
                marginBottom: '0.75rem',
                fontWeight: 900
              }}>
                01
              </div>
              <h4 style={{ fontSize: '1.15rem', color: '#FFF', marginBottom: '0.5rem' }}>
                Inspect Crime Scene
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Review incident reports, manor blueprints, photos, and physical artifacts for hidden irregularities.
              </p>
            </div>

            <div className="noir-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{
                fontSize: '1.8rem',
                fontFamily: 'var(--font-heading)',
                color: '#D4AF37',
                marginBottom: '0.75rem',
                fontWeight: 900
              }}>
                02
              </div>
              <h4 style={{ fontSize: '1.15rem', color: '#FFF', marginBottom: '0.5rem' }}>
                Interrogate Suspects
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Question suspects about their whereabouts at 8:15 PM and unlock encrypted messages and alibis.
              </p>
            </div>

            <div className="noir-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{
                fontSize: '1.8rem',
                fontFamily: 'var(--font-heading)',
                color: '#D4AF37',
                marginBottom: '0.75rem',
                fontWeight: 900
              }}>
                03
              </div>
              <h4 style={{ fontSize: '1.15rem', color: '#FFF', marginBottom: '0.5rem' }}>
                Detect Contradictions
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Pair contradictory statements with timeline events and CCTV logs to dismantle fabricated stories.
              </p>
            </div>

            <div className="noir-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{
                fontSize: '1.8rem',
                fontFamily: 'var(--font-heading)',
                color: '#D4AF37',
                marginBottom: '0.75rem',
                fontWeight: 900
              }}>
                04
              </div>
              <h4 style={{ fontSize: '1.15rem', color: '#FFF', marginBottom: '0.5rem' }}>
                Make Final Accusation
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Accuse the true mastermind with supporting evidence, calculate your score, and earn detective ranks!
              </p>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleStartInvestigation}
              className="btn-gold"
              style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem', cursor: 'pointer' }}
            >
              Start Investigation <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/cases')}
              className="btn-outline-gold"
              style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem', cursor: 'pointer' }}
            >
              <Folder size={18} /> View Cases
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
