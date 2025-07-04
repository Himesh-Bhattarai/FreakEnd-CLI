const express = require('express');
const router = express.Router();
const aiSearchController = require('../controllers/ai-search.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  rateLimitMiddleware,
  validateSearchInput,
  validateItemInput
} = require('../middleware/ai-search.middleware');

// Apply authentication to all routes
router.use(authenticateToken);

// Search routes
router.post('/search', 
  rateLimitMiddleware,
  validateSearchInput,
  aiSearchController.searchItems
);

router.get('/suggestions', 
  rateLimitMiddleware,
  aiSearchController.getSearchSuggestions
);

router.post('/click', 
  rateLimitMiddleware,
  aiSearchController.recordSearchClick
);

// Item management routes
router.post('/items', 
  validateItemInput,
  aiSearchController.addItem
);

router.get('/items', 
  aiSearchController.getUserItems
);

router.put('/items/:id', 
  validateItemInput,
  aiSearchController.updateItem
);

router.delete('/items/:id', 
  aiSearchController.deleteItem
);

// Analytics routes
router.get('/analytics', 
  aiSearchController.getSearchAnalytics
);

module.exports = router;