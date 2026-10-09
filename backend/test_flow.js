const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Comprehensive Mystery Web Integration Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Health Endpoint
  console.log('--- TEST 1: Backend System Health ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  assert(health.status === 'ONLINE', 'System is ONLINE');
  assert(health.databaseMode === 'MySQL Database', 'Connected to MySQL Database');

  // TEST 2: Signup Validation
  console.log('\n--- TEST 2: User Registration Validation ---');
  // Missing fields
  const r1 = await (await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', email: '', password: '' })
  })).json();
  assert(r1.success === false, 'Rejects empty registration fields');

  // Short password
  const r2 = await (await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Detective', email: 'det@test.com', password: '123' })
  })).json();
  assert(r2.success === false && r2.message.includes('6 characters'), 'Rejects password shorter than 6 chars');

  // Invalid email
  const r3 = await (await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Detective', email: 'notanemail', password: 'password123' })
  })).json();
  assert(r3.success === false && r3.message.includes('valid email'), 'Rejects invalid email format');

  // TEST 3: Successful Registration
  console.log('\n--- TEST 3: Successful Registration Flow ---');
  const testEmail = `detective_${Date.now()}@mysteryweb.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Detective Sanjitha',
      email: testEmail,
      password: 'secretPassword123'
    })
  });
  const regData = await regRes.json();
  assert(regRes.status === 201, 'Status code is 201 Created');
  assert(regData.success === true, 'Success is true');
  assert(regData.message === 'Registration successful', 'Returns "Registration successful" message');
  assert(!!regData.token, 'Issues JWT token');
  assert(regData.user.name === 'Detective Sanjitha', 'User object contains correct name');

  // TEST 4: Database Hash Verification
  console.log('\n--- TEST 4: MySQL Database Integrity & Password Hashing ---');
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'mystery_web',
    port: process.env.DB_PORT || 3306
  });
  const [dbUserRows] = await db.query('SELECT * FROM users WHERE email = ?', [testEmail]);
  assert(dbUserRows.length === 1, 'User persisted in MySQL users table');
  const storedUser = dbUserRows[0];
  assert(!storedUser.password.includes('secretPassword123'), 'Plain-text password is NOT stored');
  assert(storedUser.password.startsWith('$2a$') || storedUser.password.startsWith('$2b$'), 'Password is valid bcrypt hash');
  await db.end();

  // TEST 5: Duplicate Registration Check
  console.log('\n--- TEST 5: Duplicate Email Rejection ---');
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Imposter',
      email: testEmail,
      password: 'anotherPassword'
    })
  });
  const dupData = await dupRes.json();
  assert(dupRes.status === 409, 'Status code is 409 Conflict');
  assert(dupData.success === false, 'Duplicate registration refused');

  // TEST 6: Login Flow
  console.log('\n--- TEST 6: Login Flow (Invalid & Valid Credentials) ---');
  // Invalid password
  const failLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'wrongPassword'
    })
  });
  const failLoginData = await failLoginRes.json();
  assert(failLoginRes.status === 401, 'Invalid login returns 401 Unauthorized');
  assert(failLoginData.message === 'Invalid email or password.', 'Returns "Invalid email or password."');

  // Valid login
  const okLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'secretPassword123'
    })
  });
  const okLoginData = await okLoginRes.json();
  assert(okLoginRes.status === 200, 'Valid login returns 200 OK');
  assert(okLoginData.success === true, 'Login success is true');
  assert(okLoginData.message === 'Login successful', 'Returns "Login successful" message');
  assert(!!okLoginData.token, 'Token returned on login');
  assert(okLoginData.user.email === testEmail, 'User payload matches email');

  const authToken = okLoginData.token;

  // TEST 7: Protected Route Authentication
  console.log('\n--- TEST 7: Protected Route Token Verification ---');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const meData = await meRes.json();
  assert(meRes.status === 200, '/api/auth/me returns 200 with Bearer token');
  assert(meData.user.name === 'Detective Sanjitha', 'Decoded user profile matches registered user');

  // TEST 8: Cases API
  console.log('\n--- TEST 8: Cases & Investigation APIs ---');
  const casesRes = await fetch(`${BASE_URL}/cases`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const casesData = await casesRes.json();
  assert(casesData.success === true, 'Get all cases succeeds');
  assert(casesData.cases.length >= 1, 'At least 1 case active');
  const case1 = casesData.cases[0];
  assert(case1.title === 'THE MISSING NECKLACE', 'Case #01 is THE MISSING NECKLACE');

  // Case 1 Details
  const case1DetailsRes = await fetch(`${BASE_URL}/cases/1`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const case1Details = await case1DetailsRes.json();
  assert(case1Details.success === true, 'Get Case #01 details succeeds');
  assert(case1Details.suspects.length === 4, 'Case #01 contains 4 suspects');
  assert(case1Details.evidence.length === 15, 'Case #01 contains 15 evidence items');
  assert(case1Details.contradictions.length === 4, 'Case #01 contains 4 contradictions');

  // TEST 9: Accusation Submission
  console.log('\n--- TEST 9: Final Accusation Submission & Deliberation Scoring ---');
  const accuseRes = await fetch(`${BASE_URL}/accuse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      caseId: 1,
      accusedSuspectId: 2, // Julian Sterling
      deductionText: 'Julian Sterling orchestrated the power blackout, entered the study with duplicate keycard 3, swapped the Tears of Cleopatra with high-refractive zirconium fake, and smashed his Patek watch at 8:14 PM.',
      selectedEvidenceCodes: ['EVD-PHT-01', 'EVD-OBJ-01', 'EVD-OBJ-02', 'EVD-DOC-05']
    })
  });
  const accuseData = await accuseRes.json();
  assert(accuseData.success === true, 'Accusation submitted successfully');
  assert(accuseData.isCorrect === true, 'Julian Sterling verified as guilty culprit');
  assert(accuseData.score >= 50, `Scored expected detective score: ${accuseData.score}/100`);
  assert(!!accuseData.rankTitle, `Awarded rank: ${accuseData.rankTitle}`);

  // Summary
  console.log(`\n========================================`);
  console.log(`🎉 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
