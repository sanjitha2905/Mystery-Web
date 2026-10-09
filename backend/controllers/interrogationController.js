const db = require('../config/db');

exports.getSuspectQuestions = async (req, res) => {
  try {
    const suspectId = req.params.suspectId;
    const [questions] = await db.query(
      'SELECT id, suspect_id, question_text, order_seq FROM suspect_questions WHERE suspect_id = ? ORDER BY order_seq ASC',
      [suspectId]
    );

    return res.json({ success: true, questions: questions || [] });
  } catch (error) {
    console.error('Get suspect questions error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.askQuestion = async (req, res) => {
  try {
    const { questionId, caseId } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!questionId) {
      return res.status(400).json({ success: false, message: 'Question ID is required.' });
    }

    const [rows] = await db.query('SELECT * FROM suspect_questions WHERE id = ?', [questionId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const q = rows[0];

    // If this question unlocks evidence, fetch that evidence details
    let unlockedEvidence = null;
    if (q.reveals_evidence_code) {
      const [evRows] = await db.query('SELECT * FROM evidence WHERE code = ?', [q.reveals_evidence_code]);
      if (evRows && evRows.length > 0) {
        unlockedEvidence = evRows[0];
      }
    }

    // Update user progress if authenticated
    if (userId && caseId) {
      const [progRows] = await db.query('SELECT * FROM investigation_progress WHERE user_id = ? AND case_id = ?', [userId, caseId]);
      if (progRows && progRows.length > 0) {
        const p = progRows[0];
        let asked = typeof p.questions_asked === 'string' ? JSON.parse(p.questions_asked) : (p.questions_asked || []);
        let clues = typeof p.clues_found === 'string' ? JSON.parse(p.clues_found) : (p.clues_found || []);

        if (!asked.includes(questionId)) {
          asked.push(questionId);
        }
        if (q.reveals_evidence_code && !clues.includes(q.reveals_evidence_code)) {
          clues.push(q.reveals_evidence_code);
        }

        await db.query(
          'UPDATE investigation_progress SET questions_asked = ?, clues_found = ? WHERE user_id = ? AND case_id = ?',
          [JSON.stringify(asked), JSON.stringify(clues), userId, caseId]
        );
      }
    }

    return res.json({
      success: true,
      questionId: q.id,
      question_text: q.question_text,
      answer_text: q.answer_text,
      contradiction_hint: q.contradiction_hint,
      unlockedEvidence
    });
  } catch (error) {
    console.error('Ask question error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
