const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');
const fs = require('fs');

/**
 * OpenAPI 3.0 Configuration for Freakend CLI
 * Dynamically scans all feature routes and generates comprehensive documentation
 */

// Base OpenAPI definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Freakend API',
    version: '1.0.0',
    description: 'Auto-generated API documentation for Freakend CLI backend',
    contact: {
      name: 'API Support',
      email: 'support@freakend.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: process.env.API_STAGING_URL || 'https://staging-api.freakend.com',
      description: 'Staging server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer Token Authentication'
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API Key Authentication'
      }
    },
    schemas: {
      // Common response schemas
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully'
          },
          data: {
            type: 'object'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: 'Error message'
          },
          code: {
            type: 'string',
            example: 'ERROR_CODE'
          },
          details: {
            type: 'object'
          }
        }
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: 'Validation failed'
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'email'
                },
                message: {
                  type: 'string',
                  example: 'Email is required'
                }
              }
            }
          }
        }
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1
          },
          limit: {
            type: 'integer',
            example: 10
          },
          total: {
            type: 'integer',
            example: 100
          },
          totalPages: {
            type: 'integer',
            example: 10
          },
          hasNext: {
            type: 'boolean',
            example: true
          },
          hasPrev: {
            type: 'boolean',
            example: false
          }
        }
      },
      // User-related schemas
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '64a7b8c9d1e2f3g4h5i6j7k8'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          username: {
            type: 'string',
            example: 'johndoe'
          },
          firstName: {
            type: 'string',
            example: 'John'
          },
          lastName: {
            type: 'string',
            example: 'Doe'
          },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'moderator'],
            example: 'user'
          },
          isActive: {
            type: 'boolean',
            example: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00Z'
          }
        }
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          expiresIn: {
            type: 'integer',
            example: 3600,
            description: 'Token expiration time in seconds'
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'password123'
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'password123'
          },
          firstName: {
            type: 'string',
            example: 'John'
          },
          lastName: {
            type: 'string',
            example: 'Doe'
          },
          username: {
            type: 'string',
            example: 'johndoe'
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      },
      ForbiddenError: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationError'
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      }
    },
    parameters: {
      PageParam: {
        name: 'page',
        in: 'query',
        description: 'Page number',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1
        }
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10
        }
      },
      SortParam: {
        name: 'sort',
        in: 'query',
        description: 'Sort field and direction (e.g., createdAt:desc)',
        required: false,
        schema: {
          type: 'string',
          example: 'createdAt:desc'
        }
      },
      SearchParam: {
        name: 'search',
        in: 'query',
        description: 'Search query',
        required: false,
        schema: {
          type: 'string'
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization'
    },
    {
      name: 'Users',
      description: 'User management operations'
    },
    {
      name: 'Documentation',
      description: 'API documentation endpoints'
    }
  ]
};

/**
 * Function to dynamically discover route files
 */
function discoverRouteFiles() {
  const routeFiles = [];
  const templatesDir = path.join(__dirname, '..');
  
  try {
    // Read all feature directories
    const features = fs.readdirSync(templatesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Scan each feature's routes directory
    features.forEach(feature => {
      const routesDir = path.join(templatesDir, feature, 'routes');
      if (fs.existsSync(routesDir)) {
        const routeFilesInFeature = fs.readdirSync(routesDir)
          .filter(file => file.endsWith('.routes.js'))
          .map(file => path.join(routesDir, file));
        
        routeFiles.push(...routeFilesInFeature);
      }
    });
    
    // Also include the current swagger routes
    routeFiles.push(path.join(__dirname, 'swagger.routes.js'));
    
  } catch (error) {
    console.warn('Warning: Could not discover route files automatically:', error.message);
    // Fallback to common patterns
    routeFiles.push(
      path.join(__dirname, '../*/routes/*.routes.js'),
      path.join(__dirname, 'swagger.routes.js')
    );
  }
  
  return routeFiles;
}

// Swagger JSDoc options
const swaggerOptions = {
  definition: swaggerDefinition,
  apis: discoverRouteFiles(), // Dynamic route discovery
};

// Generate swagger specification
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI options
const swaggerUIOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      // Add custom headers or modify requests
      req.headers['X-Requested-With'] = 'SwaggerUI';
      return req;
    }
  }
};

module.exports = {
  swaggerSpec,
  swaggerOptions: swaggerUIOptions,
  swaggerDefinition
};