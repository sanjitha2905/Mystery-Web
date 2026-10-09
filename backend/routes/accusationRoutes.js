const express = require('express');
const router = express.Router();
const accusationController = require('../controllers/accusationController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, accusationController.submitAccusation);
router.get('/history/:caseId', verifyToken, accusationController.getHistory);

module.exports = router;
