const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec, swaggerOptions } = require('./swagger.config.js');
const { validateEnvironment } = require('./swagger.utils.js');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Documentation
 *   description: API documentation endpoints
 */

/**
 * Swagger UI Setup Route
 * Serves interactive API documentation
 */
router.use('/api-docs', (req, res, next) => {
  // Environment validation
  if (!validateEnvironment()) {
    return res.status(404).json({
      error: 'API documentation is not available in production'
    });
  }
  
  // Set custom CSS for better UI
  const customCss = `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #3b82f6; }
    .swagger-ui .scheme-container { background: #f8fafc; }
  `;
  
  swaggerUi.setup(swaggerSpec, {
    ...swaggerOptions,
    customCss,
    customSiteTitle: 'Freakend API Documentation',
    customfavIcon: '/favicon.ico'
  })(req, res, next);
});

/**
 * @swagger
 * /api-docs:
 *   get:
 *     tags: [Documentation]
 *     summary: Get API documentation
 *     description: Serves interactive Swagger UI for API documentation
 *     responses:
 *       200:
 *         description: API documentation page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       404:
 *         description: Documentation not available in production
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "API documentation is not available in production"
 */
router.get('/api-docs', swaggerUi.serve);

/**
 * @swagger
 * /api-docs/swagger.json:
 *   get:
 *     tags: [Documentation]
 *     summary: Get OpenAPI specification
 *     description: Returns the raw OpenAPI 3.0 specification in JSON format
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Specification not available in production
 */
router.get('/api-docs/swagger.json', (req, res) => {
  if (!validateEnvironment()) {
    return res.status(404).json({
      error: 'API specification is not available in production'
    });
  }
  
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * Health check endpoint for Swagger service
 */
router.get('/api-docs/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'swagger-docs',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;