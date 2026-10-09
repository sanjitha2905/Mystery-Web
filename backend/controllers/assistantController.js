const db = require('../config/db');

exports.askAssistant = async (req, res) => {
  try {
    const { caseId, prompt, currentProgress } = req.body;
    const query = (prompt || '').toLowerCase().trim();

    // Fetch case info
    let caseNumber = 'MW-001';
    try {
      const [caseRows] = await db.query('SELECT case_number FROM cases WHERE id = ?', [caseId]);
      if (caseRows && caseRows.length > 0) {
        caseNumber = caseRows[0].case_number;
      }
    } catch (e) {
      // Default
    }

    let reply = '';
    let category = 'guidance';

    if (caseNumber === 'MW-001') {
      // The Missing Necklace
      if (query.includes('arjun') || query.includes('tea') || query.includes('bag') || query.includes('fiber')) {
        reply = 'Arjun claims he delivered the tea tray and was downstairs before 8:05 PM. Check the automated corridor service logs (E02) at 8:07 PM and run forensic fiber tests on his service satchel (E05).';
        category = 'suspect_hint';
      } else if (query.includes('maya') || query.includes('garden') || query.includes('photo')) {
        reply = 'Maya claims she was taking photographs in the garden. Cross-examine her camera EXIF timestamp (E04) at 8:10 PM against the 8:12 PM empty stand photograph.';
        category = 'alibi_check';
      } else if (query.includes('key') || query.includes('hidden') || query.includes('lock')) {
        reply = 'Inspect the service corridor utility locker. A duplicate skeleton key hook appears to be unaccounted for in the custodian log.';
        category = 'hidden_hint';
      } else {
        reply = 'Compare the exact corridor access timestamps between 8:05 PM and 8:12 PM. Pay close attention to who had physical access to the dressing room and whose belongings carry velvet fibers.';
        category = 'general_hint';
      }
    } else if (caseNumber === 'MW-002') {
      // The Stolen Project File
      if (query.includes('dev') || query.includes('it') || query.includes('usb') || query.includes('admin')) {
        reply = 'Dev claims he only diagnosed network switches in the server room. However, active directory logs (E02) record his credentials accessing the confidential folder at 7:39 PM. Check his terminal for peripheral storage logs (E06)!';
        category = 'suspect_hint';
      } else if (query.includes('printer') || query.includes('spool') || query.includes('print')) {
        reply = 'Check the print queue server at 7:45 PM (E03). A print spool job for the Project Aegis deck was generated right from the IT Admin terminal.';
        category = 'forensic_hint';
      } else if (query.includes('priya') || query.includes('draft') || query.includes('karthik') || query.includes('nina')) {
        reply = 'Priya’s discarded paper draft (E07) is an outdated preliminary outline from two weeks ago. Nina logged out at 6:58 PM, and Karthik’s VPN was sandboxed to testing containers.';
        category = 'red_herring_hint';
      } else {
        reply = 'Trace the digital timeline: who accessed the shared folder at 7:39 PM, plugged in a storage device at 7:41 PM, and spooled the file to print at 7:45 PM?';
        category = 'general_hint';
      }
    } else if (caseNumber === 'MW-003') {
      // The Secret of Room 207
      if (query.includes('ananya') || query.includes('card') || query.includes('keycard') || query.includes('librarian')) {
        reply = 'Ananya claims she never went near Room 207 all evening. Cross-examine this against the electronic lock audit (E02) and secondary buffer memory (E06) recording her staff badge unlocking the solenoid at 9:12 PM.';
        category = 'suspect_hint';
      } else if (query.includes('clock') || query.includes('battery') || query.includes('joseph') || query.includes('time')) {
        reply = 'Careful with the stopped clock reading 9:20 PM! Caretaker Joseph removed the clock battery at 8:40 PM for mechanical servicing, as verified by maintenance log E03.';
        category = 'timeline_hint';
      } else if (query.includes('envelope') || query.includes('wax') || query.includes('trash') || query.includes('waste')) {
        reply = 'Inspect the staff lounge wastebasket to locate the torn examination envelope with the fractured official wax seal (E05).';
        category = 'clue_hint';
      } else {
        reply = 'Do not be deceived by the frozen wall clock. Look at the electronic RFID badge logs for Room 207 and inspect waste containers in the faculty area.';
        category = 'general_hint';
      }
    } else if (caseNumber === 'MW-004') {
      // The Midnight Alibi
      if (query.includes('elias') || query.includes('cufflink') || query.includes('watch') || query.includes('key')) {
        reply = 'Elias claims he stayed in the kitchen signing receipts. Yet, the display key was checked out using his manager PIN (E06), and photo reflection E05 shows someone wearing his distinctive monogrammed silver cufflinks near the case!';
        category = 'suspect_hint';
      } else if (query.includes('marcus') || query.includes('guard') || query.includes('cctv')) {
        reply = 'Night guard Marcus left his post at 12:02 AM as shown on CCTV E02, creating an unmonitored window before the display sensor triggered at 12:06 AM.';
        category = 'opportunity_hint';
      } else if (query.includes('clara') || query.includes('fingerprint') || query.includes('sofia')) {
        reply = 'Clara prepared the velvet display during event setup, explaining why her prints are present. Sofia was on a remote video call.';
        category = 'red_herring_hint';
      } else {
        reply = 'Scrutinize the display checkout logs and examine photographic reflections near the display cabinet around 12:06 AM.';
        category = 'general_hint';
      }
    } else if (caseNumber === 'MW-005') {
      // The Vanishing Student
      if (query.includes('nikhil') || query.includes('absence') || query.includes('planned') || query.includes('email') || query.includes('note')) {
        reply = 'Look at the handwritten note in the bench backpack (E05) requesting "a few days without calls", and retrieve the pre-scheduled email draft (E06) sent to his relative. Everything points to a self-arranged absence.';
        category = 'conclusion_hint';
      } else if (query.includes('asha') || query.includes('argument') || query.includes('rohan')) {
        reply = 'Asha had an intellectual argument about project credit, but her messages show no intent of harm. Rohan gave an inaccurate return time to avoid hostel curfew penalties.';
        category = 'red_herring_hint';
      } else if (query.includes('bus') || query.includes('kiosk') || query.includes('ticket')) {
        reply = 'Kiosk receipt E03 at 8:34 PM confirms a bus ticket purchased heading to Pune, consistent with a voluntary journey.';
        category = 'forensic_hint';
      } else {
        reply = 'Ask whether a crime actually took place. Examine Nikhil’s personal draft messages, the backpack note, and transit records before rushing to suspect his peers.';
        category = 'general_hint';
      }
    }

    return res.json({
      success: true,
      reply,
      category,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error) {
    console.error('Ask assistant error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
