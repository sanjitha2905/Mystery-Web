const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedData() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'mystery_web',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 5
  });

  console.log('🔧 Adjusting legacy NOT NULL constraints...');
  const relaxes = [
    'ALTER TABLE cases MODIFY COLUMN description TEXT NULL',
    'ALTER TABLE messages MODIFY COLUMN message TEXT NULL',
    'ALTER TABLE messages MODIFY COLUMN message_time DATETIME NULL',
    'ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS involved_suspect_id INT NULL',
    'ALTER TABLE timeline_events MODIFY COLUMN event_time TIME NULL',
    'ALTER TABLE timeline_events MODIFY COLUMN event_title VARCHAR(200) NULL',
    'ALTER TABLE suspects MODIFY COLUMN image_url VARCHAR(500) NULL',
    'ALTER TABLE evidence MODIFY COLUMN evidence_type ENUM("photo","document","message","object","cctv","other") NULL'
  ];

  for (const r of relaxes) {
    try {
      await pool.query(r);
    } catch (e) {
      // ignore
    }
  }

  // Also ensure involved_suspect_id exists in timeline_events
  const [cols] = await pool.query(
    'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "timeline_events" AND COLUMN_NAME = "involved_suspect_id"',
    [process.env.DB_NAME || 'mystery_web']
  );
  if (cols.length === 0) {
    await pool.query('ALTER TABLE timeline_events ADD COLUMN involved_suspect_id INT NULL');
  }

  const fullSql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8').replace(/\r/g, '');
  const seedStartIndex = fullSql.indexOf('SEED DATA FOR CASE #01');
  const seedSql = fullSql.substring(seedStartIndex);
  const stmts = seedSql.split(/;\s*\n/);

  for (const s of stmts) {
    const clean = s.trim();
    if (!clean) continue;
    if (clean.startsWith('--') && !clean.includes('INSERT') && !clean.includes('UPDATE')) continue;
    if (clean.startsWith('SEED DATA FOR CASE')) continue;

    if (clean.toUpperCase().includes('INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE, BADGE_NUMBER)')) {
      try {
        await pool.query(`INSERT INTO users (name, email, password, role) VALUES 
          ('Chief Inspector Sterling', 'admin@mysteryweb.com', '$2a$10$wT0lP.v68w6wDk2wK8fEie8cWbT6sH1yA8vJ6mQZ3R4K7rK3QvN5i', 'admin'),
          ('Detective Alex Vance', 'detective@mysteryweb.com', '$2a$10$wT0lP.v68w6wDk2wK8fEie8cWbT6sH1yA8vJ6mQZ3R4K7rK3QvN5i', 'user')
          ON DUPLICATE KEY UPDATE name=VALUES(name)`);
        console.log('✅ Seed users added');
      } catch (e) {
        console.warn('Seed users error:', e.message);
      }
      continue;
    }

    try {
      await pool.query(clean);
      console.log('✅ Executed:', clean.substring(0, 35));
    } catch (e) {
      console.error('❌ Error executing:', clean.substring(0, 35), '->', e.message);
    }
  }

  const [cases] = await pool.query('SELECT count(*) as cnt FROM cases');
  const [suspects] = await pool.query('SELECT count(*) as cnt FROM suspects');
  const [evidence] = await pool.query('SELECT count(*) as cnt FROM evidence');
  const [users] = await pool.query('SELECT count(*) as cnt FROM users');
  console.log(`\n🎉 MySQL populated successfully!`);
  console.log(`Cases: ${cases[0].cnt}, Suspects: ${suspects[0].cnt}, Evidence: ${evidence[0].cnt}, Users: ${users[0].cnt}`);

  await pool.end();
}

seedData().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
