// templates/node-express/1.0.0/graphql/utils/validation.js
const validator = require('validator');

/**
 * Validation schemas for different input types
 */
const validationSchemas = {
  createUser: {
    username: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_]+$/,
      message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores'
    },
    email: {
      required: true,
      type: 'email',
      message: 'Please provide a valid email address'
    },
    password: {
      required: true,
      type: 'string',
      minLength: 6,
      maxLength: 128,
      message: 'Password must be at least 6 characters long'
    },
    firstName: {
      required: false,
      type: 'string',
      maxLength: 50,
      message: 'First name cannot exceed 50 characters'
    },
    lastName: {
      required: false,
      type: 'string',
      maxLength: 50,
      message: 'Last name cannot exceed 50 characters'
    },
    bio: {
      required: false,
      type: 'string',
      maxLength: 500,
      message: 'Bio cannot exceed 500 characters'
    }
  },

  updateUser: {
    username: {
      required: false,
      type: 'string',
      minLength: 3,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_]+$/,
      message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores'
    },
    email: {
      required: false,
      type: 'email',
      message: 'Please provide a valid email address'
    },
    firstName: {
      required: false,
      type: 'string',
      maxLength: 50,
      message: 'First name cannot exceed 50 characters'
    },
    lastName: {
      required: false,
      type: 'string',
      maxLength: 50,
      message: 'Last name cannot exceed 50 characters'
    },
    bio: {
      required: false,
      type: 'string',
      maxLength: 500,
      message: 'Bio cannot exceed 500 characters'
    },
    avatar: {
      required: false,
      type: 'url',
      message: 'Avatar must be a valid URL'
    }
  },

  createPost: {
    title: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 200,
      message: 'Title must be between 3 and 200 characters'
    },
    content: {
      required: true,
      type: 'string',
      minLength: 10,
      message: 'Content must be at least 10 characters long'
    },
    excerpt: {
      required: false,
      type: 'string',
      maxLength: 300,
      message: 'Excerpt cannot exceed 300 characters'
    },
    status: {
      required: false,
      type: 'enum',
      values: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      message: 'Status must be DRAFT, PUBLISHED, or ARCHIVED'
    },
    featuredImage: {
      required: false,
      type: 'url',
      message: 'Featured image must be a valid URL'
    },
    tags: {
      required: false,
      type: 'array',
      maxItems: 10,
      itemValidation: {
        type: 'string',
        maxLength: 30,
        pattern: /^[a-zA-Z0-9\-_\s]+$/
      },
      message: 'Maximum 10 tags allowed, each tag must be under 30 characters'
    }
  },

  updatePost: {
    title: {
      required: false,
      type: 'string',
      minLength: 3,
      maxLength: 200,
      message: 'Title must be between 3 and 200 characters'
    },
    content: {
      required: false,
      type: 'string',
      minLength: 10,
      message: 'Content must be at least 10 characters long'
    },
    excerpt: {
      required: false,
      type: 'string',
      maxLength: 300,
      message: 'Excerpt cannot exceed 300 characters'
    },
    status: {
      required: false,
      type: 'enum',
      values: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      message: 'Status must be DRAFT, PUBLISHED, or ARCHIVED'
    },
    featuredImage: {
      required: false,
      type: 'url',
      message: 'Featured image must be a valid URL'
    },
    tags: {
      required: false,
      type: 'array',
      maxItems: 10,
      itemValidation: {
        type: 'string',
        maxLength: 30,
        pattern: /^[a-zA-Z0-9\-_\s]+$/
      },
      message: 'Maximum 10 tags allowed, each tag must be under 30 characters'
    }
  },

  createComment: {
    content: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 1000,
      message: 'Comment must be between 1 and 1000 characters'
    },
    postId: {
      required: true,
      type: 'mongoId',
      message: 'Valid post ID is required'
    }
  }
};

/**
 * Custom validators
 */
const customValidators = {
  /**
   * Validate MongoDB ObjectId
   * @param {String} value - Value to validate
   * @returns {Boolean} Is valid ObjectId
   */
  isMongoId(value) {
    return /^[0-9a-fA-F]{24}$/.test(value);
  },

  /**
   * Validate URL with specific image extensions
   * @param {String} value - URL to validate
   * @returns {Boolean} Is valid image URL
   */
  isImageUrl(value) {
    if (!validator.isURL(value)) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(value);
  },

  /**
   * Validate password strength
   * @param {String} password - Password to validate
   * @returns {Object} Validation result
   */
  validatePasswordStrength(password) {
    const result = {
      isValid: true,
      score: 0,
      feedback: []
    };

    // Length check
    if (password.length < 6) {
      result.isValid = false;
      result.feedback.push('Password must be at least 6 characters long');
    } else if (password.length >= 8) {
      result.score += 1;
    }

    // Character variety checks
    if (/[a-z]/.test(password)) result.score += 1;
    if (/[A-Z]/.test(password)) result.score += 1;
    if (/[0-9]/.test(password)) result.score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) result.score += 1;

    // Common patterns to avoid
    const commonPatterns = [
      /(.)\1{2,}/, // Repeated characters
      /123456|654321|qwerty|password|admin/i // Common sequences
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        result.feedback.push('Avoid common patterns and repeated characters');
        result.score = Math.max(0, result.score - 1);
        break;
      }
    }

    // Strength feedback
    if (result.score < 2) {
      result.feedback.push('Password is weak');
    } else if (result.score < 4) {
      result.feedback.push('Password is moderate');
    } else {
      result.feedback.push('Password is strong');
    }

    return result;
  },

  /**
   * Validate social media URLs
   * @param {String} platform - Platform name
   * @param {String} url - URL to validate
   * @returns {Boolean} Is valid platform URL
   */
  validateSocialUrl(platform, url) {
    if (!validator.isURL(url)) return false;

    const patterns = {
      twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/,
      github: /^https?:\/\/(www\.)?github\.com\/.+/,
      linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/.+/,
      website: /^https?:\/\/.+/
    };

    return patterns[platform] ? patterns[platform].test(url) : patterns.website.test(url);
  }
};

