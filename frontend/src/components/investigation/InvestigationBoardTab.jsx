import React, { useState, useMemo } from 'react';
import { detectiveAudio } from '../../services/audioService';
import { 
  Shield, Layers, Pin, Plus, Trash2, CheckCircle, 
  Sparkles, Camera, MapPin, Clock, MessageSquare, AlertCircle 
} from 'lucide-react';

const InvestigationBoardTab = ({ suspects = [], evidence = [], timeline = [], locations = [], progress, onSaveProgress }) => {
  // Dynamically generate board nodes based on active case suspects, evidence, and locations
  const boardNodes = useMemo(() => {
    const nodes = [];

    // Up to 4 suspects
    (suspects || []).slice(0, 4).forEach((s, idx) => {
      const positions = [
        { x: 60, y: 40 },
        { x: 60, y: 380 },
        { x: 350, y: 380 },
        { x: 640, y: 380 }
      ];
      nodes.push({
        id: `sus_${s.id}`,
        label: s.name,
        type: 'suspect',
        x: positions[idx]?.x || (60 + idx * 180),
        y: positions[idx]?.y || 40,
        color: '#EF4444'
      });
    });

    // Key evidence
    (evidence || []).slice(0, 3).forEach((e, idx) => {
      const positions = [
        { x: 350, y: 50 },
        { x: 210, y: 210 },
        { x: 490, y: 210 }
      ];
      nodes.push({
        id: `evd_${e.code.toLowerCase()}`,
        label: `${e.code}: ${e.title}`,
        type: 'evidence',
        x: positions[idx]?.x || (320 + idx * 160),
        y: positions[idx]?.y || 120,
        color: '#D4AF37'
      });
    });

    // Locations
    (locations || []).slice(0, 2).forEach((l, idx) => {
      nodes.push({
        id: `loc_${l.id || l.code}`,
        label: l.name,
        type: 'location',
        x: 640,
        y: 50 + idx * 160,
        color: '#38BDF8'
      });
    });

    return nodes;
  }, [suspects, evidence, locations]);

  // Saved connections (strings between nodes)
  const defaultConnections = useMemo(() => {
    if (boardNodes.length >= 3) {
      return [
        { from: boardNodes[0].id, to: boardNodes[boardNodes.length - 2].id, note: 'Primary timeline & location correlation' }
      ];
    }
    return [];
  }, [boardNodes]);

  const [connections, setConnections] = useState(
    (progress?.board_connections && progress.board_connections.length > 0)
      ? progress.board_connections
      : defaultConnections
  );

  const [activePinFrom, setActivePinFrom] = useState(null);
  const [connectionNote, setConnectionNote] = useState('');

  const handlePinClick = (node) => {
    detectiveAudio.playClick();
    if (!activePinFrom) {
      setActivePinFrom(node);
    } else if (activePinFrom.id === node.id) {
      setActivePinFrom(null); // Cancel
    } else {
      // Connect activePinFrom -> node
      detectiveAudio.playDiscovery();
      const newConn = {
        from: activePinFrom.id,
        to: node.id,
        note: connectionNote || 'Corroborating forensic connection'
      };
      const updated = [...connections, newConn];
      setConnections(updated);
      setActivePinFrom(null);
      setConnectionNote('');

      if (onSaveProgress) {
        onSaveProgress({ board_connections: updated });
      }
    }
  };

  const removeConnection = (index) => {
    detectiveAudio.playClick();
    const updated = connections.filter((_, i) => i !== index);
    setConnections(updated);
    if (onSaveProgress) {
      onSaveProgress({ board_connections: updated });
    }
  };

  const getNode = (id) => boardNodes.find(n => n.id === id);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="stamp-classified">RED YARN INVESTIGATION MATRIX</span>
          <h3 style={{ fontSize: '1.6rem', color: '#FFF', margin: '0.4rem 0 0.2rem' }}>
            Detective Pinboard & Link Analysis
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Click any two pins to thread red yarn between suspects, timeline events, evidence, and crime scenes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {activePinFrom && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              color: '#FCA5A5',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>Selected: <strong>{activePinFrom.label}</strong> (Click target pin to connect)</span>
              <button onClick={() => setActivePinFrom(null)} style={{ background: 'none', color: '#FFF', cursor: 'pointer' }}>×</button>
            </div>
          )}

          <span className="badge-tag badge-gold">
            Active Links: {connections.length}
          </span>
        </div>
      </div>

      {/* Corkboard Canvas */}
      <div className="corkboard-canvas" style={{ position: 'relative', overflow: 'hidden', minHeight: '520px' }}>
        {/* SVG Bezier Thread Lines */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
          {connections.map((c, i) => {
            const nodeA = getNode(c.from);
            const nodeB = getNode(c.to);
            if (!nodeA || !nodeB) return null;

            // Pin center offsets
            const x1 = nodeA.x + 85;
            const y1 = nodeA.y + 40;
            const x2 = nodeB.x + 85;
            const y2 = nodeB.y + 40;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 + 25;

            return (
              <g key={i}>
                <path
                  d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                  fill="none"
                  stroke="rgba(0, 0, 0, 0.6)"
                  strokeWidth="4"
                />
                <path
                  d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  strokeDasharray={i % 2 === 1 ? '4 2' : 'none'}
                />
              </g>
            );
          })}
        </svg>

        {/* Pinned Nodes */}
        {boardNodes.map((node) => {
          const isSelected = activePinFrom?.id === node.id;

          return (
            <div
              key={node.id}
              onClick={() => handlePinClick(node)}
              style={{
                position: 'absolute',
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: '170px',
                zIndex: 10,
                cursor: 'pointer'
              }}
            >
              <div
                className="polaroid-frame"
                style={{
                  background: isSelected ? '#FEF08A' : '#F1EFE7',
                  border: isSelected ? '2px solid #EF4444' : 'none',
                  transform: isSelected ? 'scale(1.05)' : 'none',
                  boxShadow: isSelected ? '0 0 20px rgba(239, 68, 68, 0.7)' : '0 6px 16px rgba(0,0,0,0.6)'
                }}
              >
                <div
                  className="polaroid-pin"
                  style={{
                    background: isSelected ? '#FBBF24' : '#DC2626',
                    transform: isSelected ? 'translateX(-50%) scale(1.3)' : 'translateX(-50%)'
                  }}
                />

                <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7280', fontWeight: 800, marginBottom: '0.2rem' }}>
                  {node.type}
                </div>

                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#111827',
                  lineHeight: 1.3,
                  fontFamily: 'var(--font-heading)'
                }}>
                  {node.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection Links Table & Hypotheses */}
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="#D4AF37" /> Established Forensic Relationships
        </h4>

        {connections.length === 0 ? (
          <div className="noir-card" style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8' }}>
            Click any two pin cards on the corkboard above to weave an investigative link.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {connections.map((c, idx) => {
              const nodeA = getNode(c.from);
              const nodeB = getNode(c.to);

              return (
                <div
                  key={idx}
                  className="noir-card"
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderLeft: '4px solid #EF4444'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{nodeA?.label || c.from}</span>
                      <span style={{ color: '#EF4444' }}>➔</span>
                      <span>{nodeB?.label || c.to}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                      {c.note}
                    </div>
                  </div>

                  <button
                    onClick={() => removeConnection(idx)}
                    className="btn-ghost"
                    style={{ padding: '0.35rem', color: '#F87171' }}
                    title="Sever link"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestigationBoardTab;
