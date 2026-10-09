-- ===================================================
-- Mystery Web - Database Schema & Seed Data
-- ===================================================

CREATE DATABASE IF NOT EXISTS mystery_web;
USE mystery_web;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'detective',
  badge_number VARCHAR(50) DEFAULT 'DET-8821',
  avatar_url VARCHAR(255) DEFAULT '/avatars/detective-default.png',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Cases Table
CREATE TABLE IF NOT EXISTS cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_number VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  scenario TEXT NOT NULL,
  victim_name VARCHAR(100),
  crime_location VARCHAR(100),
  crime_time VARCHAR(50),
  stolen_item VARCHAR(100),
  difficulty VARCHAR(50) DEFAULT 'Medium',
  estimated_time VARCHAR(50) DEFAULT '25-35 mins',
  status VARCHAR(50) DEFAULT 'Active',
  culprit_suspect_id INT NULL,
  motive_summary TEXT,
  solution_breakdown TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Suspects Table
CREATE TABLE IF NOT EXISTS suspects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INT,
  occupation VARCHAR(150),
  relationship VARCHAR(255),
  known_location VARCHAR(255),
  statement TEXT,
  motive TEXT,
  alibi TEXT,
  avatar_url VARCHAR(255),
  is_culprit BOOLEAN DEFAULT FALSE,
  is_red_herring BOOLEAN DEFAULT FALSE,
  suspicion_level INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 4. Suspect Questions Table
CREATE TABLE IF NOT EXISTS suspect_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  suspect_id INT NOT NULL,
  question_text VARCHAR(255) NOT NULL,
  answer_text TEXT NOT NULL,
  reveals_evidence_code VARCHAR(50) NULL,
  contradiction_hint VARCHAR(255) NULL,
  order_seq INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (suspect_id) REFERENCES suspects(id) ON DELETE CASCADE
);

-- 5. Locations Table
CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  floor VARCHAR(50),
  search_findings TEXT,
  second_inspection_finding TEXT,
  hidden_clue_code VARCHAR(50) NULL,
  icon_name VARCHAR(50) DEFAULT 'compass',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 6. Evidence Table
CREATE TABLE IF NOT EXISTS evidence (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  detailed_content TEXT,
  type ENUM('photograph', 'document', 'message', 'object') NOT NULL,
  discovery_condition VARCHAR(255) DEFAULT 'Immediate',
  is_hidden BOOLEAN DEFAULT FALSE,
  hidden_hint VARCHAR(255) NULL,
  is_red_herring BOOLEAN DEFAULT FALSE,
  red_herring_explanation TEXT NULL,
  related_suspect_id INT NULL,
  related_location_id INT NULL,
  image_url VARCHAR(255) NULL,
  interactive_type VARCHAR(50) DEFAULT 'standard',
  secret_content TEXT NULL,
  points INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (related_suspect_id) REFERENCES suspects(id) ON DELETE SET NULL,
  FOREIGN KEY (related_location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- 7. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  platform VARCHAR(50) DEFAULT 'SMS',
  sender VARCHAR(100) NOT NULL,
  receiver VARCHAR(100) NOT NULL,
  timestamp_str VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  is_suspicious BOOLEAN DEFAULT FALSE,
  related_suspect_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (related_suspect_id) REFERENCES suspects(id) ON DELETE SET NULL
);

-- 8. Timeline Events Table
CREATE TABLE IF NOT EXISTS timeline_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  time_str VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location_name VARCHAR(100),
  involved_suspect_id INT NULL,
  has_conflict BOOLEAN DEFAULT FALSE,
  conflict_details TEXT NULL,
  order_seq INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (involved_suspect_id) REFERENCES suspects(id) ON DELETE SET NULL
);

-- 9. Contradictions Table
CREATE TABLE IF NOT EXISTS contradictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  item_a_label VARCHAR(255) NOT NULL,
  item_b_label VARCHAR(255) NOT NULL,
  explanation TEXT NOT NULL,
  implicated_suspect_id INT NOT NULL,
  points INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (implicated_suspect_id) REFERENCES suspects(id) ON DELETE CASCADE
);