/**
 * Main validation function
 * @param {String} schemaName - Name of validation schema
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
function validateInput(schemaName, data) {
  const schema = validationSchemas[schemaName];
  
  if (!schema) {
    throw new Error(`Validation schema '${schemaName}' not found`);
  }

  const result = {
    isValid: true,
    errors: {}
  };

  // Validate each field in the schema
  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = data[fieldName];
    const fieldErrors = [];

    // Required field check
    if (rules.required && (value === undefined || value === null || value === '')) {
      fieldErrors.push(`${fieldName} is required`);
      result.isValid = false;
      continue;
    }

    // Skip validation for optional empty fields
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') {
          fieldErrors.push(`${fieldName} must be a string`);
          break;
        }

        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
          fieldErrors.push(`${fieldName} must be at least ${rules.minLength} characters long`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          fieldErrors.push(`${fieldName} cannot exceed ${rules.maxLength} characters`);
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
          fieldErrors.push(rules.message || `${fieldName} format is invalid`);
        }
        break;

      case 'email':
        if (!validator.isEmail(value)) {
          fieldErrors.push(rules.message || `${fieldName} must be a valid email address`);
        }
        break;

      case 'url':
        if (!validator.isURL(value)) {
          fieldErrors.push(rules.message || `${fieldName} must be a valid URL`);
        }
        break;

      case 'mongoId':
        if (!customValidators.isMongoId(value)) {
          fieldErrors.push(rules.message || `${fieldName} must be a valid ID`);
        }
        break;

      case 'enum':
        if (!rules.values.includes(value)) {
          fieldErrors.push(rules.message || `${fieldName} must be one of: ${rules.values.join(', ')}`);
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          fieldErrors.push(`${fieldName} must be an array`);
          break;
        }

        if (rules.maxItems && value.length > rules.maxItems) {
          fieldErrors.push(`${fieldName} cannot have more than ${rules.maxItems} items`);
        }

        // Validate array items
        if (rules.itemValidation) {
          value.forEach((item, index) => {
            const itemResult = validateInput(`${schemaName}_${fieldName}_item`, {
              item: item
            });
            
            if (!itemResult.isValid) {
              fieldErrors.push(`${fieldName}[${index}]: ${Object.values(itemResult.errors).flat().join(', ')}`);
            }
          });
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          fieldErrors.push(`${fieldName} must be a valid number`);
          break;
        }

        if (rules.min !== undefined && value < rules.min) {
          fieldErrors.push(`${fieldName} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          fieldErrors.push(`${fieldName} cannot exceed ${rules.max}`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          fieldErrors.push(`${fieldName} must be a boolean value`);
        }
        break;
    }

    // Custom validation functions
    if (rules.customValidator && typeof rules.customValidator === 'function') {
      const customResult = rules.customValidator(value, data);
      if (!customResult.isValid) {
        fieldErrors.push(...customResult.errors);
      }
    }

    if (fieldErrors.length > 0) {
      result.errors[fieldName] = fieldErrors;
      result.isValid = false;
    }
  }

  return result;
}

/**
 * Sanitize input data
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
function sanitizeInput(data) {
  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Trim whitespace
      sanitized[key] = value.trim();
      
      // Escape HTML entities
      sanitized[key] = validator.escape(sanitized[key]);
    } else if (Array.isArray(value)) {
      // Sanitize array items
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? validator.escape(item.trim()) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize input
 * @param {String} schemaName - Validation schema name
 * @param {Object} data - Input data
 * @returns {Object} Result with validation status and sanitized data
 */
function validateAndSanitize(schemaName, data) {
  // First sanitize the input
  const sanitizedData = sanitizeInput(data);
  
  // Then validate
  const validationResult = validateInput(schemaName, sanitizedData);
  
  return {
    ...validationResult,
    data: sanitizedData
  };
}

/**
 * Create a GraphQL input validator middleware
 * @param {String} schemaName - Validation schema name
 * @returns {Function} Validation middleware
 */
function createValidator(schemaName) {
  return (input) => {
    const result = validateAndSanitize(schemaName, input);
    
    if (!result.isValid) {
      const errorMessages = Object.entries(result.errors)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('; ');
      
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    
    return result.data;
  };
}

module.exports = {
  validateInput,
  sanitizeInput,
  validateAndSanitize,
  customValidators,
  createValidator,
  validationSchemas
};