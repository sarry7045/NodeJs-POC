const express = require('express');
const router = express.Router();
const preferencesController = require('../controllers/preferencesController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/preferences', authMiddleware, preferencesController.getPreferences);
router.post('/preferences', authMiddleware, preferencesController.addPreference);
router.delete('/preferences', authMiddleware, preferencesController.deletePreference);

module.exports = router;