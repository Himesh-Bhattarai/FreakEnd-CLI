const { body, validationResult } = require('express-validator');
const EmailTemplate = require('../models/EmailTemplate');

// Email validation rules
const emailValidationRules = {
  sendCustomEmail: [
    body('to')
      .isEmail()
      .withMessage('Valid email address is required')
      .normalizeEmail(),
    body('subject')
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('Subject must be between 1 and 200 characters')
      .trim(),
    body('html')
      .optional()
      .isLength({ max: 10000 })
      .withMessage('HTML content too long'),
    body('text')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Text content too long'),
    body('attachments')
      .optional()
      .isArray()
      .withMessage('Attachments must be an array')
  ],

  sendBulkEmail: [
    body('recipients')
      .isArray({ min: 1 })
      .withMessage('Recipients array is required and must not be empty'),
    body('recipients.*')
      .isEmail()
      .withMessage('All recipients must be valid email addresses')
      .normalizeEmail(),
    body('subject')
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('Subject must be between 1 and 200 characters')
      .trim(),
    body('html')
      .optional()
      .isLength({ max: 10000 })
      .withMessage('HTML content too long'),
    body('text')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Text content too long')
  ],

  sendVerificationEmail: [
    body('email')
      .isEmail()
      .withMessage('Valid email address is required')
      .normalizeEmail(),
    body('userName')
      .notEmpty()
      .withMessage('User name is required')
      .trim()
  ],

  sendPasswordResetEmail: [
    body('email')
      .isEmail()
      .withMessage('Valid email address is required')
      .normalizeEmail(),
    body('userName')
      .notEmpty()
      .withMessage('User name is required')
      .trim()
  ],

  createTemplate: [
    body('name')
      .notEmpty()
      .withMessage('Template name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Template name must be between 1 and 100 characters')
      .trim(),
    body('subject')
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('Subject must be between 1 and 200 characters')
      .trim(),
    body('htmlContent')
      .notEmpty()
      .withMessage('HTML content is required')
      .isLength({ max: 10000 })
      .withMessage('HTML content too long'),
    body('textContent')
      .notEmpty()
      .withMessage('Text content is required')
      .isLength({ max: 5000 })
      .withMessage('Text content too long'),
    body('variables')
      .optional()
      .isArray()
      .withMessage('Variables must be an array')
  ],

  sendTemplateEmail: [
    body('to')
      .isEmail()
      .withMessage('Valid email address is required')
      .normalizeEmail(),
    body('templateName')
      .notEmpty()
      .withMessage('Template name is required')
      .trim(),
    body('variables')
      .optional()
      .isObject()
      .withMessage('Variables must be an object')
  ]
};

// Validation middleware
const validateEmail = (validationType) => {
  return [
    ...emailValidationRules[validationType],
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
};

// Template existence validation
const validateTemplateExists = async (req, res, next) => {
  try {
    const { templateName } = req.body;
    const template = await EmailTemplate.findOne({ 
      name: templateName, 
      isActive: true 
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found or inactive'
      });
    }
    
    req.template = template;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error validating template',
      error: error.message
    });
  }
};

module.exports = {
  validateEmail,
  validateTemplateExists
};