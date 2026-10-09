const db = require('../config/db');

exports.discoverHiddenClue = async (req, res) => {
  try {
    const { caseId, evidenceCode } = req.body;
    const userId = req.user.id;

    if (!evidenceCode) {
      return res.status(400).json({ success: false, message: 'Evidence code required.' });
    }

    const [rows] = await db.query('SELECT * FROM evidence WHERE code = ?', [evidenceCode]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evidence not found.' });
    }

    const ev = rows[0];

    // Save to user's progress
    const [progRows] = await db.query('SELECT * FROM investigation_progress WHERE user_id = ? AND case_id = ?', [userId, caseId]);
    let hiddenFound = [];
    let cluesFound = [];

    if (progRows && progRows.length > 0) {
      const p = progRows[0];
      hiddenFound = typeof p.hidden_clues_found === 'string' ? JSON.parse(p.hidden_clues_found) : (p.hidden_clues_found || []);
      cluesFound = typeof p.clues_found === 'string' ? JSON.parse(p.clues_found) : (p.clues_found || []);

      let newlyDiscovered = false;
      if (!hiddenFound.includes(evidenceCode)) {
        hiddenFound.push(evidenceCode);
        newlyDiscovered = true;
      }
      if (!cluesFound.includes(evidenceCode)) {
        cluesFound.push(evidenceCode);
      }

      await db.query(
        'UPDATE investigation_progress SET hidden_clues_found = ?, clues_found = ? WHERE user_id = ? AND case_id = ?',
        [JSON.stringify(hiddenFound), JSON.stringify(cluesFound), userId, caseId]
      );

      return res.json({
        success: true,
        message: newlyDiscovered ? 'Hidden Clue Discovered! +10 Detective Points' : 'Clue already recorded.',
        newlyDiscovered,
        evidence: ev,
        pointsAwarded: newlyDiscovered ? (ev.points || 10) : 0
      });
    } else {
      hiddenFound = [evidenceCode];
      cluesFound = [evidenceCode];
      await db.query(
        'INSERT INTO investigation_progress (user_id, case_id, clues_found, hidden_clues_found, questions_asked, contradictions_discovered, board_connections, locations_explored, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, caseId, JSON.stringify(cluesFound), JSON.stringify(hiddenFound), '[]', '[]', '[]', '[]', 'In Progress']
      );

      return res.json({
        success: true,
        message: 'Hidden Clue Discovered! +10 Detective Points',
        newlyDiscovered: true,
        evidence: ev,
        pointsAwarded: ev.points || 10
      });
    }
  } catch (error) {
    console.error('Discover hidden clue error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.inspectLocation = async (req, res) => {
  try {
    const { caseId, locationId, isSecondInspection } = req.body;
    const userId = req.user ? req.user.id : null;

    const [rows] = await db.query('SELECT * FROM locations WHERE id = ?', [locationId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Location not found.' });
    }

    const loc = rows[0];
    let unlockedEvidence = null;

    if (isSecondInspection && loc.hidden_clue_code) {
      const [evRows] = await db.query('SELECT * FROM evidence WHERE code = ?', [loc.hidden_clue_code]);
      if (evRows && evRows.length > 0) {
        unlockedEvidence = evRows[0];
      }
    }

    // Update explored locations in progress
    if (userId) {
      const [progRows] = await db.query('SELECT * FROM investigation_progress WHERE user_id = ? AND case_id = ?', [userId, caseId]);
      if (progRows && progRows.length > 0) {
        const p = progRows[0];
        let locs = typeof p.locations_explored === 'string' ? JSON.parse(p.locations_explored) : (p.locations_explored || []);
        let clues = typeof p.clues_found === 'string' ? JSON.parse(p.clues_found) : (p.clues_found || []);
        let hidden = typeof p.hidden_clues_found === 'string' ? JSON.parse(p.hidden_clues_found) : (p.hidden_clues_found || []);

        if (!locs.includes(locationId)) {
          locs.push(locationId);
        }
        if (unlockedEvidence) {
          if (!clues.includes(unlockedEvidence.code)) clues.push(unlockedEvidence.code);
          if (unlockedEvidence.is_hidden && !hidden.includes(unlockedEvidence.code)) hidden.push(unlockedEvidence.code);
        }

        await db.query(
          'UPDATE investigation_progress SET locations_explored = ?, clues_found = ?, hidden_clues_found = ? WHERE user_id = ? AND case_id = ?',
          [JSON.stringify(locs), JSON.stringify(clues), JSON.stringify(hidden), userId, caseId]
        );
      }
    }

    return res.json({
      success: true,
      location: loc,
      finding: isSecondInspection ? loc.second_inspection_finding : loc.search_findings,
      unlockedEvidence
    });
  } catch (error) {
    console.error('Inspect location error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
