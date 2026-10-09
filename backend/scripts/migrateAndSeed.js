const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function addColumnIfNotExists(pool, table, column, definition) {
  const dbName = process.env.DB_NAME || 'mystery_web';
  const [rows] = await pool.query(
    'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [dbName, table, column]
  );
  if (rows.length === 0) {
    try {
      await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      console.log(`Added column ${table}.${column}`);
    } catch (e) {
      console.warn(`Error adding ${table}.${column}:`, e.message);
    }
  }
}

async function migrateAndSeed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'mystery_web',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 5
  });

  console.log('🔄 Checking and adding forensic columns to existing tables...');

  // cases table columns
  await addColumnIfNotExists(pool, 'cases', 'scenario', 'TEXT');
  await addColumnIfNotExists(pool, 'cases', 'victim_name', 'VARCHAR(100)');
  await addColumnIfNotExists(pool, 'cases', 'crime_location', 'VARCHAR(100)');
  await addColumnIfNotExists(pool, 'cases', 'crime_time', 'VARCHAR(50)');
  await addColumnIfNotExists(pool, 'cases', 'stolen_item', 'VARCHAR(100)');
  await addColumnIfNotExists(pool, 'cases', 'estimated_time', 'VARCHAR(50) DEFAULT "25-35 mins"');
  await addColumnIfNotExists(pool, 'cases', 'status', 'VARCHAR(50) DEFAULT "Active"');
  await addColumnIfNotExists(pool, 'cases', 'culprit_suspect_id', 'INT NULL');
  await addColumnIfNotExists(pool, 'cases', 'motive_summary', 'TEXT');
  await addColumnIfNotExists(pool, 'cases', 'solution_breakdown', 'TEXT');

  // suspects table columns
  await addColumnIfNotExists(pool, 'suspects', 'known_location', 'VARCHAR(255)');
  await addColumnIfNotExists(pool, 'suspects', 'avatar_url', 'VARCHAR(255)');
  await addColumnIfNotExists(pool, 'suspects', 'is_culprit', 'BOOLEAN DEFAULT FALSE');
  await addColumnIfNotExists(pool, 'suspects', 'is_red_herring', 'BOOLEAN DEFAULT FALSE');
  await addColumnIfNotExists(pool, 'suspects', 'suspicion_level', 'INT DEFAULT 50');

  // locations table columns
  await addColumnIfNotExists(pool, 'locations', 'code', 'VARCHAR(50)');
  await addColumnIfNotExists(pool, 'locations', 'floor', 'VARCHAR(50)');
  await addColumnIfNotExists(pool, 'locations', 'search_findings', 'TEXT');
  await addColumnIfNotExists(pool, 'locations', 'second_inspection_finding', 'TEXT');
  await addColumnIfNotExists(pool, 'locations', 'hidden_clue_code', 'VARCHAR(50) NULL');
  await addColumnIfNotExists(pool, 'locations', 'icon_name', 'VARCHAR(50) DEFAULT "compass"');

  // evidence table columns
  await addColumnIfNotExists(pool, 'evidence', 'code', 'VARCHAR(50)');
  await addColumnIfNotExists(pool, 'evidence', 'detailed_content', 'TEXT');
  await addColumnIfNotExists(pool, 'evidence', 'type', 'ENUM("photograph", "document", "message", "object") NOT NULL DEFAULT "document"');
  await addColumnIfNotExists(pool, 'evidence', 'discovery_condition', 'VARCHAR(255) DEFAULT "Immediate"');
  await addColumnIfNotExists(pool, 'evidence', 'hidden_hint', 'VARCHAR(255) NULL');
  await addColumnIfNotExists(pool, 'evidence', 'red_herring_explanation', 'TEXT NULL');
  await addColumnIfNotExists(pool, 'evidence', 'related_location_id', 'INT NULL');
  await addColumnIfNotExists(pool, 'evidence', 'image_url', 'VARCHAR(255) NULL');
  await addColumnIfNotExists(pool, 'evidence', 'interactive_type', 'VARCHAR(50) DEFAULT "standard"');
  await addColumnIfNotExists(pool, 'evidence', 'secret_content', 'TEXT NULL');
  await addColumnIfNotExists(pool, 'evidence', 'points', 'INT DEFAULT 10');

  // messages table columns
  await addColumnIfNotExists(pool, 'messages', 'platform', 'VARCHAR(50) DEFAULT "SMS"');
  await addColumnIfNotExists(pool, 'messages', 'timestamp_str', 'VARCHAR(50)');
  await addColumnIfNotExists(pool, 'messages', 'content', 'TEXT');
  await addColumnIfNotExists(pool, 'messages', 'is_suspicious', 'BOOLEAN DEFAULT FALSE');
  await addColumnIfNotExists(pool, 'messages', 'related_suspect_id', 'INT NULL');

  // timeline_events table columns
  await addColumnIfNotExists(pool, 'timeline_events', 'time_str', 'VARCHAR(50)');
  await addColumnIfNotExists(pool, 'timeline_events', 'title', 'VARCHAR(255)');
  await addColumnIfNotExists(pool, 'timeline_events', 'location_name', 'VARCHAR(100)');
  await addColumnIfNotExists(pool, 'timeline_events', 'has_conflict', 'BOOLEAN DEFAULT FALSE');
  await addColumnIfNotExists(pool, 'timeline_events', 'conflict_details', 'TEXT NULL');
  await addColumnIfNotExists(pool, 'timeline_events', 'order_seq', 'INT DEFAULT 0');

  // Ensure supplementary tables exist
  await pool.query(`CREATE TABLE IF NOT EXISTS suspect_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    suspect_id INT NOT NULL,
    question_text VARCHAR(255) NOT NULL,
    answer_text TEXT NOT NULL,
    reveals_evidence_code VARCHAR(50) NULL,
    contradiction_hint VARCHAR(255) NULL,
    order_seq INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suspect_id) REFERENCES suspects(id) ON DELETE CASCADE
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS contradictions (
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
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS scores (
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
  )`);

  // Check if cases table has data
  const [caseRows] = await pool.query('SELECT count(*) as count FROM cases');
  if (caseRows[0].count === 0) {
    console.log('🔄 Seeding Case #01 and related forensics into MySQL...');
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const fullSql = fs.readFileSync(schemaPath, 'utf8');
      const stmts = fullSql
        .split(/;\s*$/m)
        .map(s => s.trim())
        .filter(s => {
          if (!s || s.startsWith('--')) return false;
          const u = s.toUpperCase();
          if (u.startsWith('CREATE DATABASE') || u.startsWith('USE') || u.startsWith('CREATE TABLE')) return false;
          if (u.includes('INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE, BADGE_NUMBER)')) return false;
          return true;
        });

      for (const stmt of stmts) {
        try {
          await pool.query(stmt);
        } catch (e) {
          console.warn('Seed stmt error:', stmt.substring(0, 35), '->', e.message);
        }
      }
    }
  }

  const [cases] = await pool.query('SELECT id, title FROM cases');
  const [suspects] = await pool.query('SELECT id, name FROM suspects');
  const [evidence] = await pool.query('SELECT id, code, title FROM evidence');
  console.log(`✅ Database ready: ${cases.length} cases, ${suspects.length} suspects, ${evidence.length} evidence items.`);

  await pool.end();
}

migrateAndSeed().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
