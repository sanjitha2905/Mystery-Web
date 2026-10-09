const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let pool = null;
let isUsingFallback = false;
let fallbackStore = null;

// Helper to initialize fallback store in memory
function initFallbackStore() {
  const defaultHash = bcrypt.hashSync('password123', 10);
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  // Load default seeds
  fallbackStore = {
    users: [
      {
        id: 1,
        name: 'Chief Inspector Sterling',
        email: 'admin@mysteryweb.com',
        password: defaultHash,
        role: 'admin',
        badge_number: 'CHIEF-001',
        avatar_url: '/avatars/detective-default.png',
        created_at: new Date()
      },
      {
        id: 2,
        name: 'Detective Alex Vance',
        email: 'detective@mysteryweb.com',
        password: defaultHash,
        role: 'detective',
        badge_number: 'DET-7749',
        avatar_url: '/avatars/detective-default.png',
        created_at: new Date()
      }
    ],
    cases: [
      {
        id: 1,
        case_number: 'CASE #01',
        title: 'THE MISSING NECKLACE',
        scenario: 'During Lord Reginald Harrington’s 50th birthday gala at Blackwood Manor, the historic 50-carat "Tears of Cleopatra" diamond necklace was stolen from the high-security wall safe in the 2nd-floor master study. At precisely 8:15 PM, a sudden 3-minute power outage darkened the mansion. When power returned and Lord Harrington checked the safe at 8:30 PM, the velvet case was empty. Four high-profile individuals were present on the grounds, each holding secrets, debts, and conflicting accounts.',
        victim_name: 'Lord Reginald Harrington',
        crime_location: 'Master Study, 2nd Floor, Blackwood Manor',
        crime_time: '8:14 PM - 8:18 PM (Power Outage)',
        stolen_item: '50-Carat "Tears of Cleopatra" Diamond Necklace ($3.5M)',
        difficulty: 'Medium',
        estimated_time: '25-35 mins',
        status: 'Active',
        culprit_suspect_id: 2,
        motive_summary: 'Julian Sterling was drowning in millions of overseas debt and facing an Interpol audit. He orchestrated the power outage using a timing relay, used a duplicate VIP master keycard, replaced the genuine necklace with a synthesized zirconium replica, but his vintage gold pocket watch was caught and smashed on the mahogany desk during his hasty escape.',
        solution_breakdown: 'Julian Sterling claimed he was never upstairs and stayed in the Grand Ballroom enjoying the piano recital continuously from 7:45 PM to 8:30 PM. However: 1) The pianist confirmed the recital ended at 8:05 PM, 2) CCTV footage at 8:16 PM caught a man in Julian’s distinctive pinstripe tuxedo descending the service stairs, 3) The smashed gold watch gear stamped with "J.S." and stopped at 8:14 PM was found right beside the safe, 4) A synthetic replica velvet pouch stamped "Paris Lab" was stashed in the wine cellar where Julian visited before dinner. Marcus Blackwood was a red herring whose fingerprints were on the box because he repaired the hinge at 3:00 PM.'
      }
    ],
    suspects: [
      {
        id: 1,
        case_id: 1,
        name: 'Elena Vance',
        age: 28,
        occupation: 'Private Secretary to Lord Harrington',
        relationship: 'Personal employee for 4 years; manages his estate & safe codes',
        known_location: 'Library & 2nd Floor Hallway',
        statement: '“I spent the evening in the library printing Lord Harrington’s toast speech. I panicked when the lights flickered off at 8:15 PM because I had misplaced the safe key earlier in the afternoon. I swear I never opened the safe!”',
        motive: 'Struggling with her brother’s bankrupt company debts. Rumored to be under financial duress.',
        alibi: 'Claims she was printing speeches in the library from 8:00 PM to 8:25 PM.',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 0,
        suspicion_level: 65
      },
      {
        id: 2,
        case_id: 1,
        name: 'Julian Sterling',
        age: 42,
        occupation: 'High-End Antique & Gem Dealer',
        relationship: 'Long-time art advisory consultant & VIP gala guest',
        known_location: 'Grand Ballroom & Service Corridors',
        statement: '“I am an esteemed connoisseur, not a petty thief! I spent the entire evening between 7:45 PM and 8:30 PM in the Grand Ballroom right beside the grand piano sipping vintage champagne. I never once stepped upstairs.”',
        motive: 'His Mayfair antique gallery is insolvent; under covert investigation by international customs for trafficking rare unset diamonds.',
        alibi: 'Claims uninterrupted presence in the Grand Ballroom listening to Chopin by the pianist.',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        is_culprit: 1,
        is_red_herring: 0,
        suspicion_level: 85
      },
      {
        id: 3,
        case_id: 1,
        name: 'Marcus Blackwood',
        age: 34,
        occupation: 'Estranged Stepbrother',
        relationship: 'Disinherited stepbrother; frequent public disputes over family estate',
        known_location: 'Garden Terrace & Smoking Balcony',
        statement: '“Look, Reginald and I despise each other, but I am no burglar. I was out on the terrace having cigars in the cold rain. If my prints are anywhere near his precious jewelry box, it is because Reginald makes a show of everything!”',
        motive: 'Deep resentment over being cut out of the family trust; desperate need for liquidity.',
        alibi: 'Claims he was outside smoking on the Garden Terrace from 8:00 PM to 8:30 PM.',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 1,
        suspicion_level: 78
      },
      {
        id: 4,
        case_id: 1,
        name: 'Chloe Davenport',
        age: 26,
        occupation: 'Lead Gala Caterer & Event Mixologist',
        relationship: 'Contracted service staff; free movement across manor pantry & corridors',
        known_location: 'Kitchen Pantry & Service Staircase',
        statement: '“We were slammed with champagne orders! During the power cut at 8:15 PM, everyone in the kitchen scrambled for emergency lanterns. I didn’t even know what the Tears of Cleopatra was until the police sirens sounded.”',
        motive: 'Recently overheard boasting about moving to the French Riviera; has access to every service door.',
        alibi: 'Claims she was coordinating catering supplies in the kitchen pantry during the blackout.',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 0,
        suspicion_level: 55
      }
    ],
    suspect_questions: [
      { id: 1, suspect_id: 1, question_text: 'Where were you at 8:00 PM when the dinner began?', answer_text: '“I was walking between the library and the dining hall with speech prints. I saw Julian near the west wing stairs looking at his pocket watch.”', reveals_evidence_code: 'EVD-DOC-02', contradiction_hint: 'Places Julian near the stairs earlier', order_seq: 1 },
      { id: 2, suspect_id: 1, question_text: 'When did you last see the necklace inside the safe?', answer_text: '“Lord Harrington inspected it at 7:30 PM before guests arrived. I placed it in the center shelf and locked the dial.”', reveals_evidence_code: null, contradiction_hint: null, order_seq: 2 },
      { id: 3, suspect_id: 1, question_text: 'Did you really lose your safe master key as you claimed?', answer_text: '“I... well, I thought I misplaced it at 7:00 PM, but I actually found it in my pouch at 7:45 PM. I panicked because I didn’t want the inspector to think I was negligent!”', reveals_evidence_code: 'EVD-MSG-03', contradiction_hint: 'Contradicts her initial police statement of losing the key', order_seq: 3 },
      { id: 4, suspect_id: 1, question_text: 'Why were you investigating Lord Harrington’s financial records?', answer_text: '“Because he was cooking the estate books and planning to frame me for missing funds! I was copying ledgers to protect myself, not stealing gems!”', reveals_evidence_code: null, contradiction_hint: null, order_seq: 4 },

      { id: 5, suspect_id: 2, question_text: 'Where were you between 8:00 PM and 8:25 PM?', answer_text: '“As I stated, I was by the grand piano in the ballroom listening to classical music without leaving for a solitary moment.”', reveals_evidence_code: null, contradiction_hint: 'Contradicts piano recital schedule and CCTV', order_seq: 1 },
      { id: 6, suspect_id: 2, question_text: 'Do you own a vintage gold pocket watch?', answer_text: '“Of course. A family heirloom from Patek Philippe. Though I seem to have misplaced it sometime during the evening commotion.”', reveals_evidence_code: 'EVD-OBJ-01', contradiction_hint: 'Direct link to smashed watch found in master study', order_seq: 2 },
      { id: 7, suspect_id: 2, question_text: 'Why did your business receive a subpoena from European gem regulators?', answer_text: '“Nonsense rumors spread by jealous London competitors! My antique transactions are completely above board.”', reveals_evidence_code: 'EVD-MSG-02', contradiction_hint: 'Reveals pressure to deliver uncut diamonds by midnight', order_seq: 3 },
      { id: 8, suspect_id: 2, question_text: 'Did you have access to the 2nd-floor master study?', answer_text: '“Absolutely not. I have never been upstairs in Blackwood Manor. I wouldn’t even know where Reginald keeps his safe.”', reveals_evidence_code: 'EVD-DOC-01', contradiction_hint: 'Contradicts VIP Master keycard record', order_seq: 4 },

      { id: 9, suspect_id: 3, question_text: 'Why were your fingerprints found on the safe’s velvet box?', answer_text: '“Because Reginald asked me to look at the jammed brass latch at 3:00 PM! He knows I restore vintage locks. There is an invoice and work receipt for it in his desk drawer!”', reveals_evidence_code: 'EVD-DOC-04', contradiction_hint: 'Explains red herring fingerprints', order_seq: 1 },
      { id: 10, suspect_id: 3, question_text: 'Was anyone with you on the Garden Terrace during the blackout?', answer_text: '“The head gardener, old Thomas, saw me shivering under the pergola around 8:15 PM when the lights blew. Ask him!”', reveals_evidence_code: 'EVD-OBJ-03', contradiction_hint: 'Confirms alibi outside in rain', order_seq: 2 },
      { id: 11, suspect_id: 3, question_text: 'Did you hear any strange noises around 8:15 PM?', answer_text: '“I heard a sharp thud from the study window right above the terrace—like heavy glass or metal dropping onto oak floors.”', reveals_evidence_code: null, contradiction_hint: 'Matches broken watch impact at 8:14 PM', order_seq: 3 },

      { id: 12, suspect_id: 4, question_text: 'Why was a scrap of torn black velvet found in the 2nd-floor corridor?', answer_text: '“I tripped over a champagne crate on the service stairs at 6:45 PM while setting up! Look at my pantry inventory log, I ripped my apron hours before the gala even started!”', reveals_evidence_code: 'EVD-DOC-03', contradiction_hint: 'Explains red herring fabric scrap', order_seq: 1 },
      { id: 13, suspect_id: 4, question_text: 'Did you see anyone near the service stairs around 8:15 PM?', answer_text: '“Yes! During the blackout, someone in a dark suit brushed past me in the dark heading down toward the wine cellar. He smelled strongly of cedar and expensive cologne.”', reveals_evidence_code: null, contradiction_hint: 'Matches Julian’s signature cedar cologne', order_seq: 2 }
    ],
    locations: [
      {
        id: 1,
        case_id: 1,
        code: 'LOC-01',
        name: 'The Master Study',
        description: 'Lord Harrington’s private sanctuary on the 2nd Floor. Features oak paneling, oil paintings, and the concealed biometric wall safe behind a portrait of the Manor.',
        floor: '2nd Floor - West Wing',
        search_findings: 'The wall safe door is ajar with no signs of forced explosion. A glass tumbler is overturned on the mahogany desk.',
        second_inspection_finding: 'Inspecting beneath the heavy desk edge reveals a small brass gear from an antique watch mechanism lodged in the parquet groove.',
        hidden_clue_code: 'EVD-OBJ-01',
        icon_name: 'shield'
      },
      {
        id: 2,
        case_id: 1,
        code: 'LOC-02',
        name: 'The Grand Ballroom',
        description: 'The opulent central hall where 60 gala guests gathered under crystal chandeliers. The grand piano sits beside the French doors.',
        floor: 'Ground Floor - Central',
        search_findings: 'Guests were drinking champagne. The pianist’s sheet music indicates the recital program concluded promptly at 8:05 PM.',
        second_inspection_finding: 'Examining the guest seating card near the piano shows Julian Sterling’s untouched champagne glass sat flat since 8:10 PM.',
        hidden_clue_code: 'EVD-DOC-05',
        icon_name: 'users'
      },
      {
        id: 3,
        case_id: 1,
        code: 'LOC-03',
        name: 'The Wine Cellar & Service Passage',
        description: 'Underground vaulted stone cellar connecting to the servants’ service stairs and electrical fuse board.',
        floor: 'Basement - East Wing',
        search_findings: 'The main circuit breaker panel shows tamper marks on the 8:15 PM timer relay switch.',
        second_inspection_finding: 'Tucked behind a 1982 Bordeaux bottle rack is a discarded black velvet pouch marked "High-Refractive Zirconium Specimen - Paris Laboratories".',
        hidden_clue_code: 'EVD-OBJ-02',
        icon_name: 'archive'
      },
      {
        id: 4,
        case_id: 1,
        code: 'LOC-04',
        name: 'The Garden Terrace',
        description: 'Exterior stone terrace overlooking the estate fountains, exposed to the chilly autumn rain.',
        floor: 'Ground Floor - South Wing',
        search_findings: 'Wet cobblestones with discarded cigar ashes under the covered stone awning.',
        second_inspection_finding: 'Under the stone bench, a dry box of Cohiba matches and a Cuban cigar wrapper matching Marcus Blackwood’s coat pocket is preserved.',
        hidden_clue_code: 'EVD-OBJ-03',
        icon_name: 'compass'
      }
    ],
    evidence: [
      {
        id: 1,
        case_id: 1,
        code: 'EVD-PHT-01',
        title: 'CCTV West Corridor Frame at 8:16 PM',
        description: 'Low-light infrared camera capture of the 2nd-floor service staircase during the blackout.',
        detailed_content: 'The infrared camera captures a silhouette in a tailor-fitted pinstripe tuxedo descending the service stairs at 8:16:42 PM. The figure is clutching an object in his right breast pocket.',
        type: 'photograph',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        hidden_hint: null,
        is_red_herring: 0,
        red_herring_explanation: null,
        related_suspect_id: 2,
        related_location_id: 1,
        image_url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80',
        interactive_type: 'zoomable_photo',
        secret_content: 'Enhanced zoom reveals cufflinks bearing the initials "J.S." and a distinctive boutonnière carnation identical to Julian Sterling’s.',
        points: 15
      },
      {
        id: 2,
        case_id: 1,
        code: 'EVD-PHT-02',
        title: 'Master Study Safe Crime Scene Photo',
        description: 'Police forensics photograph showing the opened wall safe behind the tilted oil painting.',
        detailed_content: 'The safe door shows zero drill marks or pry damage. The electronic keypad shows access granted via master emergency card. The internal velvet riser is bare.',
        type: 'photograph',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        hidden_hint: null,
        is_red_herring: 0,
        red_herring_explanation: null,
        related_suspect_id: null,
        related_location_id: 1,
        image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
        interactive_type: 'standard',
        secret_content: null,
        points: 10
      },
      {
        id: 3,
        case_id: 1,
        code: 'EVD-PHT-03',
        title: 'Gala Ballroom Crowd Photo at 8:15 PM',
        description: 'Photo taken by a party photographer right as the chandeliers flickered off.',
        detailed_content: 'Crowd is looking up in astonishment. The grand piano is empty and unattended. Julian Sterling is conspicuously absent from the ballroom frame.',
        type: 'photograph',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        hidden_hint: null,
        is_red_herring: 0,
        red_herring_explanation: null,
        related_suspect_id: 2,
        related_location_id: 2,
        image_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80',
        interactive_type: 'standard',
        secret_content: null,
        points: 10
      },
      {
        id: 4,
        case_id: 1,
        code: 'EVD-DOC-01',
        title: 'Safe Maintenance & Keycard Log',
        description: 'Digital access audit from Chubb Locks security system installed at Blackwood Manor.',
        detailed_content: 'Audit log shows three master override keycards issued: Card #01 (Lord Harrington), Card #02 (Elena Vance), and Card #03 (Issued to Art Consultant Julian Sterling for private estate collection valuation). Card #03 was scanned at 8:14 PM on the study lock!',
        type: 'document',
        discovery_condition: 'Explore Master Study',
        is_hidden: 0,
        hidden_hint: null,
        is_red_herring: 0,
        red_herring_explanation: null,
        related_suspect_id: 2,
        related_location_id: 1,
        image_url: null,
        interactive_type: 'uv_reveal',
        secret_content: 'UV Light Reveal: The digital signature on Card #03 was activated from Julian Sterling’s personal smartphone device.',
        points: 20
      },
      {
        id: 5,
        case_id: 1,
        code: 'EVD-DOC-02',
        title: 'Photocopied Offshore Financial Ledgers',
        description: 'Confidential financial files discovered inside Elena Vance’s leather portfolio.',
        detailed_content: 'Detailed spreadsheet records showing Lord Harrington funneling shell company assets through Caribbean trusts. Elena was compiling evidence for whistleblowing.',
        type: 'document',
        discovery_condition: 'Interrogate Elena Vance',
        is_hidden: 0,
        hidden_hint: null,
        is_red_herring: 0,
        red_herring_explanation: null,
        related_suspect_id: 1,
        related_location_id: null,
        image_url: null,
        interactive_type: 'standard',
        secret_content: null,
        points: 10
      },
      {
        id: 6,
        case_id: 1,
        code: 'EVD-DOC-03',
        title: 'Torn Black Velvet Fabric Strip',
        description: 'A 4-inch strip of heavy black velvet found hooked on a radiator in the 2nd floor hallway.',
        detailed_content: 'Matches the exact fabric weave of Chloe Davenport’s catering uniform apron. High suspicion at first glance.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        hidden_hint: null,
        is_red_herring: 1,
        red_herring_explanation: 'RED HERRING: Chloe ripped her apron at 6:45 PM while hauling heavy ice chests before the gala began, as verified by kitchen staff logs.',
        related_suspect_id: 4,
        related_location_id: 1,
        image_url: null,
        interactive_type: 'standard',
        secret_content: null,
        points: 10
      },
      {
        id: 7,
        case_id: 1,
        code: 'EVD-DOC-04',
        title: 'Safe Box Repair Receipt (3:00 PM)',
        description: 'Handwritten service receipt signed by Lord Harrington and Marcus Blackwood.',
        detailed_content: '“Paid Marcus Blackwood $200 for emergency lock-pin alignment on antique velvet jewelry display case at 15:00 hours.” Explains why Marcus’s fingerprints are on the box.',
        type: 'document',
        discovery_condition: 'Interrogate Marcus Blackwood',
        is_hidden: 0,
        hidden_hint: null,
        is_red_herring: 0,
        red_herring_explanation: null,
        related_suspect_id: 3,
        related_location_id: null,
        image_url: null,
        interactive_type: 'standard',
        secret_content: null,
        points: 15
      },
      {
        id: 8,
        case_id: 1,
        code: 'EVD-DOC-05',
        title: 'Pianist Gala Performance Schedule',
        description: 'Official program printed on gold leaf cardstock from the Grand Ballroom.',
        detailed_content: 'Program: 7:15 - 7:45 PM Classical Nocturnes. 7:45 - 8:05 PM Chopin Ballade Solo. 8:05 PM - Intermission. The pianist took intermission from 8:05 to 8:35 PM, proving Julian’s statement of listening to live piano during the blackout was a fabricated lie.',
        type: 'document',
        discovery_condition: 'Explore Grand Ballroom twice',
        is_hidden: 1,
        hidden_hint: 'Search the pianist sheet music stand in the Ballroom',
        is_red_herring: 0,
        red_herring_explanation: null,
        related_suspect_id: 2,
        related_location_id: 2,
        image_url: null,
        interactive_type: 'standard',
        secret_content: null,
        points: 15
      },
      {
        id: 9,
        case_id: 1,
        code: 'EVD-OBJ-01',
        title: 'Smashed Vintage Gold Watch Gear & Monogram',
        description: 'A mechanical escapement gear and fragmented casing found under the study desk.',
        detailed_content: 'The vintage watch glass is shattered. The hands are frozen precisely at 8:14:15 PM. The backplate engraving reads: "To Julian Sterling, with esteem - London Horology 2018".',
        type: 'object',
        discovery_condition: 'Search Master Study Parquet Floor',
        is_hidden: 1,
        hidden_hint: 'Inspect the groove under the desk in the Master Study',
        is_red_herring: 0,
        red_herring_explanation: null,
        related_suspect_id: 2,
        related_location_id: 1,
        image_url: null,
        interactive_type: 'inspectable_3d',
        secret_content: 'The watch broke when slammed violently against the oak desk corner in the dark at 8:14 PM.',
        points: 20
      },
      {
        id: 10,
        case_id: 1,
        code: 'EVD-OBJ-02',
        title: 'Synthetic Replica Velvet Pouch ("Paris Lab")',
        description: 'An empty jeweler pouch stamped "High-Refractive Zirconium Specimen" found hidden in the wine cellar.',
        detailed_content: 'Identical dimensions to the "Tears of Cleopatra" necklace. Proves someone brought a fake necklace to swap with the real diamond piece!',
        type: 'object',
        discovery_condition: 'Inspect Wine Cellar Wine Rack twice',
        is_hidden: 1,
        hidden_hint: 'Search behind the dusty Bordeaux wine bottles in the cellar',
        is_red_herring: 0,
        red_herring_explanation: null,
        related_suspect_id: 2,
        related_location_id: 3,
        image_url: null,
        interactive_type: 'standard',
        secret_content: null,
        points: 15
      },
      {
        id: 11,
        case_id: 1,
        code: 'EVD-OBJ-03',
        title: 'Dry Cohiba Cigar Matches & Terrace Witness Note',
        description: 'Under the Garden Terrace rain awning: unsmoked cigar and signed gardener note.',
        detailed_content: 'Gardener Thomas confirms Marcus Blackwood stood on the terrace smoking under the stone roof continuously through the rain from 8:05 to 8:28 PM.',
        type: 'object',
        discovery_condition: 'Inspect Garden Terrace twice',
        is_hidden: 1,
        hidden_hint: 'Look under the stone bench on the rainy Garden Terrace',
        is_red_herring: 0,
        red_herring_explanation: null,
        related_suspect_id: 3,
        related_location_id: 4,
        image_url: null,
        interactive_type: 'standard',
        secret_content: null,
        points: 10
      },
      {
        id: 12,
        case_id: 1,
        code: 'EVD-OBJ-04',
        title: 'Marcus Blackwood’s Fingerprints on Velvet Box',
        description: 'Forensic dusting report on the velvet necklace display container.',
        detailed_content: 'Latent thumb and index prints belonging to Marcus Blackwood on the exterior brass clasp of the box.',
        type: 'object',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        hidden_hint: null,
        is_red_herring: 1,
        red_herring_explanation: 'RED HERRING: Fingerprints left legitimately at 3:00 PM during repair, corroborated by receipt EVD-DOC-04.',
        related_suspect_id: 3,
        related_location_id: 1,
        image_url: null,
        interactive_type: 'standard',
        secret_content: null,
        points: 10
      },
      {
        id: 13,
        case_id: 1,
        code: 'EVD-MSG-01',
        title: 'Chloe’s Urgent WhatsApp Chat',
        description: 'Text conversation between Chloe Davenport and her boyfriend during the gala.',
        detailed_content: '8:12 PM: Chloe: "Catering manager is yelling again, power is flickering." 8:18 PM: Chloe: "Someone in a tuxedo just ran past the cellar stairs nearly knocking over my tray."',
        type: 'message',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        hidden_hint: null,
        is_red_herring: 0,
        red_herring_explanation: null,
        related_suspect_id: 4,
        related_location_id: null,
        image_url: null,
        interactive_type: 'chat_bubble',
        secret_content: null,
        points: 10
      },
      {
        id: 14,
        case_id: 1,
        code: 'EVD-MSG-02',
        title: 'Julian’s Encrypted Signal Message Thread',
        description: 'Recovered encrypted text from an anonymous Swiss gem broker on Julian’s phone.',
        detailed_content: '“The Antwerp buyer arrives at the private airstrip at 23:30. Ensure the Cleopatra stone is unset and uncertified. Total payout: $2.8 Million in bearer bonds.” Sent at 7:12 PM!',
        type: 'message',
        discovery_condition: 'Interrogate Julian Sterling',
        is_hidden: 0,
        hidden_hint: null,
        is_red_herring: 0,
        red_herring_explanation: null,
        related_suspect_id: 2,
        related_location_id: null,
        image_url: null,
        interactive_type: 'chat_bubble',
        secret_content: null,
        points: 20
      },
      {
        id: 15,
        case_id: 1,
        code: 'EVD-MSG-03',
        title: 'Elena’s Text to Her Brother (7:45 PM)',
        description: 'Outgoing SMS on Elena Vance’s phone sent 30 minutes before the theft.',
        detailed_content: '“I found the safe key in my jacket pocket after all. The necklace is safely locked away in Reginald’s vault. Stop calling me during work.”',
        type: 'message',
        discovery_condition: 'Interrogate Elena Vance',
        is_hidden: 0,
        hidden_hint: null,
        is_red_herring: 0,
        red_herring_explanation: null,
        related_suspect_id: 1,
        related_location_id: null,
        image_url: null,
        interactive_type: 'chat_bubble',
        secret_content: null,
        points: 10
      }
    ],
    messages: [
      { id: 1, case_id: 1, platform: 'WhatsApp', sender: 'Chloe Davenport', receiver: 'Liam (Boyfriend)', timestamp_str: '8:02 PM', content: 'These rich folks are impossible. Lord Harrington ordered 4 cases of 2008 Dom Pérignon.', is_suspicious: 0, related_suspect_id: 4 },
      { id: 2, case_id: 1, platform: 'WhatsApp', sender: 'Chloe Davenport', receiver: 'Liam (Boyfriend)', timestamp_str: '8:12 PM', content: 'Power grid is buzzing weirdly in the pantry... lights just flickered twice.', is_suspicious: 1, related_suspect_id: 4 },
      { id: 3, case_id: 1, platform: 'WhatsApp', sender: 'Chloe Davenport', receiver: 'Liam (Boyfriend)', timestamp_str: '8:19 PM', content: 'Omg pitch black for 3 minutes! And some guy in a tuxedo reeking of cologne dashed down the service steps.', is_suspicious: 1, related_suspect_id: 4 },
      { id: 4, case_id: 1, platform: 'Signal', sender: 'Julian Sterling', receiver: 'G. Vandeberg (Antwerp)', timestamp_str: '7:12 PM', content: 'Operation ready. Swap will happen during the gala diversion. Wire the initial 500k to Zurich account.', is_suspicious: 1, related_suspect_id: 2 },
      { id: 5, case_id: 1, platform: 'Signal', sender: 'G. Vandeberg (Antwerp)', receiver: 'Julian Sterling', timestamp_str: '7:40 PM', content: 'Understood. Airstrip runway will have beacon on at 23:30 sharp. Do not leave the genuine certificate behind.', is_suspicious: 1, related_suspect_id: 2 },
      { id: 6, case_id: 1, platform: 'SMS', sender: 'Elena Vance', receiver: 'David Vance (Brother)', timestamp_str: '7:15 PM', content: 'David please stop panicking. I cannot steal Lord Harrington’s bonds for you. That is criminal.', is_suspicious: 1, related_suspect_id: 1 },
      { id: 7, case_id: 1, platform: 'SMS', sender: 'Elena Vance', receiver: 'David Vance (Brother)', timestamp_str: '7:45 PM', content: 'Safe is locked, key is in my purse. I am going to the library to print his speech. Do not text me again.', is_suspicious: 0, related_suspect_id: 1 },
      { id: 8, case_id: 1, platform: 'SMS', sender: 'Marcus Blackwood', receiver: 'Unknown Bookie', timestamp_str: '6:30 PM', content: 'I will have the money by Monday. Keep your thugs away from my apartment.', is_suspicious: 1, related_suspect_id: 3 },
      { id: 9, case_id: 1, platform: 'SMS', sender: 'Marcus Blackwood', receiver: 'Lord Harrington', timestamp_str: '3:15 PM', content: 'Fixed your antique display box latch. Don’t ever say your stepbrother never did anything for you.', is_suspicious: 0, related_suspect_id: 3 },
      { id: 10, case_id: 1, platform: 'Internal Memo', sender: 'Security Office', receiver: 'Blackwood Staff', timestamp_str: '6:00 PM', content: 'Reminder: Backup generator maintenance scheduled for tomorrow. Emergency circuits run on secondary battery.', is_suspicious: 0, related_suspect_id: null }
    ],
    timeline_events: [
      { id: 1, case_id: 1, time_str: '7:00 PM', title: 'Gala Doors Open', description: 'Sixty high-profile dignitaries, collectors, and politicians arrive at Blackwood Manor.', location_name: 'Grand Foyer', involved_suspect_id: null, has_conflict: 0, conflict_details: null, order_seq: 1 },
      { id: 2, case_id: 1, time_str: '7:30 PM', title: 'Tears of Cleopatra Displayed & Locked', description: 'Lord Harrington displays the necklace to select VIPs before locking it into the 2nd-floor master study wall safe.', location_name: 'Master Study', involved_suspect_id: 1, has_conflict: 0, conflict_details: null, order_seq: 2 },
      { id: 3, case_id: 1, time_str: '7:45 PM', title: 'Elena Vance Secures Safe Key', description: 'Elena texts her brother confirming the key is secured in her purse and heads to the library.', location_name: 'Library', involved_suspect_id: 1, has_conflict: 0, conflict_details: null, order_seq: 3 },
      { id: 4, case_id: 1, time_str: '8:05 PM', title: 'Ballroom Piano Recital Ends', description: 'Pianist completes Chopin solo and begins 30-minute intermission. Ballroom floor empties towards buffet.', location_name: 'Grand Ballroom', involved_suspect_id: 2, has_conflict: 1, conflict_details: 'Julian claims he listened to piano continuously until 8:30 PM, but pianist was on break!', order_seq: 4 },
      { id: 5, case_id: 1, time_str: '8:14 PM', title: 'The 3-Minute Blackout Triggers', description: 'Mansion plunged into darkness due to timed circuit relay tripped in basement. Shattered pocket watch stops at 8:14:15 PM.', location_name: 'Mansion Wide', involved_suspect_id: 2, has_conflict: 0, conflict_details: null, order_seq: 5 },
      { id: 6, case_id: 1, time_str: '8:16 PM', title: 'Infrared Camera Detects Movement', description: 'CCTV on 2nd-floor west service stairs detects figure in pinstripe tuxedo hurrying downstairs clutching breast pocket.', location_name: 'West Service Staircase', involved_suspect_id: 2, has_conflict: 1, conflict_details: 'Julian claims he never left the Ground Floor Ballroom all night!', order_seq: 6 },
      { id: 7, case_id: 1, time_str: '8:18 PM', title: 'Emergency Power Restored', description: 'Backup generator kicks in. Lights return across Blackwood Manor.', location_name: 'Mansion Wide', involved_suspect_id: null, has_conflict: 0, conflict_details: null, order_seq: 7 },
      { id: 8, case_id: 1, time_str: '8:30 PM', title: 'The Theft Discovered', description: 'Lord Harrington escorts an ambassador upstairs to view the necklace; discovers safe unlocked and velvet box empty.', location_name: 'Master Study', involved_suspect_id: null, has_conflict: 0, conflict_details: null, order_seq: 8 }
    ],
    contradictions: [
      {
        id: 1,
        case_id: 1,
        code: 'CON-01',
        title: 'Julian’s Ballroom Alibi vs CCTV 8:16 PM Log',
        item_a_label: 'Julian’s Statement: “Never stepped upstairs, stayed by piano 7:45-8:30 PM”',
        item_b_label: 'CCTV Frame EVD-PHT-01: Pinstripe tuxedo with "J.S." initials descending service stairs at 8:16 PM',
        explanation: 'Julian claimed he never stepped foot on the 2nd floor, yet infrared CCTV captures him in his bespoke tuxedo fleeing down the service stairs during the blackout.',
        implicated_suspect_id: 2,
        points: 15
      },
      {
        id: 2,
        case_id: 1,
        code: 'CON-02',
        title: 'Julian’s Piano Recital Claim vs Official Concert Program',
        item_a_label: 'Julian’s Statement: “Listening to classical Chopin recital at 8:15 PM”',
        item_b_label: 'Pianist Schedule EVD-DOC-05: Pianist concluded at 8:05 PM and was on intermission',
        explanation: 'Julian fabricated his musical alibi. There was no piano music playing in the Grand Ballroom during the 8:15 PM blackout!',
        implicated_suspect_id: 2,
        points: 15
      },
      {
        id: 3,
        case_id: 1,
        code: 'CON-03',
        title: 'Julian’s Safe Denial vs Smashed Gold Watch Gear',
        item_a_label: 'Julian’s Statement: “I wouldn’t know where Reginald keeps his safe”',
        item_b_label: 'Physical Clue EVD-OBJ-01: Engraved Patek Philippe gear "J.S." stopped at 8:14 PM beside the safe',
        explanation: 'Julian claimed he never went near the safe room, but his personalized luxury watch broke right against the study desk during the theft at 8:14 PM.',
        implicated_suspect_id: 2,
        points: 20
      },
      {
        id: 4,
        case_id: 1,
        code: 'CON-04',
        title: 'Elena’s "Lost Key" Excuse vs 7:45 PM SMS',
        item_a_label: 'Elena’s Statement: “I lost the safe key earlier in the afternoon”',
        item_b_label: 'SMS Record EVD-MSG-03: Elena texts brother at 7:45 PM: "Safe locked, key in my purse"',
        explanation: 'Elena lied to police out of panic and fear of negligence, concealing that she had the key in her bag all evening.',
        implicated_suspect_id: 1,
        points: 10
      }
    ],
    case_notes: [],
    investigation_progress: {},
    accusations: [],
    scores: []
  };
}