-- 10. Case Notes Table
CREATE TABLE IF NOT EXISTS case_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  case_id INT NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  tag VARCHAR(50) DEFAULT 'General',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 11. Investigation Progress Table
CREATE TABLE IF NOT EXISTS investigation_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  case_id INT NOT NULL,
  clues_found JSON,
  hidden_clues_found JSON,
  questions_asked JSON,
  contradictions_discovered JSON,
  board_connections JSON,
  locations_explored JSON,
  status VARCHAR(50) DEFAULT 'In Progress',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY user_case_idx (user_id, case_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 12. Accusations Table
CREATE TABLE IF NOT EXISTS accusations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  case_id INT NOT NULL,
  accused_suspect_id INT NOT NULL,
  deduction_text TEXT NOT NULL,
  selected_evidence_codes JSON,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (accused_suspect_id) REFERENCES suspects(id) ON DELETE CASCADE
);

-- 13. Scores Table
CREATE TABLE IF NOT EXISTS scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  case_id INT NOT NULL,
  accusation_id INT NULL,
  score INT NOT NULL,
  rank_title VARCHAR(100) NOT NULL,
  accuracy_percent INT NOT NULL,
  breakdown JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- ===================================================
-- SEED DATA FOR CASE #01: THE MISSING NECKLACE
-- ===================================================

-- Insert Default Admin & Sample Detective
-- Passwords below are bcrypt hashes for: 'password123'
INSERT INTO users (name, email, password, role, badge_number) VALUES
('Chief Inspector Sterling', 'admin@mysteryweb.com', '$2a$10$wT0lP.v68w6wDk2wK8fEie8cWbT6sH1yA8vJ6mQZ3R4K7rK3QvN5i', 'admin', 'CHIEF-001'),
('Detective Alex Vance', 'detective@mysteryweb.com', '$2a$10$wT0lP.v68w6wDk2wK8fEie8cWbT6sH1yA8vJ6mQZ3R4K7rK3QvN5i', 'detective', 'DET-7749')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Case #01
INSERT INTO cases (id, case_number, title, scenario, victim_name, crime_location, crime_time, stolen_item, difficulty, estimated_time, status, motive_summary, solution_breakdown)
VALUES (
  1,
  'CASE #01',
  'THE MISSING NECKLACE',
  'During Lord Reginald Harrington’s 50th birthday gala at Blackwood Manor, the historic 50-carat "Tears of Cleopatra" diamond necklace was stolen from the high-security wall safe in the 2nd-floor master study. At precisely 8:15 PM, a sudden 3-minute power outage darkened the mansion. When power returned and Lord Harrington checked the safe at 8:30 PM, the velvet case was empty. Four high-profile individuals were present on the grounds, each holding secrets, debts, and conflicting accounts.',
  'Lord Reginald Harrington',
  'Master Study, 2nd Floor, Blackwood Manor',
  '8:14 PM - 8:18 PM (Power Outage)',
  '50-Carat "Tears of Cleopatra" Diamond Necklace ($3.5M)',
  'Medium',
  '25-35 mins',
  'Active',
  'Julian Sterling was drowning in millions of overseas debt and facing an Interpol audit. He orchestrated the power outage using a timing relay, used a duplicate VIP master keycard, replaced the genuine necklace with a synthesized zirconium replica, but his vintage gold pocket watch was caught and smashed on the mahogany desk during his hasty escape.',
  'Julian Sterling claimed he was never upstairs and stayed in the Grand Ballroom enjoying the piano recital continuously from 7:45 PM to 8:30 PM. However: 1) The pianist confirmed the recital ended at 8:05 PM, 2) CCTV footage at 8:16 PM caught a man in Julian’s distinctive pinstripe tuxedo descending the service stairs, 3) The smashed gold watch gear stamped with "J.S." and stopped at 8:14 PM was found right beside the safe, 4) A synthetic replica velvet pouch stamped "Paris Lab" was stashed in the wine cellar where Julian visited before dinner. Marcus Blackwood was a red herring whose fingerprints were on the box because he repaired the hinge at 3:00 PM.'
)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Insert Suspects
INSERT INTO suspects (id, case_id, name, age, occupation, relationship, known_location, statement, motive, alibi, avatar_url, is_culprit, is_red_herring, suspicion_level) VALUES
(
  1,
  1,
  'Elena Vance',
  28,
  'Private Secretary to Lord Harrington',
  'Personal employee for 4 years; manages his estate & safe codes',
  'Library & 2nd Floor Hallway',
  '“I spent the evening in the library printing Lord Harrington’s toast speech. I panicked when the lights flickered off at 8:15 PM because I had misplaced the safe key earlier in the afternoon. I swear I never opened the safe!”',
  'Struggling with her brother’s bankrupt company debts. Rumored to be under financial duress.',
  'Claims she was printing speeches in the library from 8:00 PM to 8:25 PM.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  FALSE,
  FALSE,
  65
),
(
  2,
  1,
  'Julian Sterling',
  42,
  'High-End Antique & Gem Dealer',
  'Long-time art advisory consultant & VIP gala guest',
  'Grand Ballroom & Service Corridors',
  '“I am an esteemed connoisseur, not a petty thief! I spent the entire evening between 7:45 PM and 8:30 PM in the Grand Ballroom right beside the grand piano sipping vintage champagne. I never once stepped upstairs.”',
  'His Mayfair antique gallery is insolvent; under covert investigation by international customs for trafficking rare unset diamonds.',
  'Claims uninterrupted presence in the Grand Ballroom listening to Chopin by the pianist.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  TRUE,
  FALSE,
  85
),
(
  3,
  1,
  'Marcus Blackwood',
  34,
  'Estranged Stepbrother',
  'Disinherited stepbrother; frequent public disputes over family estate',
  'Garden Terrace & Smoking Balcony',
  '“Look, Reginald and I despise each other, but I am no burglar. I was out on the terrace having cigars in the cold rain. If my prints are anywhere near his precious jewelry box, it is because Reginald makes a show of everything!”',
  'Deep resentment over being cut out of the family trust; desperate need for liquidity.',
  'Claims he was outside smoking on the Garden Terrace from 8:00 PM to 8:30 PM.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  FALSE,
  TRUE,
  78
),
(
  4,
  1,
  'Chloe Davenport',
  26,
  'Lead Gala Caterer & Event Mixologist',
  'Contracted service staff; free movement across manor pantry & corridors',
  'Kitchen Pantry & Service Staircase',
  '“We were slammed with champagne orders! During the power cut at 8:15 PM, everyone in the kitchen scrambled for emergency lanterns. I didn’t even know what the Tears of Cleopatra was until the police sirens sounded.”',
  'Recently overheard boasting about moving to the French Riviera; has access to every service door.',
  'Claims she was coordinating catering supplies in the kitchen pantry during the blackout.',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  FALSE,
  FALSE,
  55
)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Update Case culprit
UPDATE cases SET culprit_suspect_id = 2 WHERE id = 1;

