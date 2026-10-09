const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { prepareSchema } = require('./prepareSchema');

const casesData = [
  // ==========================================
  // CASE 01: THE MISSING NECKLACE (MW-001)
  // ==========================================
  {
    case_number: 'MW-001',
    title: 'THE MISSING NECKLACE',
    difficulty: 'Easy',
    crime_location: 'Blackwood Mansion',
    victim_name: 'Lord Reginald Harrington',
    crime_time: '8:07 PM - 8:12 PM',
    stolen_item: '50-Carat Diamond Necklace',
    estimated_time: '20-25 mins',
    status: 'Active',
    conclusion_type: 'criminal',
    expected_conclusion_key: null,
    scenario: 'A diamond necklace disappears during a family celebration at Blackwood Mansion. Four people had access to the dressing-room area. The player must compare their alibis, inspect evidence, and identify the person responsible.',
    motive_summary: 'Arjun faced aggressive creditors and overdue loan deadlines. Taking advantage of his access as family assistant while delivering tea, he stole the diamond necklace from the dressing room vanity.',
    solution_breakdown: 'Arjun claimed he delivered the evening tea and left immediately before 8:05 PM. However, the automated corridor service log (E02) firmly placed him inside the private corridor at 8:07 PM. Forensic analysis of his service bag revealed matching midnight-blue velvet fibers (E05) from the jewelry display lining. A duplicate service-room key (E06) was also missing from the custodian rack. Maya’s garden photograph (E04) verified her alibi at 8:10 PM, while the necklace stand was photographed empty at 8:12 PM (E01).',
    culprit_name: 'Arjun',
    suspects: [
      {
        name: 'Maya',
        age: 24,
        occupation: "Host's Niece & Amateur Photographer",
        relationship: 'Niece of Lord Harrington; visiting for the gala',
        known_location: 'Garden Terrace',
        statement: '“I was out on the garden terrace taking evening courtyard photographs from 8:00 PM onwards. My camera metadata proves I was never inside the east dressing corridor.”',
        alibi: 'Photographing courtyard garden from 8:00 PM to 8:20 PM.',
        motive: 'Frequently argued over family trust fund distribution, but has independent wealth.',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 0,
        suspicion_level: 40,
        questions: [
          {
            question_text: 'Where were you between 8:05 PM and 8:15 PM?',
            answer_text: 'I was standing by the fountain on the garden terrace adjusting my camera ISO. You can inspect my photograph taken at 8:10 PM!',
            reveals_evidence_code: 'EVD-MW1-E04',
            contradiction_hint: 'Her photograph timestamp aligns with the courtyard fountain lighting.'
          },
          {
            question_text: 'Did you see anyone entering the dressing room wing?',
            answer_text: 'I saw Arjun carrying a covered tea tray toward the east wing stairs around 8:03 PM, but he looked in a great rush.',
            reveals_evidence_code: null,
            contradiction_hint: null
          }
        ]
      },
      {
        name: 'Arjun',
        age: 31,
        occupation: 'Family Assistant & Valet',
        relationship: 'Personal aide to Lord Harrington for 3 years',
        known_location: 'Service Corridor & Scullery',
        statement: '“I only carried the tea tray up at 8:00 PM, dropped it off outside the door, and went straight downstairs to the scullery before 8:05 PM. I never touched the jewelry box!”',
        alibi: 'Claims he delivered tea and returned to the basement scullery before 8:05 PM.',
        motive: 'Deeply in debt to private moneylenders with threats of legal foreclosure.',
        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        is_culprit: 1,
        is_red_herring: 0,
        suspicion_level: 80,
        questions: [
          {
            question_text: 'Why does the corridor log show you entering at 8:07 PM?',
            answer_text: 'Uh... I must have forgotten a napkin and dashed back up for just a split second! But I didn’t enter the vanity room!',
            reveals_evidence_code: 'EVD-MW1-E02',
            contradiction_hint: 'Conflicts directly with his initial claim of being downstairs by 8:05 PM.'
          },
          {
            question_text: 'What was inside your leather service satchel?',
            answer_text: 'Just tea linens and polishing cloths. Feel free to inspect it; there is no diamond necklace inside!',
            reveals_evidence_code: 'EVD-MW1-E05',
            contradiction_hint: 'Inspect the interior velvet fibers of his bag.'
          }
        ]
      },
      {
        name: 'Leena',
        age: 38,
        occupation: 'Bespoke Jewelry Designer',
        relationship: 'Family jeweler and appraisal consultant',
        known_location: 'Reception Hall & Parlour',
        statement: '“Lord Harrington had me inspect the necklace clasp before dinner at 7:30 PM. I returned it to the velvet stand and remained in the parlour with dinner guests afterwards.”',
        alibi: 'In the parlour with guests and caterers from 7:55 PM onwards.',
        motive: 'Professional fascination with the 50-carat cut, but reputation is paramount.',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 0,
        suspicion_level: 50,
        questions: [
          {
            question_text: 'Did you notice anything unusual about the necklace stand earlier?',
            answer_text: 'The velvet lining of the box was custom blue silk-velvet. The clasp was slightly loose, which I mentioned to Lord Harrington.',
            reveals_evidence_code: null,
            contradiction_hint: null
          },
          {
            question_text: 'Did you return to the dressing room after 7:45 PM?',
            answer_text: 'No, I was conversing with the guests in the parlour. Several people can vouch for my presence.',
            reveals_evidence_code: null,
            contradiction_hint: null
          }
        ]
      },
      {
        name: 'Vikram',
        age: 45,
        occupation: 'Chief Security Officer',
        relationship: 'Head of estate security on night duty',
        known_location: 'East Wing Checkpoint',
        statement: '“I guarded the corridor access checkpoint. Nobody entered or left the master wing after 8:00 PM without authorization.”',
        alibi: 'At the east wing security post from 7:50 PM onwards.',
        motive: 'Recently reprimanded for incomplete electronic logs.',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 1,
        suspicion_level: 60,
        questions: [
          {
            question_text: 'Are you certain nobody entered after 8:00 PM?',
            answer_text: 'Well, I stepped to the washroom for two minutes around 8:06 PM, but the hall was empty before and after!',
            reveals_evidence_code: 'EVD-MW1-E03',
            contradiction_hint: 'Directly contradicts his assertion of continuous monitoring.'
          },
          {
            question_text: 'Where are the duplicate keys to the service entrance kept?',
            answer_text: 'In the utility key locker near the stairs. Only authorized staff know the lock code.',
            reveals_evidence_code: 'EVD-MW1-E06',
            contradiction_hint: 'Check if all duplicate keys are accounted for.'
          }
        ]
      }
    ],
    evidence: [
      {
        code: 'EVD-MW1-E01',
        title: 'Empty Necklace Bust Stand Photograph',
        description: 'Photograph taken at 8:12 PM showing the dressing room jewelry stand completely empty.',
        detailed_content: 'Timestamped digital capture from the room camera feed at 8:12:15 PM showing the mahogany table and the bare blue velvet bust where the diamond necklace was previously mounted.',
        type: 'photograph',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
        points: 10
      },
      {
        code: 'EVD-MW1-E02',
        title: 'Service Corridor Electronic Access Log',
        description: 'Automated badge reader log recording Arjun entering the corridor at 8:07 PM.',
        detailed_content: 'Door Controller #02 log entry: Badge [ID-04 / Arjun - Assistant] granted access to East Dressing Corridor at 8:07:22 PM. Exit logged at 8:09:40 PM.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 15
      },
      {
        code: 'EVD-MW1-E03',
        title: 'Shattered Porcelain Teacup',
        description: 'A broken teacup found concealed behind the hallway curtain near the dressing room.',
        detailed_content: 'A delicate bone china teacup from the Earl Grey evening service, chipped and discarded behind the heavy velvet curtain. Contains tea dregs matching Arjun’s tray.',
        type: 'object',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW1-E04',
        title: 'Maya Garden Courtyard Photograph',
        description: 'Verified photograph with authenticated EXIF data proving Maya’s presence on the terrace at 8:10 PM.',
        detailed_content: 'RAW photograph file metadata: Timestamp 8:10:48 PM, camera serial matching Maya’s Sony Alpha, showing the illuminated courtyard fountain with Maya in the glass reflection.',
        type: 'photograph',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW1-E05',
        title: 'Matching Midnight-Blue Velvet Fibers',
        description: 'Microscopic fabric fibers found inside Arjun’s service bag matching the jewelry case.',
        detailed_content: 'Spectrographic analysis: Three 4mm synthetic velvet threads recovered from the inner seam of Arjun’s leather service bag match the dye lot and weave of the Harrington necklace box.',
        type: 'object',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 15
      },
      {
        code: 'EVD-MW1-E06',
        title: 'Missing Service-Room Skeleton Key',
        description: 'Hidden discovery: A duplicate master skeleton key is missing from the utility cabinet hook.',
        detailed_content: 'Security inspection note: Key Hook #03 (East Wing Rear Service Passage) is empty. The sign-out ledger shows it was never signed out officially, indicating clandestine removal.',
        type: 'object',
        discovery_condition: 'Inspect utility locker in Service Corridor',
        is_hidden: 1,
        hidden_hint: 'Inspect the Service Corridor locker to find what tool was used to bypass the lock.',
        is_red_herring: 0,
        points: 15
      }
    ],
    timeline: [
      { time_str: '7:50 PM', title: 'Necklace Confirmed Present', description: 'Lord Harrington and Leena confirm the diamond necklace on display in the master dressing room.', location_name: 'Dressing Room', order_seq: 1 },
      { time_str: '8:03 PM', title: 'Tea Tray Prepared', description: 'Arjun collects the Earl Grey tea service from the butler’s pantry.', location_name: 'Pantry', order_seq: 2 },
      { time_str: '8:07 PM', title: 'Corridor Entry Logged', description: 'Electronic sensor records Arjun entering the East Dressing Corridor.', location_name: 'Service Corridor', order_seq: 3 },
      { time_str: '8:10 PM', title: 'Maya Garden Photograph', description: 'Maya captures a verified courtyard photograph from the terrace.', location_name: 'Garden Terrace', order_seq: 4 },
      { time_str: '8:12 PM', title: 'Empty Bust Photographed', description: 'Room camera captures the necklace stand empty on the vanity table.', location_name: 'Dressing Room', order_seq: 5 },
      { time_str: '8:25 PM', title: 'Theft Discovered & Reported', description: 'Lord Harrington returns to collect his watch and discovers the necklace missing.', location_name: 'Dressing Room', order_seq: 6 }
    ],
    locations: [
      { code: 'LOC-MW1-01', name: 'Master Dressing Room', floor: '2nd Floor East', description: 'Private vanity suite where the historic necklace was kept on a blue velvet stand.', search_findings: 'The mahogany vanity table is dusted with powder. The velvet bust is vacant.', second_inspection_finding: 'Faint scuff marks near the floorboard suggest someone reached beneath the vanity hastily.' },
      { code: 'LOC-MW1-02', name: 'Service Corridor', floor: '2nd Floor East', description: 'Corridor connecting the service stairs to the private dressing room.', search_findings: 'A utility locker stands in the corner.', second_inspection_finding: 'Behind the locker hook, Key #03 (service skeleton key) is confirmed missing!', hidden_clue_code: 'EVD-MW1-E06' },
      { code: 'LOC-MW1-03', name: 'Garden Terrace', floor: 'Ground Floor', description: 'Open-air stone terrace overlooking the estate fountains.', search_findings: 'Camera tripod footprints in the damp grass correspond with Maya’s photography spot.', second_inspection_finding: 'No signs of anyone climbing the terrace trellis.' },
      { code: 'LOC-MW1-04', name: 'Security Checkpoint', floor: '1st Floor Vestibule', description: 'Guard desk monitoring the east wing corridor doors.', search_findings: 'The digital badge scanner terminal displays the evening access log entries.', second_inspection_finding: 'Vikram’s sign-in sheet shows a gap between 8:05 and 8:09 PM.' }
    ],
    messages: [
      { sender: 'Lord Harrington', receiver: 'Arjun', timestamp_str: '7:55 PM', content: 'Arjun, bring up the Earl Grey to the dressing room. Place it on the side table.', is_suspicious: 0 },
      { sender: 'Maya', receiver: 'Friend', timestamp_str: '8:11 PM', content: 'Just captured the most gorgeous long-exposure shot of the garden fountain! Sending preview now.', is_suspicious: 0 },
      { sender: 'Creditor (SMS)', receiver: 'Arjun', timestamp_str: '7:40 PM', content: 'Final warning Arjun. Tonight is your last chance to pay the 50,000 balance or we visit your family.', is_suspicious: 1 }
    ],
    contradictions: [
      {
        code: 'CON-MW1-01',
        title: 'Arjun’s Departure Time vs Service Access Log',
        item_a_label: 'Arjun: “I delivered tea and left downstairs before 8:05 PM”',
        item_b_label: 'Service Log EVD-MW1-E02: Arjun entered corridor at 8:07 PM',
        explanation: 'Arjun claimed he was already downstairs in the scullery before 8:05 PM, but the automated badge scanner firmly records him entering the corridor at 8:07 PM.',
        item_a_code: 'suspect_arjun',
        item_b_code: 'evd-mw1-e02',
        points: 10
      },
      {
        code: 'CON-MW1-02',
        title: 'Vikram’s Clearance Claim vs Corridor Entry Log',
        item_a_label: 'Vikram: “Nobody entered after 8:00 PM”',
        item_b_label: 'Service Log EVD-MW1-E02: Entry at 8:07 PM',
        explanation: 'Guard Vikram claimed continuous vigilance with zero entries after 8:00 PM, contradicted by the 8:07 PM door scan.',
        item_a_code: 'suspect_vikram',
        item_b_code: 'evd-mw1-e02',
        points: 10
      }
    ]
  },

  // ==========================================
  // CASE 02: THE STOLEN PROJECT FILE (MW-002)
  // ==========================================
  {
    case_number: 'MW-002',
    title: 'THE STOLEN PROJECT FILE',
    difficulty: 'Medium',
    crime_location: 'NexaTech Office',
    victim_name: 'NexaTech Innovations',
    crime_time: '7:39 PM - 7:45 PM',
    stolen_item: 'Confidential Client Proposal (Project Aegis)',
    estimated_time: '25-35 mins',
    status: 'Active',
    conclusion_type: 'criminal',
    expected_conclusion_key: null,
    scenario: 'A confidential presentation disappears before a major client meeting at NexaTech Office. Players must investigate employee statements, access logs, document timestamps, and USB activity.',
    motive_summary: 'Dev was secretly recruited by a rival tech consortium to extract the multi-million dollar Project Aegis presentation. Under the guise of evening network switch maintenance, he accessed the secure shared directory and copied the presentation to a USB drive.',
    solution_breakdown: 'Dev claimed he only performed routine hardware diagnostics on server racks. However, active directory logs (E02) showed his credentials accessed the restricted project folder at 7:39 PM. A hardware connection log (E06) proved an unauthorized USB drive was plugged into his workstation at 7:41 PM, just seconds before the presentation was modified at 7:42 PM (E01) and sent to the printer spool queue at 7:45 PM (E03). Priya’s old draft (E07) was an outdated red herring.',
    culprit_name: 'Dev',
    suspects: [
      {
        name: 'Priya',
        age: 34,
        occupation: 'Project Lead',
        relationship: 'Primary author of the Project Aegis proposal',
        known_location: 'Executive Office & Offsite Dinner',
        statement: '“I finalized my review of the client deck around 6:00 PM, then left the building for a strategy dinner with our venture partner at 6:30 PM.”',
        alibi: 'At client dinner from 6:30 PM to 9:00 PM with business receipts.',
        motive: 'High pressure to deliver, but owns significant equity in the company.',
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 1,
        suspicion_level: 45,
        questions: [
          {
            question_text: 'When did you last open the presentation file?',
            answer_text: 'I closed my session at 6:00 PM sharp. Any edits after 6:00 PM were not made by me!',
            reveals_evidence_code: 'EVD-MW2-E01',
            contradiction_hint: 'Compare her 6:00 PM sign-off with the 7:42 PM file modification.'
          },
          {
            question_text: 'What is the printed draft found in the conference room bin?',
            answer_text: 'That was an early preliminary outline from two weeks ago that I discarded before lunch.',
            reveals_evidence_code: 'EVD-MW2-E07',
            contradiction_hint: 'The document timestamp proves it is an outdated red herring.'
          }
        ]
      },
      {
        name: 'Karthik',
        age: 29,
        occupation: 'Senior Backend Developer',
        relationship: 'Lead developer for Project Aegis microservices',
        known_location: 'Remote Workstation (Home)',
        statement: '“I worked from home all evening. I initialized my remote VPN tunnel at 7:15 PM solely to run test scripts on the container cluster.”',
        alibi: 'Remote session from home IP authenticated at 7:15 PM.',
        motive: 'Dissatisfaction over equity compensation.',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 0,
        suspicion_level: 40,
        questions: [
          {
            question_text: 'Did your remote session access the management shared drive?',
            answer_text: 'Never. My SSH keys only permit access to port 22 on the staging cluster. Look at the VPN gateway logs.',
            reveals_evidence_code: 'EVD-MW2-E04',
            contradiction_hint: 'His VPN records confirm isolated staging sandbox commands.'
          }
        ]
      },
      {
        name: 'Nina',
        age: 22,
        occupation: 'Product Intern',
        relationship: 'Assisting with market research slides',
        known_location: 'Open Workspace & Metro Transit',
        statement: '“I finished formatting my assigned research appendix, uploaded it to the portal at 6:58 PM, shut down my machine, and left for the 7:10 PM train.”',
        alibi: 'Metro transit card swiped at 7:08 PM.',
        motive: 'Applying for full-time sponsorship.',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 0,
        suspicion_level: 30,
        questions: [
          {
            question_text: 'Can you verify the time you left the office floor?',
            answer_text: 'My upload timestamp is 6:58 PM, and I badged out through the lobby turnstile at 7:02 PM.',
            reveals_evidence_code: 'EVD-MW2-E05',
            contradiction_hint: 'Her exit timestamp precedes the 7:39 PM breach.'
          }
        ]
      },
      {
        name: 'Dev',
        age: 33,
        occupation: 'IT Systems Administrator',
        relationship: 'Holds administrative root credentials across office network',
        known_location: 'IT Server Room',
        statement: '“I was in the server room checking network switches and fiber connectivity. I only checked network health and never touched client presentation files!”',
        alibi: 'Claims sole activity was hardware diagnostics.',
        motive: 'Approached by competitor with $100,000 cash offer for corporate strategy files.',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        is_culprit: 1,
        is_red_herring: 0,
        suspicion_level: 85,
        questions: [
          {
            question_text: 'Why did your administrative login open the confidential folder at 7:39 PM?',
            answer_text: 'I... was running an automated permission security audit on all shared root drives! Standard procedure!',
            reveals_evidence_code: 'EVD-MW2-E02',
            contradiction_hint: 'Audits do not involve mounting personal flash drives.'
          },
          {
            question_text: 'Did you connect any external storage media to your workstation?',
            answer_text: 'No! Company policy strictly prohibits thumb drives on admin rigs.',
            reveals_evidence_code: 'EVD-MW2-E06',
            contradiction_hint: 'Directly contradicted by workstation USB hardware log.'
          }
        ]
      }
    ],
    evidence: [
      {
        code: 'EVD-MW2-E01',
        title: 'Project File Timestamp Metadata',
        description: 'File system record showing Project_Aegis.pptx modified at 7:42 PM.',
        detailed_content: 'NTFS Filesystem Audit: /Confidential/Aegis_Client_Deck.pptx - Last Modified: 7:42:19 PM by user [dev.it_admin]. File size changed by +12KB.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW2-E02',
        title: 'Server Directory Access Log',
        description: 'Domain controller log showing Dev’s account opened the shared folder at 7:39 PM.',
        detailed_content: 'Active Directory Event ID 4663: User [dev.it_admin] accessed \\\\FS01\\Confidential\\Executive\\ at 7:39:44 PM. Object read permissions granted.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 15
      },
      {
        code: 'EVD-MW2-E03',
        title: 'Network Printer Queue Log',
        description: 'Presentation slide preview entered the printer spool queue at 7:45 PM.',
        detailed_content: 'Print Server Spooler: Job #441 [Aegis_Executive_Summary.pdf] queued from workstation 192.168.1.45 (IT Admin Desk) at 7:45:12 PM.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW2-E04',
        title: 'Remote VPN Authentication Record',
        description: 'Karthik’s remote session started at 7:15 PM, restricted to staging environment.',
        detailed_content: 'FortiGate VPN Log: User [karthik.dev] established SSL-VPN from IP 104.28.19.4 at 7:15:02 PM. Target route restricted to 10.0.4.0/24 (Staging Sandbox).',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW2-E05',
        title: 'Intern Assignment Upload Record',
        description: 'Nina’s assignment upload completed at 6:58 PM with immediate workstation logoff.',
        detailed_content: 'Portal Log: Nina Patel uploaded Market_Analysis_Appendix.docx at 6:58:31 PM. Session closed at 6:59:05 PM.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW2-E06',
        title: 'Hidden USB Hardware Connection Log',
        description: 'Hidden discovery: Unauthorized SanDisk 64GB USB drive connected to Dev’s workstation at 7:41 PM.',
        detailed_content: 'Windows Event Viewer ID 20001: Device [USBSTOR\\Disk&Ven_SanDisk&Prod_Ultra_USB3.0] plugged into Terminal IT-WS-01 (User: dev.it_admin) at 7:41:03 PM.',
        type: 'document',
        discovery_condition: 'Inspect Dev’s workstation terminal in IT Server Room',
        is_hidden: 1,
        hidden_hint: 'Inspect the IT Server Room workstation to check peripheral device logs.',
        is_red_herring: 0,
        points: 15
      },
      {
        code: 'EVD-MW2-E07',
        title: 'Outdated Preliminary Proposal Draft',
        description: 'An old draft belonging to Priya found in the conference room bin; acts as a red herring.',
        detailed_content: 'Printed draft titled "Project Aegis v0.3 - Deprecated Outline" dated two weeks prior with handwritten notes. Discarded during morning meeting.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 1,
        red_herring_explanation: 'This discarded preliminary draft was printed weeks ago and has no connection to the 7:42 PM digital file exfiltration.',
        points: 5
      }
    ],
    timeline: [
      { time_str: '6:00 PM', title: 'Priya Finalizes Proposal Review', description: 'Priya finishes reviewing the Aegis proposal and signs off for dinner.', location_name: 'Executive Office', order_seq: 1 },
      { time_str: '6:58 PM', title: 'Nina Uploads Assignment', description: 'Intern Nina uploads her research appendix and logs off.', location_name: 'Open Workspace', order_seq: 2 },
      { time_str: '7:15 PM', title: 'Karthik Initiates Remote Work', description: 'Developer Karthik connects through the VPN to sandbox servers.', location_name: 'Remote VPN', order_seq: 3 },
      { time_str: '7:39 PM', title: 'Dev Opens Shared Folder', description: 'Dev’s account accesses the confidential executive directory.', location_name: 'IT Server Room', order_seq: 4 },
      { time_str: '7:41 PM', title: 'USB Device Connected', description: 'A portable flash storage drive is mounted to Dev’s terminal.', location_name: 'IT Server Room', order_seq: 5 },
      { time_str: '7:42 PM', title: 'Presentation Modified', description: 'Project Aegis presentation attributes modified during file export.', location_name: 'IT Server Room', order_seq: 6 },
      { time_str: '7:45 PM', title: 'Print Preview Spooled', description: 'Executive slide summary sent to 2nd-floor printer spool queue.', location_name: 'Print Alcove', order_seq: 7 }
    ],
    locations: [
      { code: 'LOC-MW2-01', name: 'IT Server Room', floor: '1st Floor', description: 'Climate-controlled server racks and network administrator workstation.', search_findings: 'The admin terminal screen is locked. Network switch status LEDs are green.', second_inspection_finding: 'USB Event Viewer log reveals a SanDisk 64GB flash drive was mounted at 7:41 PM!', hidden_clue_code: 'EVD-MW2-E06' },
      { code: 'LOC-MW2-02', name: 'Executive Boardroom', floor: '2nd Floor', description: 'Main conference space with video conferencing displays and shared printing terminals.', search_findings: 'Priya’s outdated draft sits in the recycling bin under the projector.', second_inspection_finding: 'No unauthorized logins logged on the conference console.' },
      { code: 'LOC-MW2-03', name: 'Open Development Floor', floor: '2nd Floor', description: 'Cubicles for engineering and intern staff.', search_findings: 'All developer monitors are off. Nina’s desk is cleared.', second_inspection_finding: 'Karthik’s desk contains only dry-erase architecture diagrams.' },
      { code: 'LOC-MW2-04', name: 'Print & Media Alcove', floor: '2nd Floor Hall', description: 'High-speed color laser printer and document collating area.', search_findings: 'The printer tray contains test diagnostic pages and job logs.', second_inspection_finding: 'Spool memory contains job #441 for the Aegis slide deck at 7:45 PM.' }
    ],
    messages: [
      { sender: 'Priya', receiver: 'Team', timestamp_str: '5:55 PM', content: 'Final proposal is locked in /Confidential/Aegis. Please do not modify slides before tomorrow morning.', is_suspicious: 0 },
      { sender: 'Dev', receiver: 'External (Signal)', timestamp_str: '7:35 PM', content: 'Stand by. Transferring package to external drive now. Have payment ready.', is_suspicious: 1 },
      { sender: 'Nina', receiver: 'Priya', timestamp_str: '6:57 PM', content: 'Submitted the appendix slides Priya! Heading out now.', is_suspicious: 0 }
    ],
    contradictions: [
      {
        code: 'CON-MW2-01',
        title: 'Dev’s Hardware Claim vs Folder Access Log',
        item_a_label: 'Dev: “I only checked network switches and never opened project folders”',
        item_b_label: 'Access Log EVD-MW2-E02: Dev account opened shared folder at 7:39 PM',
        explanation: 'Dev claimed he only ran hardware diagnostics on network cables, but Active Directory logs prove his user account navigated into the confidential folder at 7:39 PM.',
        item_a_code: 'suspect_dev',
        item_b_code: 'evd-mw2-e02',
        points: 10
      },
      {
        code: 'CON-MW2-02',
        title: 'Dev’s External Media Denial vs Workstation USB Log',
        item_a_label: 'Dev: “No external thumb drives were used on my terminal”',
        item_b_label: 'Hardware Log EVD-MW2-E06: USB drive plugged in at 7:41 PM',
        explanation: 'Dev denied using flash media, directly refuted by workstation hardware logs proving a SanDisk USB drive mounted at 7:41 PM.',
        item_a_code: 'suspect_dev',
        item_b_code: 'evd-mw2-e06',
        points: 10
      }
    ]
  },

  // ==========================================
  // CASE 03: THE SECRET OF ROOM 207 (MW-003)
  // ==========================================
  {
    case_number: 'MW-003',
    title: 'THE SECRET OF ROOM 207',
    difficulty: 'Medium',
    crime_location: 'Westbridge College',
    victim_name: 'Academic Examination Board',
    crime_time: '9:00 PM - 9:30 PM',
    stolen_item: 'Sealed Examination Paper (Finals)',
    estimated_time: '25-35 mins',
    status: 'Active',
    conclusion_type: 'criminal',
    expected_conclusion_key: null,
    scenario: 'A sealed examination paper disappears from a locked study room at Westbridge College. A stopped clock creates confusion about the actual time of the incident.',
    motive_summary: 'Ananya was offered a large sum of illicit cash to provide advance exam papers to a private tutoring ring. Using her librarian staff keycard, she unlocked Room 207 at 9:12 PM, ripped open the envelope, and hoped the caretaker’s stopped clock would establish an alibi.',
    solution_breakdown: 'Ananya claimed she never entered Room 207 all evening. However, electronic lock logs (E02 and hidden log E06) prove her staff card opened the room at 9:12 PM. The torn envelope (E05) was discovered in the staff wastebasket. Caretaker Joseph’s screwdriver (E07) was an innocent red herring, and maintenance logs (E03) revealed the stopped clock battery was removed at 8:40 PM before the paper was even sealed.',
    culprit_name: 'Ananya',
    suspects: [
      {
        name: 'Professor Meera',
        age: 52,
        occupation: 'Head of Mathematics Department',
        relationship: 'Faculty author and custodian of final examination papers',
        known_location: 'Room 207 & Dean’s Residence',
        statement: '“I sealed the examination envelope in front of proctors, locked Room 207 at precisely 9:00 PM, and went to the dean’s residence for an academic council dinner.”',
        alibi: 'At the dean’s residence from 9:05 PM to 10:30 PM.',
        motive: 'Strict educator with impeccable institutional reputation.',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 0,
        suspicion_level: 30,
        questions: [
          {
            question_text: 'What time did you lock Room 207?',
            answer_text: 'Exactly 9:00 PM. The examination paper was verified present inside at 8:50 PM on our custody slip.',
            reveals_evidence_code: 'EVD-MW3-E01',
            contradiction_hint: 'Verified custody document confirms presence at 8:50 PM.'
          }
        ]
      },
      {
        name: 'Rahul',
        age: 21,
        occupation: 'Undergraduate Student',
        relationship: 'Enrolled in the advanced mathematics course',
        known_location: 'College Library',
        statement: '“I was studying in the library reading room until 9:30 PM. I checked out textbooks and went directly to my dorm.”',
        alibi: 'In library reading hall until textbook checkout at 9:27 PM.',
        motive: 'Facing academic probation if he fails the upcoming exam.',
        avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 0,
        suspicion_level: 55,
        questions: [
          {
            question_text: 'Can anyone prove you were in the library until 9:30 PM?',
            answer_text: 'Yes! The self-checkout receipt stamped my book checkout at 9:27 PM.',
            reveals_evidence_code: 'EVD-MW3-E04',
            contradiction_hint: 'Automated receipt proves his location at 9:27 PM.'
          }
        ]
      },
      {
        name: 'Ananya',
        age: 36,
        occupation: 'Head College Librarian',
        relationship: 'Holds all-access campus staff card',
        known_location: 'Library Circulation & Staff Area',
        statement: '“My duties are strictly within the library. I never entered Room 207 all evening, and my staff keycard remained in my desk purse!”',
        alibi: 'Claims she remained in the library circulation office continuously.',
        motive: 'Secretly approached with $25,000 to leak the examination paper.',
        avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
        is_culprit: 1,
        is_red_herring: 0,
        suspicion_level: 80,
        questions: [
          {
            question_text: 'Did anyone borrow your staff keycard tonight?',
            answer_text: 'No one! It was on my person or at my desk the entire evening.',
            reveals_evidence_code: 'EVD-MW3-E02',
            contradiction_hint: 'Directly contradicted by Room 207 electronic lock record.'
          },
          {
            question_text: 'Why was a torn official envelope found in the staff wastebasket?',
            answer_text: 'I... frequently discard faculty circulars and campus notices!',
            reveals_evidence_code: 'EVD-MW3-E05',
            contradiction_hint: 'The torn envelope bears the red wax seal of the exam board.'
          }
        ]
      },
      {
        name: 'Joseph',
        age: 58,
        occupation: 'Campus Maintenance Caretaker',
        relationship: 'Responsible for facility repairs and clock maintenance',
        known_location: 'Room 207 Hallway & Workshop',
        statement: '“I had a ticket to fix the wall clock in Room 207. I removed the battery to repair the gear hands and left my screwdriver on the ledge.”',
        alibi: 'On maintenance rounds across East Campus.',
        motive: 'Complained about excessive evening overtime.',
        avatar_url: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 1,
        suspicion_level: 60,
        questions: [
          {
            question_text: 'When did you take the battery out of the wall clock?',
            answer_text: 'Early in the evening, around 8:40 PM before the professor even arrived! I wrote it in the maintenance ledger.',
            reveals_evidence_code: 'EVD-MW3-E03',
            contradiction_hint: 'Proves the clock stopped long before the 9:00 PM locking.'
          },
          {
            question_text: 'Why was your screwdriver found outside Room 207?',
            answer_text: 'I dropped it while tightening the window latch. The door lock has zero pry marks!',
            reveals_evidence_code: 'EVD-MW3-E07',
            contradiction_hint: 'No forced entry occurred; a red herring.'
          }
        ]
      }
    ],
    evidence: [
      {
        code: 'EVD-MW3-E01',
        title: 'Examination Paper Custody Verification Slip',
        description: 'Document confirming exam paper present in Room 207 at 8:50 PM.',
        detailed_content: 'Official Board Slip #992: Sealed packet containing 80 copies of Final Exam Paper confirmed inside Room 207 vault box at 8:50 PM.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW3-E02',
        title: 'Room 207 Electronic Keycard Audit',
        description: 'Electronic sensor log showing Ananya’s staff card opened Room 207 at 9:12 PM.',
        detailed_content: 'Lock Reader 207: Staff Card [LIB-02 / Ananya] authenticated and unlocked door at 9:12:08 PM. Latch returned to locked state at 9:14:02 PM.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 15
      },
      {
        code: 'EVD-MW3-E03',
        title: 'Caretaker Clock Maintenance Ledger',
        description: 'Note proving the wall clock battery was removed at 8:40 PM.',
        detailed_content: 'Maintenance Log #104: Room 207 wall clock movement serviced. AA Battery removed at 8:40 PM. Mechanism awaiting replacement pendulum.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW3-E04',
        title: 'Library Self-Checkout Timestamp Slip',
        description: 'Receipt verifying Rahul checked out textbooks at the library counter at 9:27 PM.',
        detailed_content: 'Library Kiosk #01: Student [Rahul S.] borrowed "Advanced Linear Analysis" at 9:27:33 PM.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW3-E05',
        title: 'Torn Exam Envelope with Broken Wax Seal',
        description: 'Torn kraft envelope found in the staff lounge wastebasket.',
        detailed_content: 'Heavy kraft paper packet with fractured red wax emblem reading "Westbridge Examination Board - Confidential Finals".',
        type: 'object',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 15
      },
      {
        code: 'EVD-MW3-E06',
        title: 'Hidden Secondary Lock Controller Memory',
        description: 'Hidden discovery: Secondary door controller log confirming 9:12 PM entry by Ananya.',
        detailed_content: 'Door EPROM buffer dump: Exact card serial 084-FA-31 (assigned to Ananya) opened Room 207 solenoid for 114 seconds at 9:12:08 PM.',
        type: 'document',
        discovery_condition: 'Inspect electronic door terminal in Room 207',
        is_hidden: 1,
        hidden_hint: 'Inspect the electronic lock terminal in Room 207 to retrieve internal buffer memory.',
        is_red_herring: 0,
        points: 15
      },
      {
        code: 'EVD-MW3-E07',
        title: 'Caretaker’s Screwdriver (Red Herring)',
        description: 'A flathead screwdriver found near the corridor window; acts as a red herring.',
        detailed_content: 'Stanley 6-inch flathead tool with blue grip. Forensic analysis confirms zero scratches or tool marks on the lock plate.',
        type: 'object',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 1,
        red_herring_explanation: 'There was zero forced entry on the lock; the door was opened cleanly using an electronic RFID badge.',
        points: 5
      }
    ],
    timeline: [
      { time_str: '8:40 PM', title: 'Clock Battery Removed', description: 'Caretaker Joseph removes the clock battery for mechanism repairs.', location_name: 'Room 207', order_seq: 1 },
      { time_str: '8:50 PM', title: 'Paper Confirmed Present', description: 'Professor Meera verifies the sealed paper packet inside the room.', location_name: 'Room 207', order_seq: 2 },
      { time_str: '9:00 PM', title: 'Room 207 Locked', description: 'Professor Meera locks the door and departs for the dean’s dinner.', location_name: 'Room 207', order_seq: 3 },
      { time_str: '9:12 PM', title: 'Staff Card Opens Room 207', description: 'Ananya’s staff card opens the room door for nearly two minutes.', location_name: 'Room 207', order_seq: 4 },
      { time_str: '9:20 PM', title: 'Stopped Clock Shows Misleading Time', description: 'The hands of the stopped clock show 9:20 PM, creating false confusion.', location_name: 'Room 207', order_seq: 5 },
      { time_str: '9:27 PM', title: 'Rahul Library Checkout', description: 'Rahul checks out his study textbooks at the library counter.', location_name: 'Library', order_seq: 6 }
    ],
    locations: [
      { code: 'LOC-MW3-01', name: 'Room 207 (Study Room)', floor: '2nd Floor Science Wing', description: 'Secured study room with electronic lock and wall clock.', search_findings: 'The examination folder on the desk is empty. The wall clock is frozen at 9:20 PM.', second_inspection_finding: 'Diagnostic check of the electronic door solenoid confirms Ananya’s card serial at 9:12 PM!', hidden_clue_code: 'EVD-MW3-E06' },
      { code: 'LOC-MW3-02', name: 'College Library', floor: '1st Floor', description: 'Main reading hall and circulation desk managed by Ananya.', search_findings: 'The checkout kiosk records show continuous student borrowings.', second_inspection_finding: 'Ananya’s desk drawer contains an empty keycard lanyard.' },
      { code: 'LOC-MW3-03', name: 'Caretaker Workshop', floor: 'Basement', description: 'Maintenance tools, spare parts, and clock repair manuals.', search_findings: 'The maintenance logbook is open on the workbench.', second_inspection_finding: 'The 8:40 PM clock maintenance entry is signed by Joseph.' },
      { code: 'LOC-MW3-04', name: 'Staff Lounge & Waste Alcove', floor: '2nd Floor', description: 'Faculty break room and recycling disposal bins.', search_findings: 'Coffee cups and daily memos in the bin.', second_inspection_finding: 'At the bottom of the bin lies the torn exam envelope with the broken wax seal!' }
    ],
    messages: [
      { sender: 'Prof. Meera', receiver: 'Dean Office', timestamp_str: '8:55 PM', content: 'Finals packet is verified and locked in Room 207. See you at dinner shortly.', is_suspicious: 0 },
      { sender: 'Unknown (Telegram)', receiver: 'Ananya', timestamp_str: '8:15 PM', content: 'Drop the paper behind the library bike rack by 9:45 PM for full payment.', is_suspicious: 1 },
      { sender: 'Joseph', receiver: 'Security', timestamp_str: '8:42 PM', content: 'Room 207 clock hands need replacement parts tomorrow. Left room secure.', is_suspicious: 0 }
    ],
    contradictions: [
      {
        code: 'CON-MW3-01',
        title: 'Ananya’s Absence Claim vs Electronic Lock Audit',
        item_a_label: 'Ananya: “I never entered Room 207 all evening”',
        item_b_label: 'Lock Audit EVD-MW3-E02: Ananya staff card opened Room 207 at 9:12 PM',
        explanation: 'Ananya claimed she never went near Room 207, directly contradicted by electronic keycard records showing her card opened the door at 9:12 PM.',
        item_a_code: 'suspect_ananya',
        item_b_code: 'evd-mw3-e02',
        points: 10
      },
      {
        code: 'CON-MW3-02',
        title: 'Stopped Clock Misleading Time vs Battery Maintenance Log',
        item_a_label: 'Clock Display: Stopped at 9:20 PM',
        item_b_label: 'Maintenance Slip EVD-MW3-E03: Battery removed at 8:40 PM',
        explanation: 'The clock stopping at 9:20 PM was misleading because the maintenance record proves the battery was removed at 8:40 PM before the room was even locked.',
        item_a_code: 'clock_display',
        item_b_code: 'evd-mw3-e03',
        points: 10
      }
    ]
  },

  // ==========================================
  // CASE 04: THE MIDNIGHT ALIBI (MW-004)
  // ==========================================
  {
    case_number: 'MW-004',
    title: 'THE MIDNIGHT ALIBI',
    difficulty: 'Hard',
    crime_location: 'Ashford Hotel',
    victim_name: 'Ashford Heritage Collection',
    crime_time: '12:06 AM',
    stolen_item: 'Antique Gold Pocket Watch (1880 Patek)',
    estimated_time: '25-35 mins',
    status: 'Active',
    conclusion_type: 'criminal',
    expected_conclusion_key: null,
    scenario: 'An antique pocket watch disappears from a hotel display case during a private event at Ashford Hotel. Players must compare witness statements, access logs, and photographic evidence.',
    motive_summary: 'Elias arranged to sign a kitchen receipt at 12:04 AM as a calculated alibi. Knowing guard Marcus stepped away at 12:02 AM, Elias used his checked-out master display key to open the vitrine at 12:06 AM, unaware that a guest photograph captured his silver cufflinks in the glass reflection.',
    solution_breakdown: 'Elias claimed he remained in the kitchen continuously, pointing to his 12:04 AM signed receipt (E03). However, the display opened at 12:06 AM (E01), just 20 seconds from the kitchen door. The display key had been checked out using his manager PIN (E06), and a photograph reflection (E05) clearly shows his custom silver cufflinks near the case. Clara’s fingerprints (E07) were an innocent red herring from cleaning earlier at 11:45 PM.',
    culprit_name: 'Elias',
    suspects: [
      {
        name: 'Elias',
        age: 41,
        occupation: 'Hotel Event Manager',
        relationship: 'Direct supervisor of private gala events and security keys',
        known_location: 'Service Kitchen & Mezzanine',
        statement: '“I was in the banquet kitchen continuously managing chefs and signing delivery slips. I signed for the midnight pastries at 12:04 AM; I was nowhere near the display vitrine!”',
        alibi: 'Signed kitchen pastry receipt at 12:04 AM.',
        motive: 'Severe gambling debts and covert negotiations with underground watch collectors.',
        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        is_culprit: 1,
        is_red_herring: 0,
        suspicion_level: 85,
        questions: [
          {
            question_text: 'How far is the banquet kitchen from the mezzanine display?',
            answer_text: 'It is up a short flight of service stairs, about twenty seconds away, but I stayed in the kitchen!',
            reveals_evidence_code: 'EVD-MW4-E03',
            contradiction_hint: 'Signing at 12:04 AM leaves ample time to reach the display at 12:06 AM.'
          },
          {
            question_text: 'Who checked out the master vitrine display key tonight?',
            answer_text: 'I keep the key in the locked manager safe. No one checked it out without my knowledge.',
            reveals_evidence_code: 'EVD-MW4-E06',
            contradiction_hint: 'Key safe audit reveals Elias’s manager PIN checked out the key at 11:52 PM.'
          }
        ]
      },
      {
        name: 'Sofia',
        age: 32,
        occupation: 'Private Gala Guest & Investor',
        relationship: 'VIP attendee and antique watch collector',
        known_location: 'Lounge Balcony',
        statement: '“I was on an urgent international video conference from 11:58 PM onwards out on the terrace lounge. My connection was active throughout midnight.”',
        alibi: 'Continuous video conference from 11:58 PM to 12:15 AM.',
        motive: 'Passionate collector who expressed great interest in the antique watch.',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 0,
        suspicion_level: 45,
        questions: [
          {
            question_text: 'Did you step inside during your video conference?',
            answer_text: 'No, I stayed on the balcony couch for better signal. Check my telecom data log.',
            reveals_evidence_code: 'EVD-MW4-E04',
            contradiction_hint: 'Call session active, but telecom mast spans the whole wing.'
          }
        ]
      },
      {
        name: 'Marcus',
        age: 48,
        occupation: 'Night Security Guard',
        relationship: 'Stationed at the lobby mezzanine post',
        known_location: 'Lobby Security Desk',
        statement: '“I had eyes on the lobby display vitrine without interruption. I never abandoned my post during midnight.”',
        alibi: 'Claims continuous monitoring of the lobby display.',
        motive: 'Fear of termination after earlier safety citations.',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 0,
        suspicion_level: 60,
        questions: [
          {
            question_text: 'Did you leave your desk at any moment around midnight?',
            answer_text: 'I... might have stepped to the courtyard door at 12:02 AM for two minutes to check a noise.',
            reveals_evidence_code: 'EVD-MW4-E02',
            contradiction_hint: 'CCTV proves he left his post unattended at 12:02 AM.'
          }
        ]
      },
      {
        name: 'Clara',
        age: 27,
        occupation: 'Auction Assistant',
        relationship: 'Assisted with setting up the antique display',
        known_location: 'Mezzanine & Catalog Room',
        statement: '“I finished polishing the vitrine and arranging the velvet cushion at 11:45 PM. I then went down to the catalog room to file inventory sheets.”',
        alibi: 'In catalog room from 11:50 PM onwards.',
        motive: 'Had direct physical access to the display case.',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 1,
        suspicion_level: 50,
        questions: [
          {
            question_text: 'Why were your fingerprints discovered on the vitrine glass?',
            answer_text: 'I polished the glass with cloth and adjusted the case corners at 11:45 PM before leaving!',
            reveals_evidence_code: 'EVD-MW4-E07',
            contradiction_hint: 'Normal cleaning handling before the 12:06 AM breach.'
          }
        ]
      }
    ],
    evidence: [
      {
        code: 'EVD-MW4-E01',
        title: 'Display-Case Magnetic Sensor Log',
        description: 'Sensor record showing the display vitrine unlatched at 12:06 AM.',
        detailed_content: 'Vitrine Sensor #A1: Magnetic contact broken at 12:06:14 AM. Door re-closed at 12:06:55 AM. Sensor state normal.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 15
      },
      {
        code: 'EVD-MW4-E02',
        title: 'CCTV Security Footage at 12:02 AM',
        description: 'Security camera capture showing Marcus leaving his post at 12:02 AM.',
        detailed_content: 'Camera 04 (Lobby Mezzanine): Guard Marcus turns and walks down the east courtyard corridor at 12:02:10 AM, leaving the display unmonitored for 6 minutes.',
        type: 'photograph',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW4-E03',
        title: 'Kitchen Midnight Pastry Receipt',
        description: 'Receipt signed by Elias at 12:04 AM in the banquet kitchen.',
        detailed_content: 'Pastry Delivery Chit: Signed by [Elias V.] at 12:04:15 AM. Kitchen stairs lead directly to the mezzanine in 20 seconds.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW4-E04',
        title: 'Sofia’s Video Conference Log',
        description: 'Telecom record showing call started at 11:58 PM, but does not prove location.',
        detailed_content: 'Cellular Mast Data: Device connected to cell sector covering Ashford Hotel mezzanine and terrace continuously from 11:58 PM to 12:15 AM.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW4-E05',
        title: 'Guest Photograph with Cufflink Reflection',
        description: 'Guest photo reflection showing someone with Elias’s silver cufflinks near the display.',
        detailed_content: 'High-res photograph taken by gala attendee at 12:06 AM: Vitrine glass reflection shows a man in a black tuxedo with bespoke monogrammed silver cufflinks matching Elias’s pair.',
        type: 'photograph',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 15
      },
      {
        code: 'EVD-MW4-E06',
        title: 'Hidden Key Lockbox Checkout Record',
        description: 'Hidden discovery: Display key checked out using Elias’s manager PIN code.',
        detailed_content: 'Key Management Audit: Vitrine Key #01 released at 11:52 PM via PIN Authorization [8841 - Elias Vance, Event Manager].',
        type: 'document',
        discovery_condition: 'Inspect Manager Lockbox in Hotel Office',
        is_hidden: 1,
        hidden_hint: 'Inspect the electronic lockbox in the Hotel Manager’s office to view key checkout history.',
        is_red_herring: 0,
        points: 15
      },
      {
        code: 'EVD-MW4-E07',
        title: 'Clara’s Fingerprints on Vitrine Glass',
        description: 'Fingerprints matching Clara on the outer vitrine frame; acts as a red herring.',
        detailed_content: 'Latent print analysis: Exterior fingerprints matching Clara Vance from routine cleaning earlier at 11:45 PM.',
        type: 'object',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 1,
        red_herring_explanation: 'Clara cleaned the case glass during scheduled setup at 11:45 PM, accounting for her superficial exterior fingerprints.',
        points: 5
      }
    ],
    timeline: [
      { time_str: '11:45 PM', title: 'Clara Cleans Display & Leaves', description: 'Clara finishes polishing the case and heads to the catalog room.', location_name: 'Mezzanine Display', order_seq: 1 },
      { time_str: '11:58 PM', title: 'Sofia Video Call Begins', description: 'Sofia initiates an overseas business call on the terrace.', location_name: 'Lounge Balcony', order_seq: 2 },
      { time_str: '12:02 AM', title: 'Marcus Leaves Guard Post', description: 'Marcus steps away from his post to investigate courtyard noises.', location_name: 'Security Desk', order_seq: 3 },
      { time_str: '12:04 AM', title: 'Elias Signs Kitchen Receipt', description: 'Elias signs pastry delivery receipt at the kitchen counter.', location_name: 'Service Kitchen', order_seq: 4 },
      { time_str: '12:06 AM', title: 'Display Case Opens', description: 'Sensor records display vitrine unlatched; pocket watch stolen.', location_name: 'Mezzanine Display', order_seq: 5 },
      { time_str: '12:10 AM', title: 'Theft Discovered', description: 'Guest alerts hotel management that the antique watch is missing.', location_name: 'Mezzanine Display', order_seq: 6 }
    ],
    locations: [
      { code: 'LOC-MW4-01', name: 'Mezzanine Display Alcove', floor: '2nd Floor Mezzanine', description: 'Elevated gallery where the historic pocket watch vitrine was showcased.', search_findings: 'The velvet watch cushion is empty. The brass lock shows no signs of picking.', second_inspection_finding: 'Angle of guest photo taken nearby reveals a cufflink reflection in the glass!' },
      { code: 'LOC-MW4-02', name: 'Hotel Service Kitchen', floor: '1st Floor Service Wing', description: 'Catering prep area with service stairs leading up to the mezzanine.', search_findings: 'Delivery clipboards hang by the pastry station. Elias’s signature appears on the 12:04 AM sheet.', second_inspection_finding: 'The service staircase allows access to the mezzanine in under 20 seconds.' },
      { code: 'LOC-MW4-03', name: 'Security Lobby Desk', floor: 'Ground Floor', description: 'Surveillance monitors and guard checkpoint.', search_findings: 'Marcus’s radio sits on the counter.', second_inspection_finding: 'CCTV monitor replay confirms Marcus vacated the area at 12:02 AM.' },
      { code: 'LOC-MW4-04', name: 'Hotel Management Office', floor: '1st Floor', description: 'Administrative office housing the electronic key management safe.', search_findings: 'The digital key terminal is online.', second_inspection_finding: 'Key safe audit reveals Elias’s PIN 8841 dispensed the vitrine key at 11:52 PM!', hidden_clue_code: 'EVD-MW4-E06' }
    ],
    messages: [
      { sender: 'Elias', receiver: 'Pastry Chef', timestamp_str: '11:55 PM', content: 'Hold the delivery slips at the back counter. I will sign them right at 12:04 AM.', is_suspicious: 1 },
      { sender: 'Sofia', receiver: 'Partner', timestamp_str: '11:57 PM', content: 'Dialing in from the terrace now. Keep the audio muted until my turn.', is_suspicious: 0 },
      { sender: 'Marcus', receiver: 'Guard Booth', timestamp_str: '12:01 AM', content: 'Hearing loud banging near east garden gate. Checking it out for 2 mins.', is_suspicious: 0 }
    ],
    contradictions: [
      {
        code: 'CON-MW4-01',
        title: 'Elias’s Continuous Kitchen Alibi vs Vitrine Sensor & Cufflinks',
        item_a_label: 'Elias: “I remained in the kitchen continuously and never stepped to the mezzanine”',
        item_b_label: 'Photo Reflection EVD-MW4-E05: Elias cufflinks at vitrine at 12:06 AM',
        explanation: 'Elias claimed he remained in the kitchen continuously, but the display opened at 12:06 AM (seconds away) and photo reflection E05 proves he was at the vitrine.',
        item_a_code: 'suspect_elias',
        item_b_code: 'evd-mw4-e05',
        points: 10
      },
      {
        code: 'CON-MW4-02',
        title: 'Marcus Continuous Watch Claim vs CCTV Footage',
        item_a_label: 'Marcus: “I kept continuous eyes on the lobby display”',
        item_b_label: 'CCTV EVD-MW4-E02: Marcus abandoned post at 12:02 AM',
        explanation: 'Marcus claimed he kept non-stop watch, directly refuted by CCTV recording him leaving his post at 12:02 AM.',
        item_a_code: 'suspect_marcus',
        item_b_code: 'evd-mw4-e02',
        points: 10
      }
    ]
  },

  // ==========================================
  // CASE 05: THE VANISHING STUDENT (MW-005)
  // ==========================================
  {
    case_number: 'MW-005',
    title: 'THE VANISHING STUDENT',
    difficulty: 'Hard',
    crime_location: 'Greenfield College',
    victim_name: 'Nikhil (Missing Student)',
    crime_time: '8:18 PM - 9:00 PM',
    stolen_item: 'None (Planned Self-Absence)',
    estimated_time: '25-35 mins',
    status: 'Active',
    conclusion_type: 'non_criminal',
    expected_conclusion_key: 'PLANNED_DISAPPEARANCE',
    scenario: 'After a technology event at Greenfield College, student Nikhil cannot be found. His backpack is discovered on a campus bench with a note saying, "I need a few days without calls." Players must determine whether the disappearance was planned.',
    motive_summary: 'Overwhelmed by academic burnout, intense competition pressure, and project disputes, Nikhil deliberately planned a quiet 4-day retreat to stay with his cousin at a remote cabin, leaving his backpack and note behind to signal he needed time away.',
    solution_breakdown: 'This was a PLANNED DISAPPEARANCE rather than a criminal abduction. Evidence confirms Nikhil drafted a scheduled email hours before the event (E06) outlining his plan to take the 8:35 PM bus to his cousin’s cabin. He purchased an intercity bus ticket at the East Gate kiosk at 8:34 PM (E03), leaving his backpack on the quad bench with an authentic handwritten note asking for days without calls (E05). Rohan’s claimed 8:30 PM room return (E04) was a fabrication to cover curfew, and Asha’s deleted argument message (E07) was an emotional dispute with zero criminal foul play.',
    culprit_name: 'Nikhil (Self-Planned Absence)',
    suspects: [
      {
        name: 'Asha',
        age: 21,
        occupation: 'Project Teammate',
        relationship: 'Co-author on Nikhil’s software presentation project',
        known_location: 'Main Auditorium & Stage Wings',
        statement: '“Nikhil and I had a heated argument about who authored the algorithms at 8:05 PM backstage. He shouted that he was done with everything, grabbed his jacket, and stormed out.”',
        alibi: 'In the auditorium keynote audience until 8:50 PM with classmates.',
        motive: 'Disputed project ownership and presentation credit.',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 1,
        suspicion_level: 65,
        questions: [
          {
            question_text: 'What was your argument with Nikhil about?',
            answer_text: 'It was about author priority on our AI code repository. I sent an angry voice memo and deleted it out of embarrassment, but I would never harm him!',
            reveals_evidence_code: 'EVD-MW5-E07',
            contradiction_hint: 'The deleted message reveals interpersonal tension, not foul play.'
          },
          {
            question_text: 'Did he say anything before walking away?',
            answer_text: 'He texted me at 8:12 PM saying he was stepping away from the project and the college.',
            reveals_evidence_code: 'EVD-MW5-E01',
            contradiction_hint: 'Confirms Nikhil’s intent to disengage voluntarily.'
          }
        ]
      },
      {
        name: 'Rohan',
        age: 21,
        occupation: 'Hostel Roommate',
        relationship: 'Shares Room 304 with Nikhil in Block B',
        known_location: 'Hostel Block B',
        statement: '“Nikhil came back to our hostel room at 8:30 PM, dropped off some books, said he was going for a walk, and left.”',
        alibi: 'Claims Nikhil was in their room at 8:30 PM.',
        motive: 'Fabricated his account to cover up missing the mandatory curfew roll-call.',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 0,
        suspicion_level: 70,
        questions: [
          {
            question_text: 'Are you sure Nikhil returned to the hostel at 8:30 PM?',
            answer_text: 'I... I thought I heard him! Honestly, I was worried the warden would dock our room points if Nikhil missed 9:00 PM check-in, so I covered for him.',
            reveals_evidence_code: 'EVD-MW5-E04',
            contradiction_hint: 'Hostel turnstile records prove Rohan swiped in alone at 8:28 PM.'
          }
        ]
      },
      {
        name: 'Meera',
        age: 20,
        occupation: 'Event Volunteer',
        relationship: 'Directing visitors near the East Campus gate',
        known_location: 'East Gate Outpost',
        statement: '“I was helping visitors find parking near the East Gate. Around 8:35 PM, I saw Nikhil walking toward the intercity bus kiosk carrying a duffel bag.”',
        alibi: 'At East Gate volunteer station from 8:00 PM to 9:30 PM.',
        motive: 'Neutral campus volunteer witness.',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 0,
        suspicion_level: 20,
        questions: [
          {
            question_text: 'Did Nikhil look distressed when you saw him at the East Gate?',
            answer_text: 'No, he looked relieved. He bought a ticket at the automated kiosk and boarded the intercity bus.',
            reveals_evidence_code: 'EVD-MW5-E03',
            contradiction_hint: 'Kiosk receipt confirms ticket purchased at 8:34 PM.'
          }
        ]
      },
      {
        name: 'Nikhil',
        age: 21,
        occupation: 'Missing Student (Subject of Inquiry)',
        relationship: 'Student who disappeared following tech exhibition',
        known_location: 'En route to Oakville Cabin',
        statement: '“Digital footprint: Pre-drafted scheduled email, handwritten quad note, and bus kiosk ticket proving planned voluntary absence.”',
        alibi: 'Voluntary temporary departure to recharge mental health.',
        motive: 'Academic burnout and severe pressure.',
        avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        is_culprit: 0,
        is_red_herring: 0,
        suspicion_level: 10,
        questions: [
          {
            question_text: 'What was discovered inside Nikhil’s abandoned backpack?',
            answer_text: 'His college ID, textbooks, and a handwritten note in his confirmed handwriting saying he needed a few days without calls.',
            reveals_evidence_code: 'EVD-MW5-E05',
            contradiction_hint: 'The note confirms a voluntary planned absence.'
          },
          {
            question_text: 'Did Nikhil leave behind any electronic drafts on his laptop?',
            answer_text: 'A scheduled draft email was found in his outbox addressed to his cousin, written hours before the event began!',
            reveals_evidence_code: 'EVD-MW5-E06',
            contradiction_hint: 'The scheduled email proves the disappearance was planned in advance.'
          }
        ]
      }
    ],
    evidence: [
      {
        code: 'EVD-MW5-E01',
        title: 'Nikhil’s Last Message to Asha',
        description: 'Direct message sent at 8:12 PM stating he is stepping away from the project.',
        detailed_content: 'SMS to Asha at 8:12:44 PM: "You can take full credit for the Aegis presentation. I am stepping away from everything for now."',
        type: 'message',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW5-E02',
        title: 'Main Hall Turnstile Exit Record',
        description: 'RFID turnstile record showing Nikhil left the tech expo hall at 8:18 PM.',
        detailed_content: 'Turnstile Exit #03: Student ID [2024-ENG-8812 / Nikhil Sharma] verified exit at 8:18:05 PM.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW5-E03',
        title: 'East Gate Intercity Kiosk Ticket Receipt',
        description: 'Printed transit kiosk receipt timestamped 8:34 PM for a one-way trip to Oakville.',
        detailed_content: 'Regional Bus Kiosk: Ticket #B-492 purchased with cash at 8:34:19 PM. Departure: 8:35 PM to Oakville Country Station.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 15
      },
      {
        code: 'EVD-MW5-E04',
        title: 'Hostel Block B Electronic Entry Log',
        description: 'Hostel turnstile log showing Rohan swiped in alone at 8:28 PM; zero record of Nikhil.',
        detailed_content: 'Hostel Turnstile Log: Rohan badged in at 8:28:44 PM solo. Nikhil has zero card transactions at the hostel gate all evening.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 10
      },
      {
        code: 'EVD-MW5-E05',
        title: 'Handwritten Quad Note Found in Backpack',
        description: 'Note found in the backpack asking for a few days without calls; verified handwriting.',
        detailed_content: 'Handwritten note on lined campus paper: "I need a few days without calls or messages. Please do not worry. I will reach out soon. - Nikhil". Verified by campus proctor.',
        type: 'document',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 0,
        points: 15
      },
      {
        code: 'EVD-MW5-E06',
        title: 'Hidden Scheduled Email to Cousin',
        description: 'Hidden discovery: Pre-scheduled email drafted at 4:15 PM outlining planned trip to cousin’s cabin.',
        detailed_content: 'Email Outbox (Scheduled for 9:30 PM): "Hey Arjun, heading out on the 8:35 PM bus to your Oakville cabin for four days of quiet away from college stress. Phone will be off."',
        type: 'message',
        discovery_condition: 'Inspect Nikhil’s Laptop Outbox in Hostel Room',
        is_hidden: 1,
        hidden_hint: 'Inspect Nikhil’s laptop in the Hostel Room to search for un-sent electronic drafts.',
        is_red_herring: 0,
        points: 20
      },
      {
        code: 'EVD-MW5-E07',
        title: 'Deleted Argument Voice Memo from Asha',
        description: 'Deleted argument message from Asha; acts as an emotional red herring with no foul play.',
        detailed_content: 'Voice memo transcript: "Nikhil, you cannot just abandon the presentation before the judges! Call me back right now!" Sent at 8:15 PM, deleted at 8:40 PM.',
        type: 'message',
        discovery_condition: 'Immediate',
        is_hidden: 0,
        is_red_herring: 1,
        red_herring_explanation: 'The argument caused emotional distress, but physical evidence proves Nikhil planned his retreat hours earlier.',
        points: 5
      }
    ],
    timeline: [
      { time_str: '7:50 PM', title: 'Technology Event Begins', description: 'Tech expo auditorium presentations commence.', location_name: 'Main Auditorium', order_seq: 1 },
      { time_str: '8:12 PM', title: 'Nikhil Messages Asha', description: 'Nikhil sends his final text to Asha and steps away from the stage.', location_name: 'Stage Wing', order_seq: 2 },
      { time_str: '8:18 PM', title: 'Nikhil Exits Main Hall', description: 'Nikhil scans through the main hall exit turnstile.', location_name: 'Main Hall Turnstiles', order_seq: 3 },
      { time_str: '8:30 PM', title: 'Rohan Claims Nikhil Returned', description: 'Roommate Rohan claims Nikhil came to room 304 (conflicts with logs).', location_name: 'Hostel Block B', order_seq: 4 },
      { time_str: '8:34 PM', title: 'Bus Kiosk Ticket Purchased', description: 'Cash ticket purchased at East Gate kiosk for intercity bus.', location_name: 'East Gate Outpost', order_seq: 5 },
      { time_str: '9:00 PM', title: 'Backpack Discovered', description: 'Campus security discovers Nikhil’s backpack and note on the quad bench.', location_name: 'Campus Quad Bench', order_seq: 6 }
    ],
    locations: [
      { code: 'LOC-MW5-01', name: 'Campus Quad Bench', floor: 'Central Quad', description: 'Wooden bench under the campus oaks where the backpack was discovered.', search_findings: 'Nikhil’s blue canvas backpack sits unattended on the bench slats.', second_inspection_finding: 'Inside the unzipped pocket lies the handwritten note in Nikhil’s handwriting!' },
      { code: 'LOC-MW5-02', name: 'Main Tech Expo Auditorium', floor: '1st Floor Science Complex', description: 'Large lecture auditorium with presentation stage and turnstile exits.', search_findings: 'The program flyer lists Nikhil and Asha’s presentation on the roster.', second_inspection_finding: 'Turnstile logs confirm Nikhil left at 8:18 PM.' },
      { code: 'LOC-MW5-03', name: 'East Gate Bus Outpost', floor: 'Campus Perimeter', description: 'Sheltered transit stop and automated intercity ticketing kiosk.', search_findings: 'The automated transit kiosk transaction record shows ticket #B-492 to Oakville.', second_inspection_finding: 'Volunteer Meera confirms seeing Nikhil board the 8:35 PM bus.' },
      { code: 'LOC-MW5-04', name: 'Hostel Room 304 (Block B)', floor: '3rd Floor Residence Hall', description: 'Shared dorm room occupied by Nikhil and Rohan.', search_findings: 'Nikhil’s desk holds his open study laptop in sleep mode.', second_inspection_finding: 'Waking the laptop reveals a pre-scheduled draft email in his outbox to his cousin!', hidden_clue_code: 'EVD-MW5-E06' }
    ],
    messages: [
      { sender: 'Nikhil', receiver: 'Asha', timestamp_str: '8:12 PM', content: 'You can take full credit for the Aegis presentation. I am stepping away from everything for now.', is_suspicious: 1 },
      { sender: 'Nikhil (Draft)', receiver: 'Cousin Arjun', timestamp_str: '4:15 PM (Pre-Drafted)', content: 'Hey Arjun, heading out on the 8:35 PM bus to your Oakville cabin for four days of quiet away from college stress. Phone will be off.', is_suspicious: 0 },
      { sender: 'Asha (Deleted)', receiver: 'Nikhil', timestamp_str: '8:15 PM', content: 'Nikhil, you cannot just abandon the presentation before the judges! Call me back right now!', is_suspicious: 1 },
      { sender: 'Hostel Warden', receiver: 'Rohan', timestamp_str: '8:50 PM', content: 'Curfew roll-call in 10 minutes. Ensure all occupants in Room 304 are present.', is_suspicious: 0 }
    ],
    contradictions: [
      {
        code: 'CON-MW5-01',
        title: 'Rohan’s Room Return Claim vs Hostel Gate Turnstile Log',
        item_a_label: 'Rohan: “Nikhil came back to Room 304 at 8:30 PM”',
        item_b_label: 'Hostel Log EVD-MW5-E04: Rohan entered alone, Nikhil never scanned',
        explanation: 'Rohan claimed Nikhil returned to the dorm at 8:30 PM, but the automated turnstile proves Rohan arrived alone and Nikhil never swiped in.',
        item_a_code: 'suspect_rohan',
        item_b_code: 'evd-mw5-e04',
        points: 10
      },
      {
        code: 'CON-MW5-02',
        title: 'Suspicion of Abduction vs Pre-Drafted Scheduled Email',
        item_a_label: 'Foul Play Suspicion: Nikhil abducted after dispute',
        item_b_label: 'Scheduled Email EVD-MW5-E06: Drafted at 4:15 PM planning retreat',
        explanation: 'Suspicion of sudden abduction or foul play is refuted by the scheduled email drafted at 4:15 PM that afternoon, proving the departure was pre-planned.',
        item_a_code: 'abduction_suspicion',
        item_b_code: 'evd-mw5-e06',
        points: 10
      }
    ]
  }
];

