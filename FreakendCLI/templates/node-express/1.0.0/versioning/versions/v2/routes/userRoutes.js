const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../../../middleware/auth');

// All routes are protected with JWT authentication
router.use(authenticateToken);

// User routes (same as V1)
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);

// V2 specific routes
router.patch('/users/:id/status', userController.updateUserStatus);

module.exports = router;