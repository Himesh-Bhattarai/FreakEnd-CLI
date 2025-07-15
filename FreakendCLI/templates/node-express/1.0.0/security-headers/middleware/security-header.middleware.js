
const helmet = require('helmet');
const { 
  getSecurityConfig, 
  validateSecurityConfig, 
  logSecurityHeaders 
} = require('../utils/security-header.utils');

/**
 * Security Headers Middleware
 * Applies industry-standard HTTP security headers using helmet
 * with customizable configuration via environment variables
 */
const securityHeadersMiddleware = (req, res, next) => {
  // Check if security headers are enabled
  const isEnabled = process.env.ENABLE_SECURITY_HEADERS === 'true';
  
  if (!isEnabled) {
    logSecurityHeaders('Security headers are disabled via ENABLE_SECURITY_HEADERS');
    return next();
  }

  try {
    // Get security configuration
    const config = getSecurityConfig();
    
    // Validate configuration
    if (!validateSecurityConfig(config)) {
      logSecurityHeaders('Invalid security configuration, using defaults');
    }

    // Apply helmet with custom configuration
    const helmetMiddleware = helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: config.csp.defaultSrc,
          styleSrc: config.csp.styleSrc,
          scriptSrc: config.csp.scriptSrc,
          imgSrc: config.csp.imgSrc,
          connectSrc: config.csp.connectSrc,
          fontSrc: config.csp.fontSrc,
          objectSrc: config.csp.objectSrc,
          mediaSrc: config.csp.mediaSrc,
          frameSrc: config.csp.frameSrc,
          upgradeInsecureRequests: config.csp.upgradeInsecureRequests
        },
        reportOnly: config.csp.reportOnly
      },

      // HTTP Strict Transport Security
      hsts: {
        maxAge: config.hsts.maxAge,
        includeSubDomains: config.hsts.includeSubDomains,
        preload: config.hsts.preload
      },

      // X-Content-Type-Options
      noSniff: config.noSniff,

      // X-Frame-Options
      frameguard: {
        action: config.frameguard.action
      },

      // X-XSS-Protection (deprecated but still useful for older browsers)
      xssFilter: config.xssFilter,

      // Referrer Policy
      referrerPolicy: {
        policy: config.referrerPolicy
      },

      // Permissions Policy (Feature Policy)
      permissionsPolicy: config.permissionsPolicy,

      // Remove X-Powered-By header
      hidePoweredBy: config.hidePoweredBy,

      // Cross-Origin policies
      crossOriginEmbedderPolicy: config.crossOriginEmbedderPolicy,
      crossOriginOpenerPolicy: config.crossOriginOpenerPolicy,
      crossOriginResourcePolicy: config.crossOriginResourcePolicy,

      // DNS Prefetch Control
      dnsPrefetchControl: config.dnsPrefetchControl,

      // Expect-CT (deprecated but still supported)
      expectCt: config.expectCt,

      // Origin Agent Cluster
      originAgentCluster: config.originAgentCluster
    });

    // Apply helmet middleware
    helmetMiddleware(req, res, (err) => {
      if (err) {
        logSecurityHeaders(`Error applying security headers: ${err.message}`);
        return next(err);
      }
      
      // Add custom headers if not already set by helmet
      addCustomHeaders(res, config);
      
      logSecurityHeaders('Security headers applied successfully');
      next();
    });

  } catch (error) {
    logSecurityHeaders(`Error in security headers middleware: ${error.message}`);
    // Continue without security headers in case of error
    next();
  }
};

/**
 * Add custom security headers that aren't handled by helmet
 */
const addCustomHeaders = (res, config) => {
  // Add custom headers only if they don't already exist
  if (!res.getHeader('X-Request-ID')) {
    res.setHeader('X-Request-ID', generateRequestId());
  }
  
  if (config.customHeaders) {
    Object.entries(config.customHeaders).forEach(([key, value]) => {
      if (!res.getHeader(key)) {
        res.setHeader(key, value);
      }
    });
  }
};

/**
 * Generate a unique request ID for tracking
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

module.exports = securityHeadersMiddleware;