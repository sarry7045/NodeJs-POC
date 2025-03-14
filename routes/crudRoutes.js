const express = require('express');
const router = express.Router();
const crudController = require('../controllers/crudController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/users', authMiddleware, crudController.createUser);
router.get('/users', authMiddleware, crudController.getUsers);
router.put('/users', authMiddleware, crudController.updateUser);
router.delete('/users', authMiddleware, crudController.deleteUser);

module.exports = router;