-- Insert Suspect Questions
INSERT INTO suspect_questions (id, suspect_id, question_text, answer_text, reveals_evidence_code, contradiction_hint, order_seq) VALUES
-- Elena Questions
(1, 1, 'Where were you at 8:00 PM when the dinner began?', '“I was walking between the library and the dining hall with speech prints. I saw Julian near the west wing stairs looking at his pocket watch.”', 'EVD-DOC-02', 'Places Julian near the stairs earlier', 1),
(2, 1, 'When did you last see the necklace inside the safe?', '“Lord Harrington inspected it at 7:30 PM before guests arrived. I placed it in the center shelf and locked the dial.”', NULL, NULL, 2),
(3, 1, 'Did you really lose your safe master key as you claimed?', '“I... well, I thought I misplaced it at 7:00 PM, but I actually found it in my pouch at 7:45 PM. I panicked because I didn’t want the inspector to think I was negligent!”', 'EVD-MSG-03', 'Contradicts her initial police statement of losing the key', 3),
(4, 1, 'Why were you investigating Lord Harrington’s financial records?', '“Because he was cooking the estate books and planning to frame me for missing funds! I was copying ledgers to protect myself, not stealing gems!”', NULL, NULL, 4),

-- Julian Questions
(5, 2, 'Where were you between 8:00 PM and 8:25 PM?', '“As I stated, I was by the grand piano in the ballroom listening to classical music without leaving for a solitary moment.”', NULL, 'Contradicts piano recital schedule and CCTV', 1),
(6, 2, 'Do you own a vintage gold pocket watch?', '“Of course. A family heirloom from Patek Philippe. Though I seem to have misplaced it sometime during the evening commotion.”', 'EVD-OBJ-01', 'Direct link to smashed watch found in master study', 2),
(7, 2, 'Why did your business receive a subpoena from European gem regulators?', '“Nonsense rumors spread by jealous London competitors! My antique transactions are completely above board.”', 'EVD-MSG-02', 'Reveals pressure to deliver uncut diamonds by midnight', 3),
(8, 2, 'Did you have access to the 2nd-floor master study?', '“Absolutely not. I have never been upstairs in Blackwood Manor. I wouldn’t even know where Reginald keeps his safe.”', 'EVD-DOC-01', 'Contradicts VIP Master keycard record', 4),