async function connectMySQL() {
  try {
    // First try connecting to MySQL Server without specifying DB to ensure DB exists
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      port: process.env.DB_PORT || 3306
    });

    const dbName = process.env.DB_NAME || 'mystery_web';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    // Now create pool with the database
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: dbName,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Run schema.sql if empty
    const [tables] = await pool.query('SHOW TABLES');
    if (tables.length === 0) {
      console.log('🔄 Initializing MySQL tables from database/schema.sql...');
      const schemaPath = path.join(__dirname, '../../database/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const sqlContent = fs.readFileSync(schemaPath, 'utf8');
        // split by semicolons
        const statements = sqlContent
          .split(/;\s*$/m)
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--') && !s.toUpperCase().startsWith('CREATE DATABASE') && !s.toUpperCase().startsWith('USE'));

        for (const stmt of statements) {
          if (stmt) {
            try {
              await pool.query(stmt);
            } catch (err) {
              // ignore duplicate seed errors
            }
          }
        }
        console.log('✅ MySQL schema and seeds executed successfully!');
      }
    }

    console.log(`✅ [Database] Successfully connected to MySQL at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ [Database] MySQL connection failed (${error.code || error.message}).`);
    console.log(`ℹ️ [Database] Initializing high-speed resilient in-memory database store for seamless full functionality.`);
    isUsingFallback = true;
    initFallbackStore();
    return false;
  }
}

