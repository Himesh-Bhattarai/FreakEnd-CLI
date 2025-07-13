const express = require('express');
const router = express.Router();
const SeederController = require('../controllers/seeder.controllers');
const {
  authenticateToken,
  requireAdmin,
  validateSeederEnvironment,
  checkDatabaseConnection,
  sanitizeSeederInput,
  confirmationRequired
} = require('../middleware/seeder.middleware');

// Apply common middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);
router.use(validateSeederEnvironment);
router.use(checkDatabaseConnection);
router.use(sanitizeSeederInput);

// Seed specific collections
router.post('/users', SeederController.seedUsers);
router.post('/products', SeederController.seedProducts);
router.post('/categories', SeederController.seedCategories);

// Seed all collections
router.post('/all', SeederController.seedAll);

// Reset database (requires confirmation)
router.post('/reset', confirmationRequired, SeederController.resetDatabase);

// Get seeder statistics
router.get('/stats', SeederController.getSeederStats);

module.exports = router;