-- Marcus Questions
(9, 3, 'Why were your fingerprints found on the safe’s velvet box?', '“Because Reginald asked me to look at the jammed brass latch at 3:00 PM! He knows I restore vintage locks. There is an invoice and work receipt for it in his desk drawer!”', 'EVD-DOC-04', 'Explains red herring fingerprints', 1),
(10, 3, 'Was anyone with you on the Garden Terrace during the blackout?', '“The head gardener, old Thomas, saw me shivering under the pergola around 8:15 PM when the lights blew. Ask him!”', 'EVD-OBJ-03', 'Confirms alibi outside in rain', 2),
(11, 3, 'Did you hear any strange noises around 8:15 PM?', '“I heard a sharp thud from the study window right above the terrace—like heavy glass or metal dropping onto oak floors.”', NULL, 'Matches broken watch impact at 8:14 PM', 3),

-- Chloe Questions
(12, 4, 'Why was a scrap of torn black velvet found in the 2nd-floor corridor?', '“I tripped over a champagne crate on the service stairs at 6:45 PM while setting up! Look at my pantry inventory log, I ripped my apron hours before the gala even started!”', 'EVD-DOC-03', 'Explains red herring fabric scrap', 1),
(13, 4, 'Did you see anyone near the service stairs around 8:15 PM?', '“Yes! During the blackout, someone in a dark suit brushed past me in the dark heading down toward the wine cellar. He smelled strongly of cedar and expensive cologne.”', NULL, 'Matches Julian’s signature cedar cologne', 2)
ON DUPLICATE KEY UPDATE question_text=VALUES(question_text);