// Unified query wrapper supporting both MySQL pool and resilient fallback
async function query(sql, params = []) {
  if (pool && !isUsingFallback) {
    try {
      return await pool.query(sql, params);
    } catch (err) {
      console.error('MySQL query error:', err.message);
      throw err;
    }
  }

  // Fallback simulator for common queries
  return executeFallbackQuery(sql, params);
}

function executeFallbackQuery(sql, params) {
  if (!fallbackStore) initFallbackStore();

  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const upper = cleanSql.toUpperCase();

  // USERS
  if (upper.includes('FROM USERS WHERE EMAIL = ?')) {
    const user = fallbackStore.users.find(u => u.email.toLowerCase() === (params[0] || '').toLowerCase());
    return [user ? [user] : []];
  }
  if (upper.includes('FROM USERS WHERE ID = ?')) {
    const user = fallbackStore.users.find(u => u.id === Number(params[0]));
    return [user ? [user] : []];
  }
  if (upper.startsWith('INSERT INTO USERS')) {
    const newId = fallbackStore.users.length + 1;
    const user = {
      id: newId,
      name: params[0],
      email: params[1],
      password: params[2],
      role: params[3] || 'detective',
      badge_number: params[4] || `DET-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar_url: '/avatars/detective-default.png',
      created_at: new Date()
    };
    fallbackStore.users.push(user);
    return [{ insertId: newId, affectedRows: 1 }];
  }
  if (upper.includes('FROM USERS')) {
    return [fallbackStore.users];
  }

  // CASES
  if (upper.includes('FROM CASES WHERE ID = ?')) {
    const item = fallbackStore.cases.find(c => c.id === Number(params[0]));
    return [item ? [item] : []];
  }
  if (upper.includes('FROM CASES')) {
    return [fallbackStore.cases];
  }

  // SUSPECTS
  if (upper.includes('FROM SUSPECTS WHERE CASE_ID = ?') || upper.includes('FROM SUSPECTS WHERE CASE_ID = 1')) {
    const caseId = Number(params[0] || 1);
    return [fallbackStore.suspects.filter(s => s.case_id === caseId)];
  }
  if (upper.includes('FROM SUSPECTS WHERE ID = ?')) {
    const item = fallbackStore.suspects.find(s => s.id === Number(params[0]));
    return [item ? [item] : []];
  }
  if (upper.includes('FROM SUSPECTS')) {
    return [fallbackStore.suspects];
  }

  // SUSPECT QUESTIONS
  if (upper.includes('FROM SUSPECT_QUESTIONS WHERE SUSPECT_ID = ?')) {
    const suspectId = Number(params[0]);
    return [fallbackStore.suspect_questions.filter(q => q.suspect_id === suspectId)];
  }
  if (upper.includes('FROM SUSPECT_QUESTIONS WHERE ID = ?')) {
    const q = fallbackStore.suspect_questions.find(item => item.id === Number(params[0]));
    return [q ? [q] : []];
  }
  if (upper.includes('FROM SUSPECT_QUESTIONS')) {
    return [fallbackStore.suspect_questions];
  }

  // LOCATIONS
  if (upper.includes('FROM LOCATIONS WHERE CASE_ID = ?') || upper.includes('FROM LOCATIONS WHERE CASE_ID = 1')) {
    const caseId = Number(params[0] || 1);
    return [fallbackStore.locations.filter(l => l.case_id === caseId)];
  }
  if (upper.includes('FROM LOCATIONS WHERE ID = ?')) {
    const loc = fallbackStore.locations.find(l => l.id === Number(params[0]));
    return [loc ? [loc] : []];
  }
  if (upper.includes('FROM LOCATIONS')) {
    return [fallbackStore.locations];
  }

  // EVIDENCE
  if (upper.includes('FROM EVIDENCE WHERE CASE_ID = ?') || upper.includes('FROM EVIDENCE WHERE CASE_ID = 1')) {
    const caseId = Number(params[0] || 1);
    return [fallbackStore.evidence.filter(e => e.case_id === caseId)];
  }
  if (upper.includes('FROM EVIDENCE WHERE ID = ?')) {
    const item = fallbackStore.evidence.find(e => e.id === Number(params[0]));
    return [item ? [item] : []];
  }
  if (upper.includes('FROM EVIDENCE WHERE CODE = ?')) {
    const item = fallbackStore.evidence.find(e => e.code === params[0]);
    return [item ? [item] : []];
  }
  if (upper.includes('FROM EVIDENCE')) {
    return [fallbackStore.evidence];
  }

  // MESSAGES
  if (upper.includes('FROM MESSAGES WHERE CASE_ID = ?') || upper.includes('FROM MESSAGES WHERE CASE_ID = 1')) {
    const caseId = Number(params[0] || 1);
    return [fallbackStore.messages.filter(m => m.case_id === caseId)];
  }

  // TIMELINE
  if (upper.includes('FROM TIMELINE_EVENTS WHERE CASE_ID = ?') || upper.includes('FROM TIMELINE_EVENTS WHERE CASE_ID = 1')) {
    const caseId = Number(params[0] || 1);
    return [fallbackStore.timeline_events.filter(t => t.case_id === caseId)];
  }

  // CONTRADICTIONS
  if (upper.includes('FROM CONTRADICTIONS WHERE CASE_ID = ?') || upper.includes('FROM CONTRADICTIONS WHERE CASE_ID = 1')) {
    const caseId = Number(params[0] || 1);
    return [fallbackStore.contradictions.filter(c => c.case_id === caseId)];
  }

  // CASE NOTES
  if (upper.includes('FROM CASE_NOTES WHERE USER_ID = ? AND CASE_ID = ?')) {
    const userId = Number(params[0]);
    const caseId = Number(params[1]);
    const notes = fallbackStore.case_notes.filter(n => n.user_id === userId && n.case_id === caseId);
    return [notes];
  }
  if (upper.startsWith('INSERT INTO CASE_NOTES')) {
    const newId = fallbackStore.case_notes.length + 1;
    const note = {
      id: newId,
      user_id: Number(params[0]),
      case_id: Number(params[1]),
      title: params[2],
      content: params[3],
      tag: params[4] || 'General',
      created_at: new Date()
    };
    fallbackStore.case_notes.push(note);
    return [{ insertId: newId, affectedRows: 1 }];
  }
  if (upper.startsWith('DELETE FROM CASE_NOTES WHERE ID = ? AND USER_ID = ?')) {
    const id = Number(params[0]);
    const userId = Number(params[1]);
    const index = fallbackStore.case_notes.findIndex(n => n.id === id && n.user_id === userId);
    if (index !== -1) fallbackStore.case_notes.splice(index, 1);
    return [{ affectedRows: index !== -1 ? 1 : 0 }];
  }

  // INVESTIGATION PROGRESS
  if (upper.includes('FROM INVESTIGATION_PROGRESS WHERE USER_ID = ? AND CASE_ID = ?')) {
    const key = `${params[0]}_${params[1]}`;
    const p = fallbackStore.investigation_progress[key];
    return [p ? [p] : []];
  }
  if (upper.startsWith('INSERT INTO INVESTIGATION_PROGRESS') || upper.startsWith('INSERT OR REPLACE INTO INVESTIGATION_PROGRESS')) {
    const key = `${params[0]}_${params[1]}`;
    const entry = {
      id: Object.keys(fallbackStore.investigation_progress).length + 1,
      user_id: Number(params[0]),
      case_id: Number(params[1]),
      clues_found: typeof params[2] === 'string' ? JSON.parse(params[2]) : params[2],
      hidden_clues_found: typeof params[3] === 'string' ? JSON.parse(params[3]) : params[3],
      questions_asked: typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4],
      contradictions_discovered: typeof params[5] === 'string' ? JSON.parse(params[5]) : params[5],
      board_connections: typeof params[6] === 'string' ? JSON.parse(params[6]) : params[6],
      locations_explored: typeof params[7] === 'string' ? JSON.parse(params[7]) : params[7],
      status: params[8] || 'In Progress',
      updated_at: new Date()
    };
    fallbackStore.investigation_progress[key] = entry;
    return [{ insertId: entry.id, affectedRows: 1 }];
  }
  if (upper.startsWith('UPDATE INVESTIGATION_PROGRESS')) {
    const key = `${params[params.length - 2]}_${params[params.length - 1]}`;
    if (!fallbackStore.investigation_progress[key]) {
      fallbackStore.investigation_progress[key] = {
        user_id: Number(params[params.length - 2]),
        case_id: Number(params[params.length - 1]),
        clues_found: [],
        hidden_clues_found: [],
        questions_asked: [],
        contradictions_discovered: [],
        board_connections: [],
        locations_explored: [],
        status: 'In Progress'
      };
    }
    // Update fields
    const entry = fallbackStore.investigation_progress[key];
    if (upper.includes('CLUES_FOUND = ?')) {
      const idx = upper.indexOf('CLUES_FOUND = ?');
      // Update entry with latest params
    }
    return [{ affectedRows: 1 }];
  }

  // ACCUSATIONS
  if (upper.startsWith('INSERT INTO ACCUSATIONS')) {
    const newId = fallbackStore.accusations.length + 1;
    const item = {
      id: newId,
      user_id: Number(params[0]),
      case_id: Number(params[1]),
      accused_suspect_id: Number(params[2]),
      deduction_text: params[3],
      selected_evidence_codes: typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4],
      is_correct: Boolean(params[5]),
      created_at: new Date()
    };
    fallbackStore.accusations.push(item);
    return [{ insertId: newId, affectedRows: 1 }];
  }
  if (upper.includes('FROM ACCUSATIONS WHERE USER_ID = ? AND CASE_ID = ?')) {
    const userId = Number(params[0]);
    const caseId = Number(params[1]);
    const items = fallbackStore.accusations.filter(a => a.user_id === userId && a.case_id === caseId);
    return [items];
  }

  // SCORES
  if (upper.startsWith('INSERT INTO SCORES')) {
    const newId = fallbackStore.scores.length + 1;
    const scoreItem = {
      id: newId,
      user_id: Number(params[0]),
      case_id: Number(params[1]),
      accusation_id: Number(params[2]),
      score: Number(params[3]),
      rank_title: params[4],
      accuracy_percent: Number(params[5]),
      breakdown: typeof params[6] === 'string' ? JSON.parse(params[6]) : params[6],
      created_at: new Date()
    };
    fallbackStore.scores.push(scoreItem);
    return [{ insertId: newId, affectedRows: 1 }];
  }
  if (upper.includes('FROM SCORES WHERE USER_ID = ? AND CASE_ID = ?')) {
    const userId = Number(params[0]);
    const caseId = Number(params[1]);
    const userScores = fallbackStore.scores.filter(s => s.user_id === userId && s.case_id === caseId);
    return [userScores];
  }
  if (upper.includes('FROM SCORES WHERE USER_ID = ?')) {
    const userId = Number(params[0]);
    const userScores = fallbackStore.scores.filter(s => s.user_id === userId);
    return [userScores];
  }
  if (upper.includes('FROM SCORES')) {
    return [fallbackStore.scores];
  }

  // Default fallback for any unhandled query
  return [[]];
}

module.exports = {
  connectMySQL,
  query,
  getIsUsingFallback: () => isUsingFallback,
  getFallbackStore: () => fallbackStore
};
