const express = require('express');
const { body, param, query } = require('express-validator');
const chatbotController = require('../controllers/chatbot.controller');
const authenticateToken = require('../middleware/authenticateToken');
const { rateLimitMiddleware } = require('../middleware/chatbot.middleware');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Create conversation
router.post('/conversations',
  rateLimitMiddleware,
  [
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    body('settings.model')
      .optional()
      .isIn(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'])
      .withMessage('Invalid model selection'),
    body('settings.temperature')
      .optional()
      .isFloat({ min: 0, max: 2 })
      .withMessage('Temperature must be between 0 and 2'),
    body('settings.maxTokens')
      .optional()
      .isInt({ min: 1, max: 2000 })
      .withMessage('Max tokens must be between 1 and 2000')
  ],
  chatbotController.createConversation
);

// Get conversations
router.get('/conversations',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('active')
      .optional()
      .isIn(['true', 'false', 'all'])
      .withMessage('Active must be true, false, or all')
  ],
  chatbotController.getConversations
);

// Get conversation messages
router.get('/conversations/:conversationId/messages',
  [
    param('conversationId')
      .isMongoId()
      .withMessage('Invalid conversation ID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  chatbotController.getMessages
);

// Send message
router.post('/conversations/:conversationId/messages',
  rateLimitMiddleware,
  [
    param('conversationId')
      .isMongoId()
      .withMessage('Invalid conversation ID'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 10000 })
      .withMessage('Message content must be between 1 and 10000 characters')
  ],
  chatbotController.sendMessage
);

// Update conversation
router.patch('/conversations/:conversationId',
  [
    param('conversationId')
      .isMongoId()
      .withMessage('Invalid conversation ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    body('settings.model')
      .optional()
      .isIn(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'])
      .withMessage('Invalid model selection'),
    body('settings.temperature')
      .optional()
      .isFloat({ min: 0, max: 2 })
      .withMessage('Temperature must be between 0 and 2'),
    body('settings.maxTokens')
      .optional()
      .isInt({ min: 1, max: 2000 })
      .withMessage('Max tokens must be between 1 and 2000'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ],
  chatbotController.updateConversation
);

// Delete conversation
router.delete('/conversations/:conversationId',
  [
    param('conversationId')
      .isMongoId()
      .withMessage('Invalid conversation ID')
  ],
  chatbotController.deleteConversation
);

// Get statistics
router.get('/stats', chatbotController.getStats);

module.exports = router;