-- Insert Locations
INSERT INTO locations (id, case_id, code, name, description, floor, search_findings, second_inspection_finding, hidden_clue_code, icon_name) VALUES
(
  1,
  1,
  'LOC-01',
  'The Master Study',
  'Lord Harrington’s private sanctuary on the 2nd Floor. Features oak paneling, oil paintings, and the concealed biometric wall safe behind a portrait of the Manor.',
  '2nd Floor - West Wing',
  'The wall safe door is ajar with no signs of forced explosion. A glass tumbler is overturned on the mahogany desk.',
  'Inspecting beneath the heavy desk edge reveals a small brass gear from an antique watch mechanism lodged in the parquet groove.',
  'EVD-OBJ-01',
  'shield'
),
(
  2,
  1,
  'LOC-02',
  'The Grand Ballroom',
  'The opulent central hall where 60 gala guests gathered under crystal chandeliers. The grand piano sits beside the French doors.',
  'Ground Floor - Central',
  'Guests were drinking champagne. The pianist’s sheet music indicates the recital program concluded promptly at 8:05 PM.',
  'Examining the guest seating card near the piano shows Julian Sterling’s untouched champagne glass sat flat since 8:10 PM.',
  'EVD-DOC-05',
  'users'
),
(
  3,
  1,
  'LOC-03',
  'The Wine Cellar & Service Passage',
  'Underground vaulted stone cellar connecting to the servants’ service stairs and electrical fuse board.',
  'Basement - East Wing',
  'The main circuit breaker panel shows tamper marks on the 8:15 PM timer relay switch.',
  'Tucked behind a 1982 Bordeaux bottle rack is a discarded black velvet pouch marked "High-Refractive Zirconium Specimen - Paris Laboratories".',
  'EVD-OBJ-02',
  'archive'
),
(
  4,
  1,
  'LOC-04',
  'The Garden Terrace',
  'Exterior stone terrace overlooking the estate fountains, exposed to the chilly autumn rain.',
  'Ground Floor - South Wing',
  'Wet cobblestones with discarded cigar ashes under the covered stone awning.',
  'Under the stone bench, a dry box of Cohiba matches and a Cuban cigar wrapper matching Marcus Blackwood’s coat pocket is preserved.',
  'EVD-OBJ-03',
  'compass'
)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Evidence
INSERT INTO evidence (id, case_id, code, title, description, detailed_content, type, discovery_condition, is_hidden, hidden_hint, is_red_herring, red_herring_explanation, related_suspect_id, related_location_id, interactive_type, secret_content, points) VALUES
-- Photographs
(
  1,
  1,
  'EVD-PHT-01',
  'CCTV West Corridor Frame at 8:16 PM',
  'Low-light infrared camera capture of the 2nd-floor service staircase during the blackout.',
  'The infrared camera captures a silhouette in a tailor-fitted pinstripe tuxedo descending the service stairs at 8:16:42 PM. The figure is clutching an object in his right breast pocket.',
  'photograph',
  'Immediate',
  FALSE,
  NULL,
  FALSE,
  NULL,
  2,
  1,
  'zoomable_photo',
  'Enhanced zoom reveals cufflinks bearing the initials "J.S." and a distinctive boutonnière carnation identical to Julian Sterling’s.',
  15
),
(
  2,
  1,
  'EVD-PHT-02',
  'Master Study Safe Crime Scene Photo',
  'Police forensics photograph showing the opened wall safe behind the tilted oil painting.',
  'The safe door shows zero drill marks or pry damage. The electronic keypad shows access granted via master emergency card. The internal velvet riser is bare.',
  'photograph',
  'Immediate',
  FALSE,
  NULL,
  FALSE,
  NULL,
  NULL,
  1,
  'standard',
  NULL,
  10
),
(
  3,
  1,
  'EVD-PHT-03',
  'Gala Ballroom Crowd Photo at 8:15 PM',
  'Photo taken by a party photographer right as the chandeliers flickered off.',
  'Crowd is looking up in astonishment. The grand piano is empty and unattended. Julian Sterling is conspicuously absent from the ballroom frame.',
  'photograph',
  'Immediate',
  FALSE,
  NULL,
  FALSE,
  NULL,
  2,
  2,
  'standard',
  NULL,
  10
),

-- Documents
(
  4,
  1,
  'EVD-DOC-01',
  'Safe Maintenance & Keycard Log',
  'Digital access audit from Chubb Locks security system installed at Blackwood Manor.',
  'Audit log shows three master override keycards issued: Card #01 (Lord Harrington), Card #02 (Elena Vance), and Card #03 (Issued to Art Consultant Julian Sterling for private estate collection valuation). Card #03 was scanned at 8:14 PM on the study lock!',
  'document',
  'Explore Master Study',
  FALSE,
  NULL,
  FALSE,
  NULL,
  2,
  1,
  'uv_reveal',
  'UV Light Reveal: The digital signature on Card #03 was activated from Julian Sterling’s personal smartphone device.',
  20
),
(
  5,
  1,
  'EVD-DOC-02',
  'Photocopied Offshore Financial Ledgers',
  'Confidential financial files discovered inside Elena Vance’s leather portfolio.',
  'Detailed spreadsheet records showing Lord Harrington funneling shell company assets through Caribbean trusts. Elena was compiling evidence for whistleblowing.',
  'document',
  'Interrogate Elena Vance',
  FALSE,
  NULL,
  FALSE,
  NULL,
  1,
  NULL,
  'standard',
  NULL,
  10
),
(
  6,
  1,
  'EVD-DOC-03',
  'Torn Black Velvet Fabric Strip',
  'A 4-inch strip of heavy black velvet found hooked on a radiator in the 2nd floor hallway.',
  'Matches the exact fabric weave of Chloe Davenport’s catering uniform apron. High suspicion at first glance.',
  'document',
  'Immediate',
  FALSE,
  NULL,
  TRUE,
  'RED HERRING: Chloe ripped her apron at 6:45 PM while hauling heavy ice chests before the gala began, as verified by kitchen staff logs.',
  4,
  1,
  'standard',
  NULL,
  10
),
(
  7,
  1,
  'EVD-DOC-04',
  'Safe Box Repair Receipt (3:00 PM)',
  'Handwritten service receipt signed by Lord Harrington and Marcus Blackwood.',
  '“Paid Marcus Blackwood $200 for emergency lock-pin alignment on antique velvet jewelry display case at 15:00 hours.” Explains why Marcus’s fingerprints are on the box.',
  'document',
  'Interrogate Marcus Blackwood',
  FALSE,
  NULL,
  FALSE,
  NULL,
  3,
  NULL,
  'standard',
  NULL,
  15
),
(
  8,
  1,
  'EVD-DOC-05',
  'Pianist Gala Performance Schedule',
  'Official program printed on gold leaf cardstock from the Grand Ballroom.',
  'Program: 7:15 - 7:45 PM Classical Nocturnes. 7:45 - 8:05 PM Chopin Ballade Solo. 8:05 PM - Intermission. The pianist took intermission from 8:05 to 8:35 PM, proving Julian’s statement of listening to live piano during the blackout was a fabricated lie.',
  'document',
  'Explore Grand Ballroom twice',
  TRUE,
  'Search the pianist sheet music stand in the Ballroom',
  FALSE,
  NULL,
  2,
  2,
  'standard',
  NULL,
  15
),

