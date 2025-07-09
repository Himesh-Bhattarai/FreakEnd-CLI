const Joi = require('joi');

// Validation schemas
const createUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).trim().required(),
  lastName: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('user', 'admin', 'moderator').default('user'),
  phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  dateOfBirth: Joi.date().max('now').optional(),
  address: Joi.object({
    street: Joi.string().max(100).optional(),
    city: Joi.string().max(50).optional(),
    state: Joi.string().max(50).optional(),
    zipCode: Joi.string().max(20).optional(),
    country: Joi.string().max(50).optional()
  }).optional(),
  preferences: Joi.object({
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      sms: Joi.boolean().default(false)
    }).optional(),
    theme: Joi.string().valid('light', 'dark', 'auto').default('light')
  }).optional()
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).trim().optional(),
  lastName: Joi.string().min(2).max(50).trim().optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  role: Joi.string().valid('user', 'admin', 'moderator').optional(),
  isActive: Joi.boolean().optional(),
  phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  dateOfBirth: Joi.date().max('now').optional(),
  profileImage: Joi.string().uri().optional(),
  address: Joi.object({
    street: Joi.string().max(100).optional(),
    city: Joi.string().max(50).optional(),
    state: Joi.string().max(50).optional(),
    zipCode: Joi.string().max(20).optional(),
    country: Joi.string().max(50).optional()
  }).optional(),
  preferences: Joi.object({
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional()
    }).optional(),
    theme: Joi.string().valid('light', 'dark', 'auto').optional()
  }).optional()
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required()
});

// Validation functions
const validateCreateUser = (data) => {
  return createUserSchema.validate(data, { abortEarly: false });
};

const validateUpdateUser = (data) => {
  return updateUserSchema.validate(data, { abortEarly: false });
};

const validateLoginUser = (data) => {
  return loginUserSchema.validate(data, { abortEarly: false });
};

// Data sanitization function
const sanitizeUserData = (data) => {
  const sanitized = { ...data };
  
  // Remove any potentially dangerous fields
  delete sanitized.__proto__;
  delete sanitized.constructor;
  delete sanitized._id;
  delete sanitized.createdAt;
  delete sanitized.updatedAt;
  delete sanitized.lastLogin;
  
  // Trim string values
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim();
    }
  });
  
  return sanitized;
};

// Response formatting utilities
const formatSuccessResponse = (message, data = null) => {
  return {
    success: true,
    message,
    data
  };
};

const formatErrorResponse = (message, errors = null) => {
  return {
    success: false,
    message,
    errors
  };
};

// Pagination helper
const getPaginationData = (page, limit, total) => {
  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    currentPage: pageNumber,
    pageSize,
    totalPages,
    totalRecords: total,
    hasNextPage: pageNumber < totalPages,
    hasPrevPage: pageNumber > 1
  };
};

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateLoginUser,
  sanitizeUserData,
  formatSuccessResponse,
  formatErrorResponse,
  getPaginationData
};