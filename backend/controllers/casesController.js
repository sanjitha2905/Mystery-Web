const db = require('../config/db');

exports.getAllCases = async (req, res) => {
  try {
    const [cases] = await db.query(
      'SELECT id, case_number, title, scenario, victim_name, crime_location, crime_time, stolen_item, difficulty, estimated_time, status, created_at, conclusion_type FROM cases ORDER BY id ASC'
    );

    const userId = req.user ? req.user.id : null;

    // Fetch suspect counts
    const [suspectCounts] = await db.query('SELECT case_id, COUNT(*) as count FROM suspects GROUP BY case_id');
    const suspectCountMap = {};
    (suspectCounts || []).forEach(r => { suspectCountMap[r.case_id] = r.count; });

    // Fetch evidence totals
    const [evidenceCounts] = await db.query('SELECT case_id, COUNT(*) as count FROM evidence GROUP BY case_id');
    const evidenceCountMap = {};
    (evidenceCounts || []).forEach(r => { evidenceCountMap[r.case_id] = r.count; });

    // Fetch scores if user logged in
    let scores = [];
    let progressList = [];
    if (userId) {
      const [userScores] = await db.query('SELECT case_id, score, rank_title, accuracy_percent FROM scores WHERE user_id = ?', [userId]);
      scores = userScores || [];

      const [userProgress] = await db.query('SELECT case_id, clues_found, hidden_clues_found, status FROM investigation_progress WHERE user_id = ?', [userId]);
      progressList = userProgress || [];
    }

    const enhancedCases = (cases || []).map(c => {
      const userScore = scores.find(s => s.case_id === c.id);
      const userProg = progressList.find(p => p.case_id === c.id);

      let cluesDiscoveredCount = 0;
      let investigationStatus = 'Not Started';

      if (userProg) {
        const cFound = typeof userProg.clues_found === 'string' ? JSON.parse(userProg.clues_found) : (userProg.clues_found || []);
        const hFound = typeof userProg.hidden_clues_found === 'string' ? JSON.parse(userProg.hidden_clues_found) : (userProg.hidden_clues_found || []);
        cluesDiscoveredCount = new Set([...cFound, ...hFound]).size;
        investigationStatus = userProg.status || 'In Progress';
      }

      if (userScore) {
        investigationStatus = 'Completed';
      }

      return {
        ...c,
        suspectCount: suspectCountMap[c.id] || 4,
        cluesTotal: evidenceCountMap[c.id] || 6,
        cluesDiscovered: cluesDiscoveredCount,
        investigationStatus,
        solved: !!userScore,
        userScore: userScore ? userScore.score : null,
        userRank: userScore ? userScore.rank_title : null
      };
    });

    return res.json({ success: true, cases: enhancedCases });
  } catch (error) {
    console.error('Get all cases error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCaseDetails = async (req, res) => {
  try {
    const caseId = req.params.id;
    const userId = req.user ? req.user.id : null;

    // Fetch case info (never expose is_culprit or solution to player)
    const [caseRows] = await db.query(
      'SELECT id, case_number, title, scenario, victim_name, crime_location, crime_time, stolen_item, difficulty, estimated_time, status, conclusion_type FROM cases WHERE id = ?',
      [caseId]
    );
    if (!caseRows || caseRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }
    const caseData = caseRows[0];

    // Fetch suspects (hide is_culprit)
    const [suspectRows] = await db.query(
      'SELECT id, case_id, name, age, occupation, relationship, known_location, statement, motive, alibi, avatar_url, suspicion_level FROM suspects WHERE case_id = ?',
      [caseId]
    );

    // Fetch evidence (hide secret solution data if any)
    const [evidenceRows] = await db.query(
      'SELECT id, case_id, code, title, description, detailed_content, type, discovery_condition, is_hidden, hidden_hint, is_red_herring, related_suspect_id, related_location_id, image_url, interactive_type, points FROM evidence WHERE case_id = ?',
      [caseId]
    );

    // Fetch messages
    const [messageRows] = await db.query(
      'SELECT id, case_id, platform, sender, receiver, timestamp_str, content, is_suspicious, related_suspect_id FROM messages WHERE case_id = ?',
      [caseId]
    );

    // Fetch timeline events
    const [timelineRows] = await db.query(
      'SELECT id, case_id, time_str, title, description, location_name, involved_suspect_id, has_conflict, conflict_details, order_seq FROM timeline_events WHERE case_id = ? ORDER BY order_seq ASC',
      [caseId]
    );

    // Fetch locations
    const [locationRows] = await db.query(
      'SELECT id, case_id, code, name, description, floor, search_findings, second_inspection_finding, hidden_clue_code, icon_name FROM locations WHERE case_id = ?',
      [caseId]
    );

    // Fetch contradictions catalog (labels only, so detective can match them)
    const [contradictionRows] = await db.query(
      'SELECT id, case_id, code, title, item_a_label, item_b_label, item_a_code, item_b_code, points FROM contradictions WHERE case_id = ?',
      [caseId]
    );

    // Default immediate clues dynamically derived from the active case
    const defaultImmediateClues = (evidenceRows || []).filter(e => !e.is_hidden).map(e => e.code);

    let progress = {
      clues_found: defaultImmediateClues,
      hidden_clues_found: [],
      questions_asked: [],
      contradictions_discovered: [],
      board_connections: [],
      locations_explored: [],
      status: 'Not Started'
    };

    if (userId) {
      const [progRows] = await db.query('SELECT * FROM investigation_progress WHERE user_id = ? AND case_id = ?', [userId, caseId]);
      if (progRows && progRows.length > 0) {
        const p = progRows[0];
        const savedClues = typeof p.clues_found === 'string' ? JSON.parse(p.clues_found) : (p.clues_found || []);
        const mergedClues = Array.from(new Set([...defaultImmediateClues, ...(Array.isArray(savedClues) ? savedClues : [])]));

        progress = {
          clues_found: mergedClues,
          hidden_clues_found: typeof p.hidden_clues_found === 'string' ? JSON.parse(p.hidden_clues_found) : (p.hidden_clues_found || []),
          questions_asked: typeof p.questions_asked === 'string' ? JSON.parse(p.questions_asked) : (p.questions_asked || []),
          contradictions_discovered: typeof p.contradictions_discovered === 'string' ? JSON.parse(p.contradictions_discovered) : (p.contradictions_discovered || []),
          board_connections: typeof p.board_connections === 'string' ? JSON.parse(p.board_connections) : (p.board_connections || []),
          locations_explored: typeof p.locations_explored === 'string' ? JSON.parse(p.locations_explored) : (p.locations_explored || []),
          status: p.status || 'In Progress'
        };
      }
    }

    return res.json({
      success: true,
      case: caseData,
      suspects: suspectRows || [],
      evidence: evidenceRows || [],
      messages: messageRows || [],
      timeline: timelineRows || [],
      locations: locationRows || [],
      contradictions: contradictionRows || [],
      progress
    });
  } catch (error) {
    console.error('Get case details error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveProgress = async (req, res) => {
  try {
    const caseId = req.params.id;
    const userId = req.user.id;
    const {
      clues_found,
      hidden_clues_found,
      questions_asked,
      contradictions_discovered,
      board_connections,
      locations_explored,
      status
    } = req.body;

    const [existing] = await db.query('SELECT id FROM investigation_progress WHERE user_id = ? AND case_id = ?', [userId, caseId]);

    const pClues = JSON.stringify(clues_found || []);
    const pHidden = JSON.stringify(hidden_clues_found || []);
    const pQuestions = JSON.stringify(questions_asked || []);
    const pContra = JSON.stringify(contradictions_discovered || []);
    const pBoard = JSON.stringify(board_connections || []);
    const pLocs = JSON.stringify(locations_explored || []);
    const pStatus = status || 'In Progress';

    if (existing && existing.length > 0) {
      await db.query(
        'UPDATE investigation_progress SET clues_found = ?, hidden_clues_found = ?, questions_asked = ?, contradictions_discovered = ?, board_connections = ?, locations_explored = ?, status = ? WHERE user_id = ? AND case_id = ?',
        [pClues, pHidden, pQuestions, pContra, pBoard, pLocs, pStatus, userId, caseId]
      );
    } else {
      await db.query(
        'INSERT INTO investigation_progress (user_id, case_id, clues_found, hidden_clues_found, questions_asked, contradictions_discovered, board_connections, locations_explored, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, caseId, pClues, pHidden, pQuestions, pContra, pBoard, pLocs, pStatus]
      );
    }

    return res.json({ success: true, message: 'Investigation progress saved.' });
  } catch (error) {
    console.error('Save progress error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
