const db = require('../config/db');

exports.checkContradiction = async (req, res) => {
  try {
    const { caseId, itemAId, itemBId } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!itemAId || !itemBId) {
      return res.status(400).json({ success: false, message: 'Please select two items to cross-examine.' });
    }

    const [rows] = await db.query('SELECT * FROM contradictions WHERE case_id = ?', [caseId]);
    const contradictions = rows || [];

    const strA = String(itemAId).toLowerCase().trim();
    const strB = String(itemBId).toLowerCase().trim();
    const ids = [strA, strB];

    let matched = null;

    for (const c of contradictions) {
      const cA = String(c.item_a_code || '').toLowerCase().trim();
      const cB = String(c.item_b_code || '').toLowerCase().trim();
      const directContraA = `contra_a_${c.id}`.toLowerCase();
      const directContraB = `contra_b_${c.id}`.toLowerCase();

      // Direct code match
      if (
        (ids.includes(cA) && ids.includes(cB)) ||
        (ids.includes(directContraA) && ids.includes(directContraB))
      ) {
        matched = c;
        break;
      }

      // Cross-match if itemAId was suspect name/id and itemBId was evidence code
      const cCode = String(c.code || '').toLowerCase();
      if (ids.includes(cCode)) {
        matched = c;
        break;
      }

      // Check if evidence code matches cB and suspect name/id matches cA
      if (
        (strA.includes(cA) || cA.includes(strA) || strA.includes(String(c.implicated_suspect_id || '---'))) &&
        (strB.includes(cB) || cB.includes(strB))
      ) {
        matched = c;
        break;
      }
      if (
        (strB.includes(cA) || cA.includes(strB) || strB.includes(String(c.implicated_suspect_id || '---'))) &&
        (strA.includes(cB) || cB.includes(strA))
      ) {
        matched = c;
        break;
      }
    }

    if (!matched) {
      return res.json({
        success: true,
        isContradiction: false,
        message: 'No direct contradiction detected between these two items. Review suspect timelines, access timestamps, and physical items carefully.'
      });
    }

    let newlyDiscovered = false;

    // Save discovered contradiction to user's progress if authenticated
    if (userId) {
      const [progRows] = await db.query('SELECT * FROM investigation_progress WHERE user_id = ? AND case_id = ?', [userId, caseId]);
      if (progRows && progRows.length > 0) {
        const p = progRows[0];
        let discovered = typeof p.contradictions_discovered === 'string' ? JSON.parse(p.contradictions_discovered) : (p.contradictions_discovered || []);
        if (!discovered.includes(matched.code)) {
          discovered.push(matched.code);
          newlyDiscovered = true;
        }
        await db.query(
          'UPDATE investigation_progress SET contradictions_discovered = ? WHERE user_id = ? AND case_id = ?',
          [JSON.stringify(discovered), userId, caseId]
        );
      }
    }

    return res.json({
      success: true,
      isContradiction: true,
      newlyDiscovered,
      contradiction: matched,
      pointsAwarded: newlyDiscovered ? (matched.points || 10) : 0,
      message: `Critical Contradiction Confirmed: ${matched.title}!`
    });
  } catch (error) {
    console.error('Check contradiction error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getContradictions = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const [rows] = await db.query('SELECT * FROM contradictions WHERE case_id = ?', [caseId]);
    return res.json({ success: true, contradictions: rows || [] });
  } catch (error) {
    console.error('Get contradictions error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
