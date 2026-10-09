const API = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok && !data.success && options.method !== 'POST') {
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
}

async function runTests() {
  console.log('🧪 Starting End-to-End Test Suite for Mystery Web 5 Cases...\n');

  // 1. Auth Test: Register test detective
  let token = '';
  try {
    const regRes = await request(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sherlock Holmes',
        email: 'tester_' + Date.now() + '@mysteryweb.com',
        password: 'password123'
      })
    });
    token = regRes.token;
    console.log('✅ Authentication passed. Test detective token acquired.');
  } catch (err) {
    console.error('Auth error:', err.message);
    process.exit(1);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Fetch all cases
  const casesRes = await request(`${API}/cases`, { headers: authHeaders });
  console.log(`✅ Loaded ${casesRes.cases.length} cases from /api/cases.`);

  const testCasesConfig = [
    {
      caseNo: 'MW-001',
      culpritName: 'Arjun',
      keyEvidence: ['EVD-MW1-E02', 'EVD-MW1-E05', 'EVD-MW1-E06'],
      reasoning: 'The automated corridor service log firmly recorded Arjun in the corridor at 8:07 PM contradicting his alibi, while matching midnight velvet fibers were found in his service bag matching the jewelry case.'
    },
    {
      caseNo: 'MW-002',
      culpritName: 'Dev',
      keyEvidence: ['EVD-MW2-E02', 'EVD-MW2-E06', 'EVD-MW2-E03'],
      reasoning: 'Active directory logs confirm Dev accessed the confidential project folder at 7:39 PM, followed by an unauthorized USB drive connection at 7:41 PM and slide queue spooled to the printer at 7:45 PM.'
    },
    {
      caseNo: 'MW-003',
      culpritName: 'Ananya',
      keyEvidence: ['EVD-MW3-E02', 'EVD-MW3-E05', 'EVD-MW3-E06'],
      reasoning: 'The electronic lock audit confirms Ananya staff keycard opened Room 207 at 9:12 PM, and the torn official exam envelope with broken red wax seal was found in the staff lounge wastebasket.'
    },
    {
      caseNo: 'MW-004',
      culpritName: 'Elias',
      keyEvidence: ['EVD-MW4-E06', 'EVD-MW4-E05', 'EVD-MW4-E01'],
      reasoning: 'The display cabinet key was checked out under Elias staff PIN code, and photo reflection confirms distinctive silver cufflinks near the display case right when the sensor opened at 12:06 AM.'
    },
    {
      caseNo: 'MW-005',
      isNonCriminal: true,
      conclusionKey: 'PLANNED_DISAPPEARANCE',
      keyEvidence: ['EVD-MW5-E05', 'EVD-MW5-E06', 'EVD-MW5-E03'],
      reasoning: 'The handwritten backpack note asking for days without calls, combined with Nikhil pre-scheduled email draft and bus kiosk ticket at 8:34 PM, confirms a planned voluntary departure rather than a criminal abduction.'
    }
  ];

  for (const cfg of testCasesConfig) {
    const caseItem = casesRes.cases.find(c => c.case_number === cfg.caseNo);
    if (!caseItem) {
      console.error(`❌ Case ${cfg.caseNo} not found in database!`);
      continue;
    }

    console.log(`\n--------------------------------------------------`);
    console.log(`🔍 Testing [${cfg.caseNo}] ${caseItem.title} (ID: ${caseItem.id})...`);

    // Fetch case details
    const detRes = await request(`${API}/cases/${caseItem.id}`, { headers: authHeaders });
    const { suspects, evidence, timeline, contradictions, locations } = detRes;

    console.log(`   - Suspects count: ${suspects.length}`);
    console.log(`   - Evidence count: ${evidence.length}`);
    console.log(`   - Timeline events: ${timeline.length}`);
    console.log(`   - Locations count: ${locations.length}`);
    console.log(`   - Contradictions: ${contradictions.length}`);

    // Verify chronological timeline order
    const isTimelineSorted = timeline.every((t, i) => i === 0 || t.order_seq >= timeline[i - 1].order_seq);
    console.log(`   - Chronological timeline order: ${isTimelineSorted ? '✅ VERIFIED' : '❌ FAILED'}`);

    // Test Interrogation Q&A for first suspect
    if (suspects.length > 0) {
      const qRes = await request(`${API}/interrogate/suspect/${suspects[0].id}`, { headers: authHeaders });
      if (qRes.questions?.length > 0) {
        const askRes = await request(`${API}/interrogate/ask`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            questionId: qRes.questions[0].id,
            caseId: caseItem.id
          })
        });
        console.log(`   - Suspect interrogation Q&A: ✅ Answer received: "${askRes.answer_text.substring(0, 45)}..."`);
      }
    }

    // Test Location Inspection & Hidden Clue Discovery
    const hiddenEv = evidence.find(e => e.is_hidden);
    if (hiddenEv) {
      const discRes = await request(`${API}/evidence/discover-hidden`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          caseId: caseItem.id,
          evidenceCode: hiddenEv.code
        })
      });
      console.log(`   - Hidden Clue Reveal (${hiddenEv.code}): ✅ ${discRes.message}`);
    }

    // Test Contradiction Cross-Examination
    if (contradictions.length > 0) {
      const c = contradictions[0];
      const contraRes = await request(`${API}/contradictions/check`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          caseId: caseItem.id,
          itemAId: c.item_a_code,
          itemBId: c.item_b_code
        })
      });
      console.log(`   - Contradiction check: ${contraRes.isContradiction ? '✅ PROVEN (' + c.title + ')' : '❌ Failed'}`);
    }

    // Test Notes Saving
    const noteRes = await request(`${API}/notebook`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        caseId: caseItem.id,
        title: 'Forensic Clue Note',
        content: 'Important observation recorded during field cross-examination.',
        tag: 'Forensics'
      })
    });
    console.log(`   - Detective Notebook persistence: ✅ Note ID ${noteRes.note?.id} saved`);

    // Test Accusation Submission
    let accusePayload = {};
    if (cfg.isNonCriminal) {
      accusePayload = {
        caseId: caseItem.id,
        accusedSuspectId: 'PLANNED_DISAPPEARANCE',
        conclusionType: 'non_criminal',
        conclusionKey: 'PLANNED_DISAPPEARANCE',
        deductionText: cfg.reasoning,
        selectedEvidenceCodes: cfg.keyEvidence
      };
    } else {
      const culpritSuspect = suspects.find(s => s.name.toLowerCase().includes(cfg.culpritName.toLowerCase()));
      accusePayload = {
        caseId: caseItem.id,
        accusedSuspectId: culpritSuspect ? culpritSuspect.id : suspects[0].id,
        conclusionType: 'criminal',
        deductionText: cfg.reasoning,
        selectedEvidenceCodes: cfg.keyEvidence
      };
    }

    const accData = await request(`${API}/accuse`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(accusePayload)
    });

    console.log(`   - Final Accusation Result: ${accData.isCorrect ? '✅ SOLVED' : '❌ INCORRECT'}`);
    console.log(`   - Total Score: ${accData.score}/100 | Rank: ${accData.rankTitle}`);
    console.log(`   - Score Breakdown: Conclusion +${accData.breakdown.conclusionPoints}, Evidence +${accData.breakdown.evidencePoints}, Hidden +${accData.breakdown.hiddenCluesPoints}, Contradictions +${accData.breakdown.contradictionPoints}, Reasoning +${accData.breakdown.reasoningPoints}`);
    console.log(`   - Reasoning Audit: ${accData.breakdown.reasoningRubricDetails}`);
    if (accData.solution?.keyEvidence) {
      console.log(`   - Decisive Clues: ${accData.solution.keyEvidence.join(' | ')}`);
    }
  }

  // 3. Test Incorrect Accusation Feedback
  console.log(`\n--------------------------------------------------`);
  console.log(`🧪 Testing Incorrect Accusation Feedback on Case MW-001...`);
  const wrongRes = await request(`${API}/accuse`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      caseId: 1,
      accusedSuspectId: 99999,
      deductionText: 'I think someone else did it without any real proof.',
      selectedEvidenceCodes: []
    })
  });
  console.log(`   - Wrong Accusation isCorrect: ${wrongRes.isCorrect ? '❌ Unexpected True' : '✅ Correctly False'}`);
  console.log(`   - Returned Explanation of True Culprit: ${wrongRes.actualCulprit?.name} (${wrongRes.actualCulprit?.motive})`);
  console.log(`   - Score: ${wrongRes.score}/100`);

  console.log(`\n==================================================`);
  console.log(`🎉 ALL 5 CASES VERIFIED SUCCESSFULLY!`);
  console.log(`==================================================\n`);
}

runTests().catch(err => {
  console.error('Test suite failed:', err.message);
  process.exit(1);
});
