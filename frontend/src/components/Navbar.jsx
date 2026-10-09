import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { detectiveAudio } from '../services/audioService';
import { Search, Shield, Volume2, VolumeX, User, LogOut, Compass, FileText, Folder, CheckCircle, Award } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [soundOn, setSoundOn] = useState(true);

  const toggleSound = () => {
    const state = detectiveAudio.toggle();
    setSoundOn(state);
    if (state) detectiveAudio.playClick();
  };

  const handleLogout = () => {
    detectiveAudio.playClick();
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'rgba(9, 13, 21, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.18)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.85rem 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1E283E 0%, #0F1420 100%)',
            border: '1.5px solid #D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(212, 175, 55, 0.25)'
          }}>
            <Search size={22} color="#D4AF37" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#F8FAFC',
              letterSpacing: '0.08em',
              lineHeight: 1.1
            }}>
              MYSTERY <span style={{ color: '#D4AF37' }}>WEB</span>
            </div>
            <div style={{
              fontSize: '0.68rem',
              color: '#94A3B8',
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}>
              Digital Detective Bureau
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <Link
            to="/"
            style={{
              color: location.pathname === '/' ? '#F3C969' : '#94A3B8',
              fontWeight: 500,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none'
            }}
          >
            <Compass size={16} /> Home
          </Link>

          {user && (
            <>
              <Link
                to="/dashboard"
                style={{
                  color: location.pathname === '/dashboard' ? '#F3C969' : '#94A3B8',
                  fontWeight: 500,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none'
                }}
              >
                <FileText size={16} /> Dashboard
              </Link>
              <Link
                to="/cases"
                style={{
                  color: location.pathname.startsWith('/cases') ? '#F3C969' : '#94A3B8',
                  fontWeight: 500,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none'
                }}
              >
                <Folder size={16} /> Cases
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              style={{
                color: location.pathname === '/admin' ? '#F3C969' : '#94A3B8',
                fontWeight: 500,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textDecoration: 'none'
              }}
            >
              <Shield size={16} /> Admin Desk
            </Link>
          )}
        </div>

        {/* Right Section / Controls & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Audio FX Toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? 'Mute Sound FX' : 'Enable Sound FX'}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.45rem',
              color: soundOn ? '#D4AF37' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <Shield size={15} color="#D4AF37" />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F1F5F9' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#D4AF37', fontFamily: 'var(--font-mono)' }}>
                    {user.badge_number || `DET-${String(user.id || 1).padStart(4, '0')}`}
                  </div>
                </div>
              </div>

              <button
                id="navbar-logout-btn"
                onClick={handleLogout}
                className="btn-ghost"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', cursor: 'pointer' }}
                title="Logout"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn-outline-gold" style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                Login
              </Link>
              <Link to="/register" className="btn-gold" style={{ padding: '0.52rem 1.25rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                Sign Up
              </Link>
            </div>
          )}

        </div>

      </div>
    </nav>
  );
};

export default Navbar;
