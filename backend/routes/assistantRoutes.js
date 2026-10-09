const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');
const { verifyToken } = require('../middleware/auth');

router.post('/hint', verifyToken, assistantController.askAssistant);

module.exports = router;
