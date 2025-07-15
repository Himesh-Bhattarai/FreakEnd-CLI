// ==============================================================================
// FREAKEND CLI - SECURITY HEADERS FEATURE
// ==============================================================================

// FOLDER STRUCTURE:
// template/node-express/1.0.0/security-header/
// ├── middleware/
// │   └── security-header.middleware.js
// ├── utils/
// │   └── security-header.utils.js
// ├── tests/
// │   └── security-header.test.js
// ├── .env.example
// └── README.md

// ==============================================================================
// FILE: middleware/security-header.middleware.js
// ==============================================================================

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

// ==============================================================================
// FILE: utils/security-header.utils.js
// ==============================================================================

require('dotenv').config();

/**
 * Get security configuration from environment variables with fallback defaults
 */
const getSecurityConfig = () => {
  return {
    // Content Security Policy
    csp: {
      defaultSrc: parseCSPDirective(process.env.CSP_DEFAULT_SRC, ["'self'"]),
      styleSrc: parseCSPDirective(process.env.CSP_STYLE_SRC, ["'self'", "'unsafe-inline'"]),
      scriptSrc: parseCSPDirective(process.env.CSP_SCRIPT_SRC, ["'self'"]),
      imgSrc: parseCSPDirective(process.env.CSP_IMG_SRC, ["'self'", "data:", "https:"]),
      connectSrc: parseCSPDirective(process.env.CSP_CONNECT_SRC, ["'self'"]),
      fontSrc: parseCSPDirective(process.env.CSP_FONT_SRC, ["'self'", "https:", "data:"]),
      objectSrc: parseCSPDirective(process.env.CSP_OBJECT_SRC, ["'none'"]),
      mediaSrc: parseCSPDirective(process.env.CSP_MEDIA_SRC, ["'self'"]),
      frameSrc: parseCSPDirective(process.env.CSP_FRAME_SRC, ["'none'"]),
      upgradeInsecureRequests: process.env.CSP_UPGRADE_INSECURE_REQUESTS === 'true',
      reportOnly: process.env.CSP_REPORT_ONLY === 'true'
    },

    // HTTP Strict Transport Security
    hsts: {
      maxAge: parseInt(process.env.HSTS_MAX_AGE) || 31536000, // 1 year
      includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS !== 'false',
      preload: process.env.HSTS_PRELOAD === 'true'
    },

    // X-Content-Type-Options
    noSniff: process.env.X_CONTENT_TYPE_OPTIONS !== 'false',

    // X-Frame-Options
    frameguard: {
      action: process.env.X_FRAME_OPTIONS || 'deny'
    },

    // X-XSS-Protection
    xssFilter: process.env.X_XSS_PROTECTION !== 'false',

    // Referrer Policy
    referrerPolicy: process.env.REFERRER_POLICY || 'strict-origin-when-cross-origin',

    // Permissions Policy
    permissionsPolicy: parsePermissionsPolicy(process.env.PERMISSIONS_POLICY),

    // Remove X-Powered-By
    hidePoweredBy: process.env.HIDE_POWERED_BY !== 'false',

    // Cross-Origin policies
    crossOriginEmbedderPolicy: process.env.CROSS_ORIGIN_EMBEDDER_POLICY !== 'false',
    crossOriginOpenerPolicy: process.env.CROSS_ORIGIN_OPENER_POLICY !== 'false',
    crossOriginResourcePolicy: process.env.CROSS_ORIGIN_RESOURCE_POLICY !== 'false',

    // DNS Prefetch Control
    dnsPrefetchControl: process.env.DNS_PREFETCH_CONTROL !== 'false',

    // Expect-CT
    expectCt: process.env.EXPECT_CT === 'true',

    // Origin Agent Cluster
    originAgentCluster: process.env.ORIGIN_AGENT_CLUSTER !== 'false',

    // Custom headers
    customHeaders: parseCustomHeaders(process.env.CUSTOM_SECURITY_HEADERS)
  };
};

/**
 * Parse CSP directive from environment variable
 */
const parseCSPDirective = (envValue, defaultValue) => {
  if (!envValue) return defaultValue;
  
  try {
    // Support both comma-separated and space-separated values
    const values = envValue.includes(',') 
      ? envValue.split(',').map(v => v.trim())
      : envValue.split(' ').map(v => v.trim());
    
    return values.filter(v => v.length > 0);
  } catch (error) {
    logSecurityHeaders(`Error parsing CSP directive: ${error.message}`);
    return defaultValue;
  }
};

/**
 * Parse Permissions Policy from environment variable
 */
const parsePermissionsPolicy = (envValue) => {
  if (!envValue) {
    return {
      camera: ['self'],
      microphone: ['self'],
      geolocation: ['self'],
      accelerometer: [],
      gyroscope: [],
      magnetometer: [],
      payment: ['self'],
      usb: []
    };
  }

  try {
    return JSON.parse(envValue);
  } catch (error) {
    logSecurityHeaders(`Error parsing Permissions Policy: ${error.message}`);
    return {};
  }
};

/**
 * Parse custom headers from environment variable
 */
const parseCustomHeaders = (envValue) => {
  if (!envValue) return {};

  try {
    return JSON.parse(envValue);
  } catch (error) {
    logSecurityHeaders(`Error parsing custom headers: ${error.message}`);
    return {};
  }
};

/**
 * Validate security configuration
 */
const validateSecurityConfig = (config) => {
  try {
    // Validate HSTS max age
    if (config.hsts.maxAge < 0) {
      logSecurityHeaders('Invalid HSTS max age, must be positive');
      return false;
    }

    // Validate frame options
    const validFrameActions = ['deny', 'sameorigin', 'allow-from'];
    if (!validFrameActions.includes(config.frameguard.action)) {
      logSecurityHeaders('Invalid frame guard action');
      return false;
    }

    // Validate referrer policy
    const validReferrerPolicies = [
      'no-referrer',
      'no-referrer-when-downgrade',
      'origin',
      'origin-when-cross-origin',
      'same-origin',
      'strict-origin',
      'strict-origin-when-cross-origin',
      'unsafe-url'
    ];
    if (!validReferrerPolicies.includes(config.referrerPolicy)) {
      logSecurityHeaders('Invalid referrer policy');
      return false;
    }

    return true;
  } catch (error) {
    logSecurityHeaders(`Error validating security config: ${error.message}`);
    return false;
  }
};

/**
 * Log security headers messages
 */
const logSecurityHeaders = (message) => {
  if (process.env.NODE_ENV !== 'test') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [SECURITY-HEADERS] ${message}`);
  }
};

module.exports = {
  getSecurityConfig,
  validateSecurityConfig,
  logSecurityHeaders,
  parseCSPDirective,
  parsePermissionsPolicy,
  parseCustomHeaders
};
