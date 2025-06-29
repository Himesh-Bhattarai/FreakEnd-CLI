const express = require('express');
const router = express.Router();
const reactionController = require('../controllers/reaction.controller');
const authenticateToken = require('../middleware/authenticateToken');
const validateReaction = require('../middleware/validateReaction');
const rateLimiter = require('../middleware/rateLimiter');

// Apply rate limiting to all reaction routes
router.use(rateLimiter.reactionLimiter);

// Apply authentication to all routes
router.use(authenticateToken);

// POST /reaction - Add or update reaction
router.post('/', validateReaction.validateReactionInput, reactionController.addOrUpdateReaction);

// GET /reaction/:contentId - Get reaction stats for content
router.get('/:contentId', reactionController.getReactionStats);

// DELETE /reaction - Remove user's reaction
router.delete('/', validateReaction.validateRemoveReaction, reactionController.removeReaction);

// GET /reaction/user/me - Get current user's reactions (bonus)
router.get('/user/me', reactionController.getUserReactions);

module.exports = router;