const express = require('express');
const router = express.Router();
const contradictionController = require('../controllers/contradictionController');
const { verifyToken } = require('../middleware/auth');

router.get('/case/:caseId', contradictionController.getContradictions);
router.post('/check', verifyToken, contradictionController.checkContradiction);

module.exports = router;
