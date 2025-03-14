const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/notes', authMiddleware, notesController.getNotes);
router.post('/notes', authMiddleware, notesController.addNote);
router.delete('/notes', authMiddleware, notesController.deleteNote);

module.exports = router;