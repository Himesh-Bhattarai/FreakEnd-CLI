const { body, validationResult } = require('express-validator');

// Validation middleware for payment intent
const validatePaymentIntent = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for subscription
const validateSubscription = [
  body('priceId')
    .notEmpty()
    .withMessage('Price ID is required'),
  body('planName')
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage('Plan name is required and cannot exceed 100 characters'),
  body('planType')
    .isIn(['monthly', 'yearly', 'weekly'])
    .withMessage('Plan type must be monthly, yearly, or weekly'),
  body('trialDays')
    .optional()
    .isInt({ min: 0, max: 365 })
    .withMessage('Trial days must be between 0 and 365'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for refund
const validateRefund = [
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Refund amount must be greater than 0'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validatePaymentIntent,
  validateSubscription,
  validateRefund
};