const express = require('express');
const router = express.Router();
const crudController = require('../controllers/crud.controller');
const { authenticateToken, authorize } = require('../middleware/crud.middleware');

// Public routes
router.post('/register', crudController.createUser);
router.post('/login', crudController.loginUser);

// Protected routes
router.use(authenticateToken); // Apply authentication to all routes below

// User profile routes
router.get('/profile', crudController.getCurrentUser);

// Admin routes
router.get('/', authorize(['admin', 'moderator']), crudController.getAllUsers);
router.get('/:id', authorize(['admin', 'moderator']), crudController.getUserById);
router.put('/:id', authorize(['admin']), crudController.updateUser);
router.delete('/:id', authorize(['admin']), crudController.deleteUser);
router.delete('/:id/permanent', authorize(['admin']), crudController.permanentDeleteUser);

module.exports = router;