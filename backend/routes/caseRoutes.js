const express = require('express');
const router = express.Router();
const casesController = require('../controllers/casesController');
const { verifyToken } = require('../middleware/auth');

// Optional auth for public preview, but extracts user if token provided
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'mystery_web_super_secret_detective_key_2026!';
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      req.user = decoded;
    } catch (e) {
      // ignore
    }
  }
  next();
};

router.get('/', optionalAuth, casesController.getAllCases);
router.get('/:id', optionalAuth, casesController.getCaseDetails);
router.put('/:id/progress', verifyToken, casesController.saveProgress);

module.exports = router;
