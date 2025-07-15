const express = require('express');
const searchController = require('../controllers/search.controllers');
const {
  authenticateToken,
  requireAdmin,
  validateSearchRequest,
  searchRateLimit
} = require('../middleware/search.middleware');

const router = express.Router();

// Apply rate limiting to all search routes
router.use(searchRateLimit);

// Get available search resources
router.get('/resources', authenticateToken, searchController.getResources);

// Search specific resource
router.get(
  '/:resource',
  authenticateToken,
  validateSearchRequest,
  searchController.search
);

// Get search suggestions
router.get(
  '/:resource/suggestions',
  authenticateToken,
  validateSearchRequest,
  searchController.getSuggestions
);

// Admin-only routes
router.get(
  '/admin/:resource',
  authenticateToken,
  requireAdmin,
  validateSearchRequest,
  searchController.search
);

module.exports = router;
