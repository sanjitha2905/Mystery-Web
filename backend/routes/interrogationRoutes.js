const express = require('express');
const router = express.Router();
const interrogationController = require('../controllers/interrogationController');
const { verifyToken } = require('../middleware/auth');

router.get('/suspect/:suspectId', interrogationController.getSuspectQuestions);
router.post('/ask', verifyToken, interrogationController.askQuestion);

module.exports = router;