async function seedFiveCases() {
  await prepareSchema();

  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'mystery_web',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 5
  });

  console.log('🚀 Seeding 5 Interactive Digital Mystery Cases into MySQL...');

  // If case 1 exists with old case_number 'CASE #01', update it to 'MW-001'
  try {
    await pool.query("UPDATE cases SET case_number = 'MW-001' WHERE id = 1 AND case_number = 'CASE #01'");
    const [mw1Dups] = await pool.query("SELECT id FROM cases WHERE case_number = 'MW-001' AND id > 1");
    for (const dup of mw1Dups) {
      await pool.query("DELETE FROM cases WHERE id = ?", [dup.id]);
    }
  } catch (e) {
    console.warn('Initial alignment notice:', e.message);
  }

  for (const caseItem of casesData) {
    console.log(`\n📂 Processing Case: [${caseItem.case_number}] ${caseItem.title}...`);

    // Check if case already exists
    const [existing] = await pool.query('SELECT id FROM cases WHERE case_number = ?', [caseItem.case_number]);
    let caseId;

    if (existing.length > 0) {
      caseId = existing[0].id;
      await pool.query(
        `UPDATE cases SET 
          title = ?, scenario = ?, victim_name = ?, crime_location = ?, crime_time = ?, 
          stolen_item = ?, difficulty = ?, estimated_time = ?, status = ?, 
          motive_summary = ?, solution_breakdown = ?, conclusion_type = ?, expected_conclusion_key = ?
        WHERE id = ?`,
        [
          caseItem.title, caseItem.scenario, caseItem.victim_name, caseItem.crime_location, caseItem.crime_time,
          caseItem.stolen_item, caseItem.difficulty, caseItem.estimated_time, caseItem.status,
          caseItem.motive_summary, caseItem.solution_breakdown, caseItem.conclusion_type, caseItem.expected_conclusion_key,
          caseId
        ]
      );
      console.log(`   Updated case metadata for ID: ${caseId}`);
    } else {
      const [insertRes] = await pool.query(
        `INSERT INTO cases (
          case_number, title, scenario, victim_name, crime_location, crime_time,
          stolen_item, difficulty, estimated_time, status, motive_summary, solution_breakdown,
          conclusion_type, expected_conclusion_key
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          caseItem.case_number, caseItem.title, caseItem.scenario, caseItem.victim_name, caseItem.crime_location, caseItem.crime_time,
          caseItem.stolen_item, caseItem.difficulty, caseItem.estimated_time, caseItem.status, caseItem.motive_summary, caseItem.solution_breakdown,
          caseItem.conclusion_type, caseItem.expected_conclusion_key
        ]
      );
      caseId = insertRes.insertId;
      console.log(`   Created new case ID: ${caseId}`);
    }

    // Clear child records for clean idempotent seeding of this case
    await pool.query('DELETE FROM suspect_questions WHERE suspect_id IN (SELECT id FROM suspects WHERE case_id = ?)', [caseId]);
    await pool.query('DELETE FROM contradictions WHERE case_id = ?', [caseId]);
    await pool.query('DELETE FROM messages WHERE case_id = ?', [caseId]);
    await pool.query('DELETE FROM timeline_events WHERE case_id = ?', [caseId]);
    await pool.query('DELETE FROM evidence WHERE case_id = ?', [caseId]);
    await pool.query('DELETE FROM locations WHERE case_id = ?', [caseId]);
    await pool.query('DELETE FROM suspects WHERE case_id = ?', [caseId]);

    // 1. Insert Suspects
    const suspectIdMap = {};
    let culpritId = null;

    for (const s of caseItem.suspects) {
      const [sRes] = await pool.query(
        `INSERT INTO suspects (
          case_id, name, age, occupation, relationship, statement, alibi, motive,
          avatar_url, image_url, known_location, is_culprit, is_red_herring, suspicion_level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          caseId, s.name, s.age, s.occupation, s.relationship, s.statement, s.alibi, s.motive,
          s.avatar_url, s.avatar_url, s.known_location, s.is_culprit, s.is_red_herring, s.suspicion_level
        ]
      );
      const insertedSuspectId = sRes.insertId;
      suspectIdMap[s.name] = insertedSuspectId;

      if (s.is_culprit) {
        culpritId = insertedSuspectId;
      }

      // Insert suspect questions
      if (s.questions && s.questions.length > 0) {
        for (let qIdx = 0; qIdx < s.questions.length; qIdx++) {
          const q = s.questions[qIdx];
          await pool.query(
            `INSERT INTO suspect_questions (
              suspect_id, question_text, answer_text, reveals_evidence_code, contradiction_hint, order_seq
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              insertedSuspectId, q.question_text, q.answer_text, q.reveals_evidence_code, q.contradiction_hint, qIdx + 1
            ]
          );
        }
      }
    }

    // Set culprit_suspect_id on cases table
    if (culpritId) {
      await pool.query('UPDATE cases SET culprit_suspect_id = ? WHERE id = ?', [culpritId, caseId]);
    } else {
      await pool.query('UPDATE cases SET culprit_suspect_id = NULL WHERE id = ?', [caseId]);
    }
    console.log(`   Inserted ${caseItem.suspects.length} suspects`);

    // 2. Insert Locations
    const locationIdMap = {};
    for (const loc of caseItem.locations) {
      const [lRes] = await pool.query(
        `INSERT INTO locations (
          case_id, code, name, description, floor, search_findings, second_inspection_finding, hidden_clue_code, icon_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          caseId, loc.code, loc.name, loc.description, loc.floor, loc.search_findings, loc.second_inspection_finding, loc.hidden_clue_code, 'map-pin'
        ]
      );
      locationIdMap[loc.code] = lRes.insertId;
    }
    console.log(`   Inserted ${caseItem.locations.length} locations`);

    // 3. Insert Evidence
    for (const ev of caseItem.evidence) {
      const evTypeShort = ev.type === 'photograph' ? 'photo' : (['document', 'message', 'object'].includes(ev.type) ? ev.type : 'other');
      await pool.query(
        `INSERT INTO evidence (
          case_id, code, title, description, detailed_content, type, evidence_type,
          discovery_condition, is_hidden, hidden_hint, is_red_herring, red_herring_explanation,
          image_url, points
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          caseId, ev.code, ev.title, ev.description, ev.detailed_content, ev.type, evTypeShort,
          ev.discovery_condition, ev.is_hidden, ev.hidden_hint, ev.is_red_herring, ev.red_herring_explanation || null,
          ev.image_url || null, ev.points || 10
        ]
      );
    }
    console.log(`   Inserted ${caseItem.evidence.length} evidence items`);

    // 4. Insert Timeline Events
    for (const te of caseItem.timeline) {
      await pool.query(
        `INSERT INTO timeline_events (
          case_id, time_str, event_title, title, description, location_name, order_seq
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          caseId, te.time_str, te.title, te.title, te.description, te.location_name, te.order_seq
        ]
      );
    }
    console.log(`   Inserted ${caseItem.timeline.length} timeline events`);

    // 5. Insert Messages
    for (const msg of caseItem.messages) {
      await pool.query(
        `INSERT INTO messages (
          case_id, platform, sender, receiver, timestamp_str, content, message, is_suspicious
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          caseId, 'Direct / SMS', msg.sender, msg.receiver, msg.timestamp_str, msg.content, msg.content, msg.is_suspicious
        ]
      );
    }
    console.log(`   Inserted ${caseItem.messages.length} messages`);

    // 6. Insert Contradictions
    for (const con of caseItem.contradictions) {
      const implicatedSuspect = suspectIdMap[caseItem.culprit_name] || Object.values(suspectIdMap)[0];
      await pool.query(
        `INSERT INTO contradictions (
          case_id, code, title, item_a_label, item_b_label, explanation, implicated_suspect_id, points, item_a_code, item_b_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          caseId, con.code, con.title, con.item_a_label, con.item_b_label, con.explanation, implicatedSuspect, con.points, con.item_a_code, con.item_b_code
        ]
      );
    }
    console.log(`   Inserted ${caseItem.contradictions.length} contradictions`);
  }

  // Final summary verification
  const [caseCount] = await pool.query('SELECT count(*) as cnt FROM cases');
  const [susCount] = await pool.query('SELECT count(*) as cnt FROM suspects');
  const [eviCount] = await pool.query('SELECT count(*) as cnt FROM evidence');
  const [conCount] = await pool.query('SELECT count(*) as cnt FROM contradictions');

  console.log('\n==========================================');
  console.log(`🎉 ALL 5 CASES SUCCESSFULLY SEEDED!`);
  console.log(`Cases: ${caseCount[0].cnt} | Suspects: ${susCount[0].cnt} | Evidence: ${eviCount[0].cnt} | Contradictions: ${conCount[0].cnt}`);
  console.log('==========================================');

  await pool.end();
}

if (require.main === module) {
  seedFiveCases().catch(err => {
    console.error('Fatal seedFiveCases error:', err);
    process.exit(1);
  });
}

module.exports = { seedFiveCases, casesData };
