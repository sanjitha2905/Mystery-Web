const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function prepareSchema() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'mystery_web',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 5
  });

  const dbName = process.env.DB_NAME || 'mystery_web';

  async function addCol(table, col, def) {
    const [rows] = await pool.query(
      'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [dbName, table, col]
    );
    if (rows.length === 0) {
      await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col}\` ${def}`);
      console.log(`✅ Added ${table}.${col}`);
    }
  }

  console.log('🔄 Checking database table columns...');

  // cases
  await addCol('cases', 'conclusion_type', "VARCHAR(50) DEFAULT 'criminal'");
  await addCol('cases', 'expected_conclusion_key', 'VARCHAR(100) NULL');

  // contradictions
  await addCol('contradictions', 'item_a_code', 'VARCHAR(50) NULL');
  await addCol('contradictions', 'item_b_code', 'VARCHAR(50) NULL');

  // case_notes
  await addCol('case_notes', 'title', 'VARCHAR(255) NULL');
  await addCol('case_notes', 'content', 'TEXT NULL');
  await addCol('case_notes', 'tag', "VARCHAR(50) DEFAULT 'General'");
  try {
    await pool.query('ALTER TABLE case_notes MODIFY COLUMN note TEXT NULL');
  } catch (e) {
    console.warn('Note column adjust:', e.message);
  }

  // accusations
  await addCol('accusations', 'conclusion_key', 'VARCHAR(100) NULL');
  await addCol('accusations', 'conclusion_type', "VARCHAR(50) DEFAULT 'criminal'");
  try {
    await pool.query('ALTER TABLE accusations MODIFY COLUMN accused_suspect_id INT NULL');
  } catch (e) {
    console.warn('Accused suspect id adjust:', e.message);
  }

  // investigation_progress
  await addCol('investigation_progress', 'questions_asked', 'JSON NULL');
  await addCol('investigation_progress', 'contradictions_discovered', 'JSON NULL');
  await addCol('investigation_progress', 'board_connections', 'JSON NULL');
  await addCol('investigation_progress', 'locations_explored', 'JSON NULL');
  await addCol('investigation_progress', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  try {
    await pool.query('ALTER TABLE investigation_progress MODIFY COLUMN clues_found JSON NULL');
    await pool.query('ALTER TABLE investigation_progress MODIFY COLUMN hidden_clues_found JSON NULL');
    await pool.query('ALTER TABLE investigation_progress MODIFY COLUMN status VARCHAR(50) DEFAULT "In Progress"');
    console.log('✅ Adjusted investigation_progress column types to JSON and VARCHAR');
  } catch (e) {
    console.warn('investigation_progress adjust:', e.message);
  }

  // suspects
  await addCol('suspects', 'known_location', 'VARCHAR(255) NULL');
  await addCol('suspects', 'avatar_url', 'VARCHAR(255) NULL');
  await addCol('suspects', 'is_culprit', 'BOOLEAN DEFAULT FALSE');
  await addCol('suspects', 'is_red_herring', 'BOOLEAN DEFAULT FALSE');
  await addCol('suspects', 'suspicion_level', 'INT DEFAULT 50');

  try {
    await pool.query('ALTER TABLE evidence MODIFY COLUMN evidence_type VARCHAR(50) NULL');
  } catch (e) {}
  await addCol('evidence', 'detailed_content', 'TEXT NULL');
  await addCol('evidence', 'discovery_condition', "VARCHAR(255) DEFAULT 'Immediate'");
  await addCol('evidence', 'hidden_hint', 'VARCHAR(255) NULL');
  await addCol('evidence', 'red_herring_explanation', 'TEXT NULL');
  await addCol('evidence', 'related_location_id', 'INT NULL');
  await addCol('evidence', 'image_url', 'VARCHAR(255) NULL');
  await addCol('evidence', 'interactive_type', "VARCHAR(50) DEFAULT 'standard'");
  await addCol('evidence', 'secret_content', 'TEXT NULL');
  await addCol('evidence', 'points', 'INT DEFAULT 10');

  console.log('🎉 Schema preparation finished!');
  await pool.end();
}

if (require.main === module) {
  prepareSchema().catch(err => {
    console.error('Fatal schema prep error:', err);
    process.exit(1);
  });
}

module.exports = { prepareSchema };
