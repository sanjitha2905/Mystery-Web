const db = require('../config/db');

exports.getNotes = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const userId = req.user.id;

    const [notes] = await db.query(
      'SELECT id, user_id, case_id, title, content, tag, created_at FROM case_notes WHERE user_id = ? AND case_id = ? ORDER BY id DESC',
      [userId, caseId]
    );

    return res.json({ success: true, notes: notes || [] });
  } catch (error) {
    console.error('Get notes error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { caseId, title, content, tag } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Note content is required.' });
    }

    const noteTitle = title || 'Field Note';
    const noteTag = tag || 'General';

    const [result] = await db.query(
      'INSERT INTO case_notes (user_id, case_id, title, content, tag) VALUES (?, ?, ?, ?, ?)',
      [userId, caseId, noteTitle, content, noteTag]
    );

    const newNote = {
      id: result.insertId,
      user_id: userId,
      case_id: caseId,
      title: noteTitle,
      content,
      tag: noteTag,
      created_at: new Date()
    };

    return res.status(201).json({ success: true, note: newNote });
  } catch (error) {
    console.error('Add note error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    await db.query('DELETE FROM case_notes WHERE id = ? AND user_id = ?', [noteId, userId]);

    return res.json({ success: true, message: 'Note removed from notebook.' });
  } catch (error) {
    console.error('Delete note error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
