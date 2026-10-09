import React from 'react';
import { AlertTriangle, RotateCcw, Home, Shield } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Mystery Web ErrorBoundary caught an anomaly:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-noir-950, #090D15)',
          padding: '2rem',
          color: '#F8FAFC'
        }}>
          <div className="noir-card" style={{
            maxWidth: '560px',
            width: '100%',
            padding: '2.5rem',
            textAlign: 'center',
            border: '1.5px solid rgba(239, 68, 68, 0.4)',
            boxShadow: '0 0 35px rgba(239, 68, 68, 0.15)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '2px solid #EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <AlertTriangle size={32} color="#EF4444" />
            </div>

            <span className="stamp-classified" style={{ borderColor: '#EF4444', color: '#F87171', marginBottom: '0.8rem', display: 'inline-block' }}>
              FORENSIC SYSTEM ANOMALY
            </span>

            <h2 style={{ fontSize: '1.75rem', color: '#FFFFFF', margin: '0.5rem 0 1rem' }}>
              Detective Terminal Disrupted
            </h2>

            <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              An unexpected anomaly occurred while rendering this confidential file. The forensic logs have recorded the incident.
            </p>

            {this.state.error?.message && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                color: '#FCA5A5',
                textAlign: 'left',
                marginBottom: '1.75rem',
                overflowX: 'auto',
                maxHeight: '120px'
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                className="btn-gold"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
              >
                <RotateCcw size={16} /> Reload Bureau
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn-outline-gold"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
              >
                <Home size={16} /> Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
