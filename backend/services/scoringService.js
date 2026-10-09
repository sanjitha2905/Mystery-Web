/**
 * Mystery Web - Detective Scoring Service
 * Implements the 100-Point Transparent Detective Evaluation Rubric:
 * - Correct Conclusion: 40 points
 * - Relevant Supporting Evidence: 25 points
 * - Hidden Clues Discovered: 15 points
 * - Contradictions Identified: 10 points
 * - Quality of Written Reasoning: 10 points (Transparent Rule-Based Rubric)
 */

function evaluateReasoningQuality(deductionText = '', keyKeywords = []) {
  const text = (deductionText || '').trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let points = 0;
  const feedback = [];

  // Criteria 1: Depth & Detail (Word Count >= 15 words: +3, >= 30 words: +3 max)
  if (wordCount >= 15) {
    points += 3;
    feedback.push('Thorough narrative explanation provided (15+ words) [+3]');
  } else if (wordCount >= 8) {
    points += 1;
    feedback.push('Brief narrative explanation provided [+1]');
  } else {
    feedback.push('Explanation is too brief (minimum 15 words recommended) [+0]');
  }

  // Criteria 2: Causal & Deductive Connectives (+3)
  const logicalConnectors = [
    'because', 'since', 'proves', 'indicated', 'indicates', 'reveals', 'revealed',
    'contradicts', 'contradiction', 'confirmed', 'confirms', 'timeline', 'timestamp',
    'therefore', 'log', 'access', 'alibi', 'evidence', 'showed', 'shows'
  ];
  const lowerText = text.toLowerCase();
  const matchedConnectors = logicalConnectors.filter(c => lowerText.includes(c));
  if (matchedConnectors.length >= 2) {
    points += 3;
    feedback.push(`Strong causal deductions used (${matchedConnectors.slice(0, 3).join(', ')}) [+3]`);
  } else if (matchedConnectors.length === 1) {
    points += 2;
    feedback.push(`Causal connective identified (${matchedConnectors[0]}) [+2]`);
  } else {
    feedback.push('Lacks deductive connectors (e.g. "because", "contradicts", "proves") [+0]');
  }

  // Criteria 3: Case-Specific Evidence & Fact References (+4)
  const defaultEvidenceTerms = [
    'key', 'log', 'bag', 'fiber', 'velvet', 'card', 'usb', 'printer', 'spool',
    'clock', 'envelope', 'screwdriver', 'cufflink', 'cctv', 'receipt', 'note',
    'backpack', 'email', 'scheduled', 'kiosk', 'ticket', 'pm', 'am', 'camera', 'photo'
  ];
  const termsToCheck = [...new Set([...keyKeywords.map(k => k.toLowerCase()), ...defaultEvidenceTerms])];
  const matchedTerms = termsToCheck.filter(t => lowerText.includes(t));

  if (matchedTerms.length >= 3) {
    points += 4;
    feedback.push(`Multiple case facts and forensics cited (${matchedTerms.slice(0, 4).join(', ')}) [+4]`);
  } else if (matchedTerms.length >= 1) {
    points += 2;
    feedback.push(`Referenced case evidence (${matchedTerms.slice(0, 2).join(', ')}) [+2]`);
  } else {
    feedback.push('No direct forensic clues or timestamps cited [+0]');
  }

  return {
    points: Math.min(10, points),
    rubricFeedback: feedback.join(' • ')
  };
}

function calculateScore({
  isCorrectCulprit = false,
  isCorrectConclusion = null,
  cluesFoundCount = 0,
  totalCluesCount = 1,
  hiddenCluesCount = 0,
  totalHiddenCount = 1,
  contradictionsFoundCount = 0,
  totalContradictionsCount = 2,
  selectedEvidenceCodes = [],
  keyIncriminatingCodes = [],
  redHerringCodes = [],
  deductionText = '',
  keyKeywords = [],
  previousAttempts = 0
}) {
  const isCorrect = isCorrectConclusion !== null ? isCorrectConclusion : isCorrectCulprit;

  const breakdown = {
    conclusionPoints: 0,
    evidencePoints: 0,
    hiddenCluesPoints: 0,
    contradictionPoints: 0,
    reasoningPoints: 0,
    reasoningRubricDetails: '',
    redHerringsPenalty: 0,
    totalScore: 0
  };

  // 1. Correct Conclusion: 40 points
  if (isCorrect) {
    breakdown.conclusionPoints = 40;
  }

  // 2. Relevant Supporting Evidence: Up to 25 points
  const totalKeyEvidence = keyIncriminatingCodes.length > 0 ? keyIncriminatingCodes.length : 2;
  const matchedKeyCodes = (selectedEvidenceCodes || []).filter(code =>
    keyIncriminatingCodes.map(c => c.toLowerCase()).includes(code.toLowerCase())
  );

  let evPoints = 0;
  if (totalKeyEvidence > 0) {
    evPoints = Math.round((matchedKeyCodes.length / totalKeyEvidence) * 25);
  }
  // Penalize for picking red herrings as core supporting proof
  const selectedRedHerrings = (selectedEvidenceCodes || []).filter(code =>
    redHerringCodes.map(c => c.toLowerCase()).includes(code.toLowerCase())
  );
  let redHerringDeduction = selectedRedHerrings.length * 4;
  breakdown.redHerringsPenalty = redHerringDeduction;
  breakdown.evidencePoints = Math.max(0, Math.min(25, evPoints - redHerringDeduction));

  // 3. Hidden Clues Discovered: Up to 15 points
  const safeTotalHidden = totalHiddenCount > 0 ? totalHiddenCount : 1;
  const hiddenRatio = Math.min(1, hiddenCluesCount / safeTotalHidden);
  breakdown.hiddenCluesPoints = Math.round(hiddenRatio * 15);

  // 4. Contradictions Identified: Up to 10 points
  const safeTotalContras = totalContradictionsCount > 0 ? totalContradictionsCount : 2;
  const contraRatio = Math.min(1, contradictionsFoundCount / safeTotalContras);
  breakdown.contradictionPoints = Math.round(contraRatio * 10);

  // 5. Written Reasoning Quality: Up to 10 points
  const reasoningEval = evaluateReasoningQuality(deductionText, keyKeywords);
  breakdown.reasoningPoints = reasoningEval.points;
  breakdown.reasoningRubricDetails = reasoningEval.rubricFeedback;

  // Calculate Total Raw Score (0 - 100)
  let rawScore = (
    breakdown.conclusionPoints +
    breakdown.evidencePoints +
    breakdown.hiddenCluesPoints +
    breakdown.contradictionPoints +
    breakdown.reasoningPoints
  );

  // Minor penalty for multiple repeated wrong submissions
  if (previousAttempts > 0 && !isCorrect) {
    rawScore = Math.max(5, rawScore - Math.min(10, previousAttempts * 3));
  }

  const score = Math.max(0, Math.min(100, rawScore));
  breakdown.totalScore = score;

  // Detective Rank
  let rank_title = 'Novice Detective ⭐';
  if (score >= 90) rank_title = 'Master Detective ⭐⭐⭐⭐⭐';
  else if (score >= 75) rank_title = 'Expert Detective ⭐⭐⭐⭐';
  else if (score >= 60) rank_title = 'Senior Detective ⭐⭐⭐';
  else if (score >= 40) rank_title = 'Investigator ⭐⭐';

  const accuracy_percent = isCorrect ? Math.max(65, score) : Math.min(45, Math.max(10, score));

  return {
    score,
    rank_title,
    accuracy_percent,
    breakdown
  };
}

module.exports = {
  calculateScore,
  evaluateReasoningQuality
};
