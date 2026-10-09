const express = require('express');
const router = express.Router();
const evidenceController = require('../controllers/evidenceController');
const { verifyToken } = require('../middleware/auth');

router.post('/discover-hidden', verifyToken, evidenceController.discoverHiddenClue);
router.post('/inspect-location', verifyToken, evidenceController.inspectLocation);

module.exports = router;
