const db = require('../config/db');

exports.getAdminOverview = async (req, res) => {
  try {
    const [cases] = await db.query('SELECT * FROM cases');
    const [suspects] = await db.query('SELECT * FROM suspects');
    const [evidence] = await db.query('SELECT * FROM evidence');
    const [timeline] = await db.query('SELECT * FROM timeline_events');
    const [users] = await db.query('SELECT id, name, email, role, badge_number, created_at FROM users');
    const [scores] = await db.query('SELECT s.*, u.name as user_name, u.email as user_email, c.title as case_title FROM scores s JOIN users u ON s.user_id = u.id JOIN cases c ON s.case_id = c.id ORDER BY s.id DESC');

    return res.json({
      success: true,
      stats: {
        totalCases: cases ? cases.length : 0,
        totalUsers: users ? users.length : 0,
        totalEvidence: evidence ? evidence.length : 0,
        totalScoresRecorded: scores ? scores.length : 0
      },
      cases: cases || [],
      suspects: suspects || [],
      evidence: evidence || [],
      timeline: timeline || [],
      users: users || [],
      scores: scores || []
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCase = async (req, res) => {
  try {
    const { case_number, title, scenario, victim_name, crime_location, crime_time, stolen_item, difficulty, estimated_time } = req.body;

    if (!case_number || !title || !scenario) {
      return res.status(400).json({ success: false, message: 'Case number, title, and scenario are required.' });
    }

    const [result] = await db.query(
      'INSERT INTO cases (case_number, title, scenario, victim_name, crime_location, crime_time, stolen_item, difficulty, estimated_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [case_number, title, scenario, victim_name || 'Unknown', crime_location || 'Unknown', crime_time || 'Unknown', stolen_item || 'Unknown', difficulty || 'Medium', estimated_time || '30 mins']
    );

    return res.status(201).json({ success: true, message: 'Case created successfully', caseId: result.insertId });
  } catch (error) {
    console.error('Create case error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addEvidence = async (req, res) => {
  try {
    const { case_id, code, title, description, detailed_content, type, is_hidden, is_red_herring, points } = req.body;

    if (!case_id || !code || !title || !type) {
      return res.status(400).json({ success: false, message: 'Case ID, code, title, and type are required.' });
    }

    const [result] = await db.query(
      'INSERT INTO evidence (case_id, code, title, description, detailed_content, type, is_hidden, is_red_herring, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [case_id, code, title, description || '', detailed_content || '', type, is_hidden ? 1 : 0, is_red_herring ? 1 : 0, points || 10]
    );

    return res.status(201).json({ success: true, message: 'Evidence added', evidenceId: result.insertId });
  } catch (error) {
    console.error('Add evidence error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
