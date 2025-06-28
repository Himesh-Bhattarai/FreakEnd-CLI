const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Profile update validation rules
const profileUpdateValidation = [
  param('id')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid user ID format');
      }
      return true;
    }),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters')
    .escape(),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
    .escape(),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters')
    .escape(),
  
  body('socialLinks.linkedin')
    .optional()
    .matches(/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/)
    .withMessage('Invalid LinkedIn URL format'),
  
  body('socialLinks.github')
    .optional()
    .matches(/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/)
    .withMessage('Invalid GitHub URL format'),
  
  body('socialLinks.twitter')
    .optional()
    .matches(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/)
    .withMessage('Invalid Twitter/X URL format'),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

// Check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Prevent overposting by filtering allowed fields
const filterAllowedFields = (req, res, next) => {
  const allowedFields = ['name', 'bio', 'location', 'avatar', 'socialLinks'];
  const filteredBody = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      filteredBody[field] = req.body[field];
    }
  });
  
  req.body = filteredBody;
  next();
};

// Check if user can modify this profile
const checkProfileOwnership = (req, res, next) => {
  const profileId = req.params.id;
  const userId = req.user._id.toString();
  
  if (profileId !== userId && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own profile'
    });
  }
  
  next();
};

module.exports = {
  profileUpdateValidation,
  handleValidationErrors,
  filterAllowedFields,
  checkProfileOwnership
};