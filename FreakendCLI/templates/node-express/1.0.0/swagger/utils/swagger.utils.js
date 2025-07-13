const fs = require('fs');
const path = require('path');

/**
 * Utility functions for Swagger documentation
 */

/**
 * Validates if Swagger should be enabled based on environment
 * @returns {boolean} True if swagger should be enabled
 */
function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const swaggerEnabled = process.env.SWAGGER_ENABLED !== 'false';
  
  // Disable in production unless explicitly enabled
  if (env === 'production' && !swaggerEnabled) {
    return false;
  }
  
  return true;
}

/**
 * Generates JSDoc template for a route
 * @param {Object} options - Route configuration
 * @param {string} options.method - HTTP method (GET, POST, etc.)
 * @param {string} options.path - Route path
 * @param {string} options.tag - Swagger tag
 * @param {string} options.summary - Route summary
 * @param {string} options.description - Route description
 * @param {boolean} options.requiresAuth - Whether route requires authentication
 * @param {Object} options.requestBody - Request body schema
 * @param {Object} options.responses - Response schemas
 * @returns {string} JSDoc comment string
 */
function generateRouteJSDoc(options) {
  const {
    method,
    path,
    tag,
    summary,
    description,
    requiresAuth = false,
    requestBody = null,
    responses = {}
  } = options;

  let jsdoc = `/**
 * @swagger
 * ${path}:
 *   ${method.toLowerCase()}:
 *     tags: [${tag}]
 *     summary: ${summary}
 *     description: ${description}`;

  if (requiresAuth) {
    jsdoc += `
 *     security:
 *       - bearerAuth: []`;
  }

  if (requestBody) {
    jsdoc += `
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${requestBody}'`;
  }

  jsdoc += `
 *     responses:`;

  // Add default responses if none provided
  if (Object.keys(responses).length === 0) {
    responses['200'] = 'SuccessResponse';
    responses['400'] = 'ValidationError';
    responses['500'] = 'InternalServerError';
    
    if (requiresAuth) {
      responses['401'] = 'UnauthorizedError';
    }
  }

  Object.entries(responses).forEach(([code, schema]) => {
    jsdoc += `
 *       ${code}:
 *         $ref: '#/components/responses/${schema}'`;
  });

  jsdoc += `
 */`;

  return jsdoc;
}

/**
 * Generates a complete schema definition for Swagger
 * @param {string} schemaName - Name of the schema
 * @param {Object} properties - Schema properties
 * @param {Array} required - Required fields
 * @returns {Object} Swagger schema object
 */
function generateSwaggerSchema(schemaName, properties, required = []) {
  return {
    [schemaName]: {
      type: 'object',
      required,
      properties
    }
  };
}

/**
 * Extracts API routes from a feature directory
 * @param {string} featurePath - Path to feature directory
 * @returns {Array} Array of route information
 */
function extractRoutesFromFeature(featurePath) {
  const routes = [];
  const routesDir = path.join(featurePath, 'routes');
  
  if (!fs.existsSync(routesDir)) {
    return routes;
  }
  
  try {
    const routeFiles = fs.readdirSync(routesDir)
      .filter(file => file.endsWith('.routes.js'));
    
    routeFiles.forEach(file => {
      const filePath = path.join(routesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract route definitions using regex
      const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
      let match;
      
      while ((match = routeRegex.exec(content)) !== null) {
        routes.push({
          method: match[1].toUpperCase(),
          path: match[2],
          file: file,
          feature: path.basename(featurePath)
        });
      }
    });
  } catch (error) {
    console.warn(`Warning: Could not extract routes from ${featurePath}:`, error.message);
  }
  
  return routes;
}

/**
 * Validates JWT token format (for documentation purposes)
 * @param {string} token - JWT token
 * @returns {boolean} True if token format is valid
 */
function isValidJWTFormat(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Basic JWT format validation (3 parts separated by dots)
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

/**
 * Formats error response for Swagger examples
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Object} Formatted error response
 */
function formatErrorResponse(message, code = 'GENERIC_ERROR', details = null) {
  return {
    success: false,
    error: message,
    code,
    ...(details && { details })
  };
}

/**
 * Formats success response for Swagger examples
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted success response
 */
function formatSuccessResponse(data, message = 'Operation completed successfully') {
  return {
    success: true,
    message,
    data
  };
}

/**
 * Generates pagination metadata for Swagger examples
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
function generatePaginationMeta(page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

/**
 * Sanitizes schema name for Swagger compatibility
 * @param {string} name - Original name
 * @returns {string} Sanitized name
 */
function sanitizeSchemaName(name) {
  return name
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

/**
 * Checks if a route requires authentication based on middleware
 * @param {string} routeContent - Route file content
 * @param {string} routePath - Route path
 * @returns {boolean} True if route requires auth
 */
function requiresAuthentication(routeContent, routePath) {
  // Check for common authentication middleware patterns
  const authPatterns = [
    'authenticateToken',
    'requireAuth',
    'verifyToken',
    'checkAuth',
    'authMiddleware'
  ];
  
  // Look for middleware usage before the route
  const routeIndex = routeContent.indexOf(routePath);
  if (routeIndex === -1) return false;
  
  const beforeRoute = routeContent.substring(0, routeIndex);
  const lines = beforeRoute.split('\n').reverse();
  
  // Check the last few lines before the route definition
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (authPatterns.some(pattern => line.includes(pattern))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generates OpenAPI parameter object
 * @param {string} name - Parameter name
 * @param {string} location - Parameter location (query, path, header)
 * @param {string} type - Parameter type
 * @param {boolean} required - Whether parameter is required
 * @param {string} description - Parameter description
 * @returns {Object} OpenAPI parameter object
 */
function generateParameter(name, location, type, required = false, description = '') {
  return {
    name,
    in: location,
    required,
    description,
    schema: {
      type
    }
  };
}

module.exports = {
  validateEnvironment,
  generateRouteJSDoc,
  generateSwaggerSchema,
  extractRoutesFromFeature,
  isValidJWTFormat,
  formatErrorResponse,
  formatSuccessResponse,
  generatePaginationMeta,
  sanitizeSchemaName,
  requiresAuthentication,
  generateParameter
};