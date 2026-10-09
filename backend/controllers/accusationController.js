const db = require('../config/db');
const { calculateScore } = require('../services/scoringService');

exports.submitAccusation = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      caseId,
      accusedSuspectId,
      conclusionType = 'criminal',
      conclusionKey,
      deductionText,
      selectedEvidenceCodes = []
    } = req.body;

    if (!deductionText || (!accusedSuspectId && !conclusionKey)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a suspect or conclusion, and provide your deductive reasoning.'
      });
    }

    // Fetch case details from database
    const [caseRows] = await db.query('SELECT * FROM cases WHERE id = ?', [caseId]);
    if (!caseRows || caseRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }
    const caseData = caseRows[0];

    // Fetch all suspects for this case
    const [suspectRows] = await db.query('SELECT * FROM suspects WHERE case_id = ?', [caseId]);
    const suspects = suspectRows || [];

    const isNonCriminalCase = caseData.conclusion_type === 'non_criminal';
    let isCorrect = false;
    let accusedSuspect = null;
    let actualCulprit = null;
    let correctConclusionTitle = '';

    if (isNonCriminalCase) {
      // Case MW-005 (The Vanishing Student)
      const selectedNonCriminal =
        conclusionType === 'non_criminal' ||
        conclusionKey === 'PLANNED_DISAPPEARANCE' ||
        accusedSuspectId === 'PLANNED_DISAPPEARANCE';

      // Also accept if they selected Nikhil as the person of interest who staged his own departure
      const selectedNikhil = suspects.find(
        s => String(s.id) === String(accusedSuspectId) && s.name.toLowerCase().includes('nikhil')
      );

      isCorrect = Boolean(selectedNonCriminal || selectedNikhil);
      correctConclusionTitle = 'Planned Disappearance Solved (Non-Criminal Outcome)';

      if (selectedNikhil) {
        accusedSuspect = selectedNikhil;
      } else {
        accusedSuspect = {
          id: 'PLANNED_DISAPPEARANCE',
          name: 'Planned Disappearance (Nikhil)',
          occupation: 'Missing Student / Self-Departure'
        };
      }

      actualCulprit = {
        id: null,
        name: 'No Criminal Culprit (Planned Departure by Nikhil)',
        occupation: 'Student at Greenfield College',
        motive: 'Mental health break from academic overload and hackathon pressure.',
        statement: 'Left voluntarily to stay with relatives in Pune; no crime occurred.'
      };
    } else {
      // Standard Criminal Cases (MW-001, MW-002, MW-003, MW-004)
      accusedSuspect = suspects.find(s => String(s.id) === String(accusedSuspectId));
      actualCulprit = suspects.find(s => s.is_culprit === 1 || s.id === caseData.culprit_suspect_id);

      if (!accusedSuspect) {
        accusedSuspect = { id: accusedSuspectId, name: 'Unknown Suspect', occupation: 'Unspecified' };
      }

      isCorrect = Boolean(actualCulprit && String(accusedSuspectId) === String(actualCulprit.id));
      correctConclusionTitle = actualCulprit ? `Culprit Identified: ${actualCulprit.name}` : 'Case Solved';
    }

    // Fetch user progress
    const [progRows] = await db.query('SELECT * FROM investigation_progress WHERE user_id = ? AND case_id = ?', [userId, caseId]);
    let pClues = [];
    let pHidden = [];
    let pContra = [];

    if (progRows && progRows.length > 0) {
      const p = progRows[0];
      pClues = typeof p.clues_found === 'string' ? JSON.parse(p.clues_found) : (p.clues_found || []);
      pHidden = typeof p.hidden_clues_found === 'string' ? JSON.parse(p.hidden_clues_found) : (p.hidden_clues_found || []);
      pContra = typeof p.contradictions_discovered === 'string' ? JSON.parse(p.contradictions_discovered) : (p.contradictions_discovered || []);
    }

    // Fetch all evidence for this case
    const [allEvidence] = await db.query('SELECT * FROM evidence WHERE case_id = ?', [caseId]);
    const totalEvidence = allEvidence || [];
    const totalHidden = totalEvidence.filter(e => e.is_hidden).length;

    // Fetch contradictions count
    const [allContras] = await db.query('SELECT * FROM contradictions WHERE case_id = ?', [caseId]);
    const totalContradictions = (allContras && allContras.length > 0) ? allContras.length : 2;

    // Parse key incriminating codes & red herrings from case data
    let keyCodes = [];
    let redCodes = [];
    try {
      if (caseData.key_evidence_codes) {
        keyCodes = typeof caseData.key_evidence_codes === 'string' ? JSON.parse(caseData.key_evidence_codes) : caseData.key_evidence_codes;
      }
      if (caseData.red_herring_codes) {
        redCodes = typeof caseData.red_herring_codes === 'string' ? JSON.parse(caseData.red_herring_codes) : caseData.red_herring_codes;
      }
    } catch (e) {
      // Fallback
    }

    // Fallbacks if not set in DB
    if (!keyCodes || keyCodes.length === 0) {
      if (caseData.case_number === 'MW-001') keyCodes = ['EVD-MW1-E02', 'EVD-MW1-E05', 'EVD-MW1-E06'];
      else if (caseData.case_number === 'MW-002') keyCodes = ['EVD-MW2-E02', 'EVD-MW2-E06', 'EVD-MW2-E03'];
      else if (caseData.case_number === 'MW-003') keyCodes = ['EVD-MW3-E02', 'EVD-MW3-E05', 'EVD-MW3-E06'];
      else if (caseData.case_number === 'MW-004') keyCodes = ['EVD-MW4-E06', 'EVD-MW4-E05', 'EVD-MW4-E01'];
      else if (caseData.case_number === 'MW-005') keyCodes = ['EVD-MW5-E05', 'EVD-MW5-E06', 'EVD-MW5-E03'];
    }

    if (!redCodes || redCodes.length === 0) {
      redCodes = totalEvidence.filter(e => e.is_red_herring).map(e => e.code);
    }

    // Check previous attempts
    const [prevAccusations] = await db.query('SELECT * FROM accusations WHERE user_id = ? AND case_id = ?', [userId, caseId]);
    const previousAttempts = prevAccusations ? prevAccusations.length : 0;

    // Calculate transparent score
    const scoringResult = calculateScore({
      isCorrectConclusion: isCorrect,
      cluesFoundCount: pClues.length,
      totalCluesCount: totalEvidence.length,
      hiddenCluesCount: pHidden.length,
      totalHiddenCount: totalHidden,
      contradictionsFoundCount: pContra.length,
      totalContradictionsCount: totalContradictions,
      selectedEvidenceCodes,
      keyIncriminatingCodes: keyCodes,
      redHerringCodes: redCodes,
      deductionText,
      previousAttempts
    });

    // Record accusation in database
    const rawSuspectId = (accusedSuspectId && !isNaN(Number(accusedSuspectId))) ? Number(accusedSuspectId) : null;
    const suspectExists = suspects.some(s => s.id === rawSuspectId);
    const suspectIdCol = suspectExists ? rawSuspectId : null;
    const finalConclusionKey = isNonCriminalCase ? 'PLANNED_DISAPPEARANCE' : (conclusionKey || null);
    const finalConclusionType = isNonCriminalCase ? 'non_criminal' : 'criminal';
    const selectedEvJson = JSON.stringify(selectedEvidenceCodes);

    let insertAccSql = `INSERT INTO accusations (
      user_id, case_id, suspect_id, accused_suspect_id, reasoning, deduction_text,
      selected_evidence_codes, is_correct, conclusion_type, conclusion_key
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    let accResult;
    try {
      [accResult] = await db.query(insertAccSql, [
        userId, caseId, suspectIdCol, suspectIdCol, deductionText, deductionText,
        selectedEvJson, isCorrect ? 1 : 0, finalConclusionType, finalConclusionKey
      ]);
    } catch (colErr) {
      // Fallback if schema does not have conclusion_key yet
      [accResult] = await db.query(
        'INSERT INTO accusations (user_id, case_id, accused_suspect_id, deduction_text, selected_evidence_codes, is_correct) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, caseId, suspectIdCol, deductionText, selectedEvJson, isCorrect ? 1 : 0]
      );
    }

    const accusationId = accResult.insertId;

    // Record or update score
    await db.query(
      'INSERT INTO scores (user_id, case_id, accusation_id, score, rank_title, accuracy_percent, breakdown) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId, caseId, accusationId, scoringResult.score, scoringResult.rank_title,
        scoringResult.accuracy_percent, JSON.stringify(scoringResult.breakdown)
      ]
    );

    // Update investigation progress status
    await db.query(
      'UPDATE investigation_progress SET status = ? WHERE user_id = ? AND case_id = ?',
      [isCorrect ? 'Completed' : 'In Progress', userId, caseId]
    );

    // Prepare human-readable key evidence titles
    const keyEvidenceDetails = totalEvidence
      .filter(e => keyCodes.map(k => k.toLowerCase()).includes(e.code.toLowerCase()))
      .map(e => `${e.code}: ${e.title}`);

    // Red herrings encountered
    const encounteredRedHerrings = totalEvidence
      .filter(e => redCodes.map(r => r.toLowerCase()).includes(e.code.toLowerCase()) && selectedEvidenceCodes.map(c => c.toLowerCase()).includes(e.code.toLowerCase()))
      .map(e => `${e.code}: ${e.title} (${e.red_herring_explanation || 'Misleading circumstantial clue'})`);

    const missedClues = totalEvidence.filter(e => !pClues.map(c => c.toLowerCase()).includes(e.code.toLowerCase()));

    return res.json({
      success: true,
      isCorrect,
      score: scoringResult.score,
      rankTitle: scoringResult.rank_title,
      accuracyPercent: scoringResult.accuracy_percent,
      breakdown: scoringResult.breakdown,
      correctConclusionTitle,
      accusedSuspect: {
        id: accusedSuspect.id,
        name: accusedSuspect.name,
        occupation: accusedSuspect.occupation
      },
      actualCulprit: {
        id: actualCulprit.id,
        name: actualCulprit.name,
        occupation: actualCulprit.occupation,
        motive: actualCulprit.motive,
        statement: actualCulprit.statement
      },
      solution: {
        title: caseData.title,
        caseNumber: caseData.case_number,
        conclusionType: caseData.conclusion_type,
        motiveSummary: caseData.motive_summary,
        solutionBreakdown: caseData.solution_breakdown,
        keyEvidence: keyEvidenceDetails,
        redHerrings: encounteredRedHerrings,
        redHerringExplanation: encounteredRedHerrings.length > 0 ? encounteredRedHerrings.join('; ') : 'No misleading red herrings selected.'
      },
      investigationStats: {
        cluesFound: pClues.length,
        totalClues: totalEvidence.length,
        hiddenCluesFound: pHidden.length,
        totalHiddenClues: totalHidden,
        missedCluesCount: missedClues.length,
        missedClues: missedClues.map(c => ({ code: c.code, title: c.title })),
        redHerringsEncountered: encounteredRedHerrings
      }
    });
  } catch (error) {
    console.error('Submit accusation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const caseId = req.params.caseId;

    const [scores] = await db.query(
      'SELECT * FROM scores WHERE user_id = ? AND case_id = ? ORDER BY id DESC',
      [userId, caseId]
    );
    return res.json({ success: true, scores: scores || [] });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
