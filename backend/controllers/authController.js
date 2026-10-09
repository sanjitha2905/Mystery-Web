const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'mystery_web_super_secret_detective_key_2026!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email format.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether email already exists (parameterized SQL query)
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into MySQL users table (id, name, email, password, role, created_at)
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), normalizedEmail, hashedPassword, 'user']
    );

    const userId = result.insertId;
    const userPayload = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      role: 'user'
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userPayload
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed. ' + error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email (parameterized SQL query)
    const [rows] = await db.query('SELECT id, name, email, password, role FROM users WHERE email = ?', [normalizedEmail]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      badge_number: `DET-${String(user.id).padStart(4, '0')}`
    };

    // Generate JWT token
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userPayload
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed. ' + error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];

    // Get user stats if scores table exists
    let scores = [];
    try {
      const [scoreRows] = await db.query('SELECT * FROM scores WHERE user_id = ?', [user.id]);
      scores = scoreRows || [];
    } catch (e) {
      // ignore
    }

    const casesCompleted = scores.length;
    const bestScore = scores.reduce((max, s) => s.score > max ? s.score : max, 0);
    const avgAccuracy = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.accuracy_percent, 0) / scores.length)
      : 0;

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        badge_number: `DET-${String(user.id).padStart(4, '0')}`,
        avatar_url: '/avatars/detective-default.png',
        created_at: user.created_at,
        stats: {
          casesCompleted,
          bestScore,
          avgAccuracy,
          totalSubmissions: scores.length
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
