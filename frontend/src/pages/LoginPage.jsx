import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { detectiveAudio } from '../services/audioService';
import { Shield, KeyRound, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    detectiveAudio.playClick();

    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        detectiveAudio.playDiscovery();
        navigate('/dashboard', {
          state: { welcomeMessage: `Welcome, ${res.user?.name || 'Detective'}!` }
        });
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('test@example.com');
    setPassword('123456');
    setError('');
    setLoading(true);
    detectiveAudio.playClick();
    try {
      const res = await login('test@example.com', '123456');
      if (res.success) {
        detectiveAudio.playDiscovery();
        navigate('/dashboard', {
          state: { welcomeMessage: `Welcome, ${res.user?.name || 'Detective'}!` }
        });
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div className="noir-card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', position: 'relative' }}>
        
        {/* Card Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1E283E 0%, #0F1420 100%)',
            border: '2px solid #D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
          }}>
            <Shield size={30} color="#D4AF37" />
          </div>
          <span className="stamp-classified" style={{ marginBottom: '0.6rem' }}>PERSONNEL IDENTIFICATION</span>
          <h2 style={{ fontSize: '1.8rem', color: '#FFF', marginTop: '0.5rem' }}>
            Detective Terminal Access
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Enter your credentials to access active case files.
          </p>
        </div>

        {/* Success notification from registration */}
        {successMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid #10B981',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#6EE7B7',
            fontSize: '0.88rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#FCA5A5',
            fontSize: '0.88rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: 600 }}>
              Official Detective Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="noir-input"
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading}
              />
              <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: 600 }}>
              Access Passphrase
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="noir-input"
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading}
              />
              <KeyRound size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-gold"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.85rem',
              marginTop: '0.5rem',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Authenticating...' : 'Login'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Fast Login */}
        <div style={{ marginTop: '1.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem', textAlign: 'center' }}>
          <button
            type="button"
            id="quick-demo-btn"
            onClick={handleDemoLogin}
            className="btn-ghost"
            style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', width: '100%', justifyContent: 'center' }}
          >
            Fill & Login as Test User (test@example.com)
          </button>
        </div>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#94A3B8' }}>
          Not registered with the bureau yet?{' '}
          <Link to="/register" style={{ color: '#D4AF37', fontWeight: 600 }}>
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
