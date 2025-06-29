const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const VALID_REACTION_TYPES = ['like', 'dislike', '❤️', '🔥', '😢', '😂', '👍', '👎', '😍', '😮'];

const validateReaction = {
  // Validation rules for adding/updating reactions
  validateReactionInput: [
    body('contentId')
      .notEmpty()
      .withMessage('Content ID is required')
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid content ID format');
        }
        return true;
      }),
    
    body('reactionType')
      .notEmpty()
      .withMessage('Reaction type is required')
      .isIn(VALID_REACTION_TYPES)
      .withMessage(`Reaction type must be one of: ${VALID_REACTION_TYPES.join(', ')}`)
      .trim()
      .escape(),

    // Middleware to handle validation errors
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(error => ({
            field: error.param,
            message: error.msg,
            value: error.value
          }))
        });
      }
      next();
    }
  ],

  // Validation rules for removing reactions
  validateRemoveReaction: [
    body('contentId')
      .notEmpty()
      .withMessage('Content ID is required')
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid content ID format');
        }
        return true;
      }),

    // Middleware to handle validation errors
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(error => ({
            field: error.param,
            message: error.msg,
            value: error.value
          }))
        });
      }
      next();
    }
  ],

  // Custom sanitization middleware
  sanitizeReactionInput: (req, res, next) => {
    if (req.body.reactionType) {
      req.body.reactionType = req.body.reactionType.trim();
    }
    if (req.body.contentId) {
      req.body.contentId = req.body.contentId.trim();
    }
    next();
  }
};

module.exports = validateReaction;