-- Physical Objects
(
  9,
  1,
  'EVD-OBJ-01',
  'Smashed Vintage Gold Watch Gear & Monogram',
  'A mechanical escapement gear and fragmented casing found under the study desk.',
  'The vintage watch glass is shattered. The hands are frozen precisely at 8:14:15 PM. The backplate engraving reads: "To Julian Sterling, with esteem - London Horology 2018".',
  'object',
  'Search Master Study Parquet Floor',
  TRUE,
  'Inspect the groove under the desk in the Master Study',
  FALSE,
  NULL,
  2,
  1,
  'inspectable_3d',
  'The watch broke when slammed violently against the oak desk corner in the dark at 8:14 PM.',
  20
),
(
  10,
  1,
  'EVD-OBJ-02',
  'Synthetic Replica Velvet Pouch ("Paris Lab")',
  'An empty jeweler pouch stamped "High-Refractive Zirconium Specimen" found hidden in the wine cellar.',
  'Identical dimensions to the "Tears of Cleopatra" necklace. Proves someone brought a fake necklace to swap with the real diamond piece!',
  'object',
  'Inspect Wine Cellar Wine Rack twice',
  TRUE,
  'Search behind the dusty Bordeaux wine bottles in the cellar',
  FALSE,
  NULL,
  2,
  3,
  'standard',
  NULL,
  15
),
(
  11,
  1,
  'EVD-OBJ-03',
  'Dry Cohiba Cigar Matches & Terrace Witness Note',
  'Under the Garden Terrace rain awning: unsmoked cigar and signed gardener note.',
  'Gardener Thomas confirms Marcus Blackwood stood on the terrace smoking under the stone roof continuously through the rain from 8:05 to 8:28 PM.',
  'object',
  'Inspect Garden Terrace twice',
  TRUE,
  'Look under the stone bench on the rainy Garden Terrace',
  FALSE,
  NULL,
  3,
  4,
  'standard',
  NULL,
  10
),
(
  12,
  1,
  'EVD-OBJ-04',
  'Marcus Blackwood’s Fingerprints on Velvet Box',
  'Forensic dusting report on the velvet necklace display container.',
  'Latent thumb and index prints belonging to Marcus Blackwood on the exterior brass clasp of the box.',
  'object',
  'Immediate',
  FALSE,
  NULL,
  TRUE,
  'RED HERRING: Fingerprints left legitimately at 3:00 PM during repair, corroborated by receipt EVD-DOC-04.',
  3,
  1,
  'standard',
  NULL,
  10
),

