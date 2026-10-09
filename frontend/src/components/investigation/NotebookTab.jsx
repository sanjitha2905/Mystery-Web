import React, { useState, useEffect } from 'react';
import { notebookAPI } from '../../services/api';
import { detectiveAudio } from '../../services/audioService';
import { BookOpen, Plus, Trash2, Tag, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const NotebookTab = ({ caseId }) => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Critical');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [caseId]);

  const loadNotes = async () => {
    try {
      const res = await notebookAPI.getNotes(caseId);
      if (res.success) {
        setNotes(res.notes || []);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    detectiveAudio.playTypewriter();

    try {
      const res = await notebookAPI.addNote(caseId, title || 'Field Observation', content, tag);
      if (res.success && res.note) {
        setNotes([res.note, ...notes]);
        setTitle('');
        setContent('');
      }
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    detectiveAudio.playClick();
    try {
      await notebookAPI.deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const getTagColor = (t) => {
    switch (t) {
      case 'Critical': return 'badge-red';
      case 'Suspicious': return 'badge-gold';
      case 'Red Herring': return 'badge-blue';
      default: return 'badge-green';
    }
  };

  return (
    <div>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="stamp-classified">DETECTIVE FIELD DIARY</span>
          <h3 style={{ fontSize: '1.6rem', color: '#FFF', margin: '0.4rem 0 0.2rem' }}>
            Evidence Notebook & Deductive Notes
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Record observations, flag contradictions, and organize your working theories.
          </p>
        </div>

        <span className="badge-tag badge-gold">
          Total Entries: {notes.length}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        
        {/* Add Note Form */}
        <div className="noir-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <BookOpen size={20} color="#D4AF37" />
            <h4 style={{ fontSize: '1.25rem', color: '#FFF', margin: 0 }}>Log New Deduction</h4>
          </div>

          <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: 600 }}>
                Entry Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Smashed watch points to Julian"
                className="noir-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: 600 }}>
                Classification Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="noir-input"
                style={{ background: '#090D15' }}
              >
                <option value="Critical">Critical Lead</option>
                <option value="Suspicious">Suspicious Inconsistency</option>
                <option value="Red Herring">Suspected Red Herring</option>
                <option value="General">General Note</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: 600 }}>
                Detective Observations & Notes
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your forensic deduction or questions here..."
                className="noir-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold"
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
            >
              <Plus size={18} /> {loading ? 'Logging Note...' : 'Save to Detective Notebook'}
            </button>
          </form>
        </div>

        {/* Notes Feed List */}
        <div>
          <h4 style={{ fontSize: '1.25rem', color: '#FFF', marginBottom: '1.25rem' }}>
            Recorded Field Entries ({notes.length})
          </h4>

          {notes.length === 0 ? (
            <div className="noir-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8' }}>
              Your notebook is currently empty. Record your first deduction using the form on the left!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '550px', overflowY: 'auto' }}>
              {notes.map((n) => (
                <div key={n.id} className="noir-card" style={{ padding: '1.5rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <div>
                      <span className={`badge-tag ${getTagColor(n.tag)}`} style={{ fontSize: '0.72rem', marginBottom: '0.4rem' }}>
                        {n.tag}
                      </span>
                      <h5 style={{ fontSize: '1.15rem', color: '#FFF', margin: '0.2rem 0 0' }}>
                        {n.title}
                      </h5>
                    </div>

                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      className="btn-ghost"
                      style={{ padding: '0.35rem', color: '#F87171' }}
                      title="Remove note"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 0.75rem', whiteSpace: 'pre-line' }}>
                    {n.content}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} /> Logged: {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default NotebookTab;
