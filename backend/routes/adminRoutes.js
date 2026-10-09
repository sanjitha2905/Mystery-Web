const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.get('/overview', verifyToken, adminController.getAdminOverview);
router.post('/cases', verifyToken, adminController.createCase);
router.post('/evidence', verifyToken, adminController.addEvidence);

module.exports = router;