-- Messages
(
  13,
  1,
  'EVD-MSG-01',
  'Chloe’s Urgent WhatsApp Chat',
  'Text conversation between Chloe Davenport and her boyfriend during the gala.',
  '8:12 PM: Chloe: "Catering manager is yelling again, power is flickering." 8:18 PM: Chloe: "Someone in a tuxedo just ran past the cellar stairs nearly knocking over my tray."',
  'message',
  'Immediate',
  FALSE,
  NULL,
  FALSE,
  NULL,
  4,
  NULL,
  'chat_bubble',
  NULL,
  10
),
(
  14,
  1,
  'EVD-MSG-02',
  'Julian’s Encrypted Signal Message Thread',
  'Recovered encrypted text from an anonymous Swiss gem broker on Julian’s phone.',
  '“The Antwerp buyer arrives at the private airstrip at 23:30. Ensure the Cleopatra stone is unset and uncertified. Total payout: $2.8 Million in bearer bonds.” Sent at 7:12 PM!',
  'message',
  'Interrogate Julian Sterling',
  FALSE,
  NULL,
  FALSE,
  NULL,
  2,
  NULL,
  'chat_bubble',
  NULL,
  20
),
(
  15,
  1,
  'EVD-MSG-03',
  'Elena’s Text to Her Brother (7:45 PM)',
  'Outgoing SMS on Elena Vance’s phone sent 30 minutes before the theft.',
  '“I found the safe key in my jacket pocket after all. The necklace is safely locked away in Reginald’s vault. Stop calling me during work.”',
  'message',
  'Interrogate Elena Vance',
  FALSE,
  NULL,
  FALSE,
  NULL,
  1,
  NULL,
  'chat_bubble',
  NULL,
  10
)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Insert Communications / Messages
INSERT INTO messages (id, case_id, platform, sender, receiver, timestamp_str, content, is_suspicious, related_suspect_id) VALUES
(1, 1, 'WhatsApp', 'Chloe Davenport', 'Liam (Boyfriend)', '8:02 PM', 'These rich folks are impossible. Lord Harrington ordered 4 cases of 2008 Dom Pérignon.', FALSE, 4),
(2, 1, 'WhatsApp', 'Chloe Davenport', 'Liam (Boyfriend)', '8:12 PM', 'Power grid is buzzing weirdly in the pantry... lights just flickered twice.', TRUE, 4),
(3, 1, 'WhatsApp', 'Chloe Davenport', 'Liam (Boyfriend)', '8:19 PM', 'Omg pitch black for 3 minutes! And some guy in a tuxedo reeking of cologne dashed down the service steps.', TRUE, 4),
(4, 1, 'Signal', 'Julian Sterling', 'G. Vandeberg (Antwerp)', '7:12 PM', 'Operation ready. Swap will happen during the gala diversion. Wire the initial 500k to Zurich account.', TRUE, 2),
(5, 1, 'Signal', 'G. Vandeberg (Antwerp)', 'Julian Sterling', '7:40 PM', 'Understood. Airstrip runway will have beacon on at 23:30 sharp. Do not leave the genuine certificate behind.', TRUE, 2),
(6, 1, 'SMS', 'Elena Vance', 'David Vance (Brother)', '7:15 PM', 'David please stop panicking. I cannot steal Lord Harrington’s bonds for you. That is criminal.', TRUE, 1),
(7, 1, 'SMS', 'Elena Vance', 'David Vance (Brother)', '7:45 PM', 'Safe is locked, key is in my purse. I am going to the library to print his speech. Do not text me again.', FALSE, 1),
(8, 1, 'SMS', 'Marcus Blackwood', 'Unknown Bookie', '6:30 PM', 'I will have the money by Monday. Keep your thugs away from my apartment.', TRUE, 3),
(9, 1, 'SMS', 'Marcus Blackwood', 'Lord Harrington', '3:15 PM', 'Fixed your antique display box latch. Don’t ever say your stepbrother never did anything for you.', FALSE, 3),
(10, 1, 'Internal Memo', 'Security Office', 'Blackwood Staff', '6:00 PM', 'Reminder: Backup generator maintenance scheduled for tomorrow. Emergency circuits run on secondary battery.', FALSE, NULL)
ON DUPLICATE KEY UPDATE content=VALUES(content);

