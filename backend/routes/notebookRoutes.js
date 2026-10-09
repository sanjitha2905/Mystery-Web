const express = require('express');
const router = express.Router();
const notebookController = require('../controllers/notebookController');
const { verifyToken } = require('../middleware/auth');

router.get('/case/:caseId', verifyToken, notebookController.getNotes);
router.post('/', verifyToken, notebookController.addNote);
router.delete('/:id', verifyToken, notebookController.deleteNote);

module.exports = router;
