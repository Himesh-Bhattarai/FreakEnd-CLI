// templates/node-express/1.0.0/graphql/utils/errorHandling.js
const { 
  AuthenticationError, 
  ForbiddenError, 
  UserInputError,
  ApolloError
} = require('apollo-server-express');

/**
 * Custom error types for better error handling
 */
class ValidationError extends ApolloError {
  constructor(message, validationErrors = {}) {
    super(message, 'VALIDATION_ERROR', { validationErrors });
    this.name = 'ValidationError';
  }
}

class NotFoundError extends ApolloError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

class ConflictError extends ApolloError {
  constructor(message = 'Resource already exists') {
    super(message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

class RateLimitError extends ApolloError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

class DatabaseError extends ApolloError {
  constructor(message = 'Database operation failed') {
    super(message, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

/**
 * Error code mappings for consistent error responses
 */
const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Operations
  OPERATION_FAILED: 'OPERATION_FAILED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Generic
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

/**
 * Format GraphQL errors for consistent client responses
 * @param {Error} error - Original error
 * @returns {Object} Formatted error
 */
function formatError(error) {
  // Log error for debugging (in production, use proper logging service)
  console.error('GraphQL Error:', {
    message: error.message,
    code: error.extensions?.code,
    path: error.path,
    source: error.source?.body,
    positions: error.positions,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    // Hide sensitive error details
    if (error.message.includes('MongoError') || 
        error.message.includes('E11000') ||
        error.extensions?.code === 'INTERNAL_ERROR') {
      return {
        message: 'An internal error occurred',
        code: ERROR_CODES.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
        path: error.path
      };
    }
  }

  // Handle specific error types
  const formattedError = {
    message: error.message,
    code: error.extensions?.code || ERROR_CODES.INTERNAL_ERROR,
    timestamp: new Date().toISOString(),
    path: error.path
  };

  // Add additional context for specific errors
  if (error.extensions?.validationErrors) {
    formattedError.validationErrors = error.extensions.validationErrors;
  }

  if (error.extensions?.exception?.stacktrace && process.env.NODE_ENV === 'development') {
    formattedError.stacktrace = error.extensions.exception.stacktrace;
  }

  return formattedError;
}

/**
 * Handle MongoDB errors and convert to GraphQL errors
 * @param {Error} error - MongoDB error
 * @returns {Error} GraphQL error
 */
function handleMongoError(error) {
  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const value = error.keyValue[field];
    
    return new ConflictError(
      `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`
    );
  }

  // Validation error
  if (error.name === 'ValidationError') {
    const validationErrors = {};
    
    Object.keys(error.errors).forEach(key => {
      validationErrors[key] = error.errors[key].message;
    });
    
    return new ValidationError('Validation failed', validationErrors);
  }

  // Cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return new UserInputError(`Invalid ${error.path}: ${error.value}`);
  }

  // Connection errors
  if (error.name === 'MongoNetworkError' || 
      error.name === 'MongoTimeoutError') {
    return new DatabaseError('Database connection failed');
  }

  // Generic database error
  return new DatabaseError('Database operation failed');
}

/**
 * Handle JWT errors
 * @param {Error} error - JWT error
 * @returns {Error} GraphQL error
 */
function handleJWTError(error) {
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token has expired');
  }
  
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  
  if (error.name === 'NotBeforeError') {
    return new AuthenticationError('Token not active');
  }
  
  return new AuthenticationError('Authentication failed');
}

/**
 * Centralized error handler
 * @param {Error} error - Original error
 * @param {String} operation - Operation being performed
 * @returns {Error} Handled error
 */
function handleError(error, operation = 'operation') {
  // If already a GraphQL error, return as-is
  if (error instanceof AuthenticationError ||
      error instanceof ForbiddenError ||
      error instanceof UserInputError ||
      error instanceof ApolloError) {
    return error;
  }

  // Handle specific error types
  if (error.name && error.name.includes('Mongo')) {
    return handleMongoError(error);
  }

  if (error.name && error.name.includes('JsonWebToken')) {
    return handleJWTError(error);
  }

  // Handle validation errors
  if (error.message && error.message.includes('validation')) {
    return new ValidationError(error.message);
  }

  // Handle network/timeout errors
  if (error.code === 'ECONNREFUSED' || 
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND') {
    return new ApolloError(
      'Service temporarily unavailable',
      ERROR_CODES.SERVICE_UNAVAILABLE
    );
  }

  // Generic error handling
  console.error(`Unhandled error in ${operation}:`, error);
  
  return new ApolloError(
    process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : error.message,
    ERROR_CODES.INTERNAL_ERROR
  );
}

/**
 * Create an error handler wrapper for resolvers
 * @param {Function} resolver - GraphQL resolver function
 * @param {String} operationName - Name of the operation
 * @returns {Function} Wrapped resolver with error handling
 */
function withErrorHandling(resolver, operationName) {
  return async (parent, args, context, info) => {
    try {
      return await resolver(parent, args, context, info);
    } catch (error) {
      throw handleError(error, operationName);
    }
  };
}

/**
 * Validation error helper
 * @param {String} message - Error message
 * @param {Object} validationErrors - Detailed validation errors
 * @returns {ValidationError} Validation error instance
 */
function createValidationError(message, validationErrors = {}) {
  return new ValidationError(message, validationErrors);
}

/**
 * Authentication error helper
 * @param {String} message - Error message
 * @returns {AuthenticationError} Authentication error instance
 */
function createAuthError(message = 'Authentication required') {
  return new AuthenticationError(message);
}

/**
 * Authorization error helper
 * @param {String} message - Error message
 * @returns {ForbiddenError} Forbidden error instance
 */
function createForbiddenError(message = 'Access denied') {
  return new ForbiddenError(message);
}

/**
 * Not found error helper
 * @param {String} resource - Resource type
 * @returns {NotFoundError} Not found error instance
 */
function createNotFoundError(resource = 'Resource') {
  return new NotFoundError(resource);
}

/**
 * Conflict error helper
 * @param {String} message - Error message
 * @returns {ConflictError} Conflict error instance
 */
function createConflictError(message = 'Resource already exists') {
  return new ConflictError(message);
}

/**
 * Rate limit error helper
 * @param {String} message - Error message
 * @returns {RateLimitError} Rate limit error instance
 */
function createRateLimitError(message = 'Too many requests') {
  return new RateLimitError(message);
}

/**
 * Error response helper for mutations
 * @param {Boolean} success - Operation success status
 * @param {String} message - Response message
 * @param {Object} data - Additional data
 * @returns {Object} Standardized response
 */
function createResponse(success, message, data = null) {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Success response helper
 * @param {String} message - Success message
 * @param {Object} data - Response data
 * @returns {Object} Success response
 */
function createSuccessResponse(message, data = null) {
  return createResponse(true, message, data);
}

/**
 * Error response helper
 * @param {String} message - Error message
 * @param {Object} errors - Detailed errors
 * @returns {Object} Error response
 */
function createErrorResponse(message, errors = null) {
  return {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  // Error classes
  ValidationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  
  // Constants
  ERROR_CODES,
  
  // Main functions
  formatError,
  handleError,
  withErrorHandling,
  
  // Error handlers
  handleMongoError,
  handleJWTError,
  
  // Helper functions
  createValidationError,
  createAuthError,
  createForbiddenError,
  createNotFoundError,
  createConflictError,
  createRateLimitError,
  
  // Response helpers
  createResponse,
  createSuccessResponse,
  createErrorResponse
};