-- Insert Timeline Events
INSERT INTO timeline_events (id, case_id, time_str, title, description, location_name, involved_suspect_id, has_conflict, conflict_details, order_seq) VALUES
(1, 1, '7:00 PM', 'Gala Doors Open', 'Sixty high-profile dignitaries, collectors, and politicians arrive at Blackwood Manor.', 'Grand Foyer', NULL, FALSE, NULL, 1),
(2, 1, '7:30 PM', 'Tears of Cleopatra Displayed & Locked', 'Lord Harrington displays the necklace to select VIPs before locking it into the 2nd-floor master study wall safe.', 'Master Study', 1, FALSE, NULL, 2),
(3, 1, '7:45 PM', 'Elena Vance Secures Safe Key', 'Elena texts her brother confirming the key is secured in her purse and heads to the library.', 'Library', 1, FALSE, NULL, 3),
(4, 1, '8:05 PM', 'Ballroom Piano Recital Ends', 'Pianist completes Chopin solo and begins 30-minute intermission. Ballroom floor empties towards buffet.', 'Grand Ballroom', 2, TRUE, 'Julian claims he listened to piano continuously until 8:30 PM, but pianist was on break!', 4),
(5, 1, '8:14 PM', 'The 3-Minute Blackout Triggers', 'Mansion plunged into darkness due to timed circuit relay tripped in basement. Shattered pocket watch stops at 8:14:15 PM.', 'Mansion Wide', 2, FALSE, NULL, 5),
(6, 1, '8:16 PM', 'Infrared Camera Detects Movement', 'CCTV on 2nd-floor west service stairs detects figure in pinstripe tuxedo hurrying downstairs clutching breast pocket.', 'West Service Staircase', 2, TRUE, 'Julian claims he never left the Ground Floor Ballroom all night!', 6),
(7, 1, '8:18 PM', 'Emergency Power Restored', 'Backup generator kicks in. Lights return across Blackwood Manor.', 'Mansion Wide', NULL, FALSE, NULL, 7),
(8, 1, '8:30 PM', 'The Theft Discovered', 'Lord Harrington escorts an ambassador upstairs to view the necklace; discovers safe unlocked and velvet box empty.', 'Master Study', NULL, FALSE, NULL, 8)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Insert Contradictions
INSERT INTO contradictions (id, case_id, code, title, item_a_label, item_b_label, explanation, implicated_suspect_id, points) VALUES
(
  1,
  1,
  'CON-01',
  'Julian’s Ballroom Alibi vs CCTV 8:16 PM Log',
  'Julian’s Statement: “Never stepped upstairs, stayed by piano 7:45-8:30 PM”',
  'CCTV Frame EVD-PHT-01: Pinstripe tuxedo with "J.S." initials descending service stairs at 8:16 PM',
  'Julian claimed he never stepped foot on the 2nd floor, yet infrared CCTV captures him in his bespoke tuxedo fleeing down the service stairs during the blackout.',
  2,
  15
),
(
  2,
  1,
  'CON-02',
  'Julian’s Piano Recital Claim vs Official Concert Program',
  'Julian’s Statement: “Listening to classical Chopin recital at 8:15 PM”',
  'Pianist Schedule EVD-DOC-05: Pianist concluded at 8:05 PM and was on intermission',
  'Julian fabricated his musical alibi. There was no piano music playing in the Grand Ballroom during the 8:15 PM blackout!',
  2,
  15
),
(
  3,
  1,
  'CON-03',
  'Julian’s Safe Denial vs Smashed Gold Watch Gear',
  'Julian’s Statement: “I wouldn’t know where Reginald keeps his safe”',
  'Physical Clue EVD-OBJ-01: Engraved Patek Philippe gear "J.S." stopped at 8:14 PM beside the safe',
  'Julian claimed he never went near the safe room, but his personalized luxury watch broke right against the study desk during the theft at 8:14 PM.',
  2,
  20
),
(
  4,
  1,
  'CON-04',
  'Elena’s "Lost Key" Excuse vs 7:45 PM SMS',
  'Elena’s Statement: “I lost the safe key earlier in the afternoon”',
  'SMS Record EVD-MSG-03: Elena texts brother at 7:45 PM: "Safe locked, key in my purse"',
  'Elena lied to police out of panic and fear of negligence, concealing that she had the key in her bag all evening.',
  1,
  10
)
ON DUPLICATE KEY UPDATE title=VALUES(title);
