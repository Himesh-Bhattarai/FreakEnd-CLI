const AuditLog = require('../models/auditlog.models');
const { sanitizeData, getClientIp, determineActionFromRequest } = require('../utils/auditlog.utils');

// Middleware to automatically log requests
const auditLogger = (options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Store original res.json to capture response
    const originalJson = res.json;
    let responseData = null;
    
    res.json = function(data) {
      responseData = data;
      return originalJson.call(this, data);
    };
    
    // Continue with request
    next();
    
    // Log after response is sent
    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        const action = determineActionFromRequest(req);
        
        // Skip logging for certain routes if specified
        if (options.skipRoutes && options.skipRoutes.includes(req.path)) {
          return;
        }
        
        // Skip logging for GET requests to audit logs themselves
        if (req.path.includes('/audit-logs') && req.method === 'GET') {
          return;
        }
        
        const auditData = {
          userId: req.user ? req.user.id : null,
          userEmail: req.user ? req.user.email : null,
          action: action,
          resource: req.path,
          method: req.method,
          description: generateDescription(req, res, action),
          category: categorizeAction(action, req.path),
          severity: determineSeverity(res.statusCode, action),
          ipAddress: getClientIp(req),
          userAgent: req.get('User-Agent'),
          statusCode: res.statusCode,
          duration: duration,
          metadata: {
            query: req.query,
            params: req.params,
            body: sanitizeData(req.body),
            headers: sanitizeHeaders(req.headers),
            responseSize: res.get('Content-Length') || 0
          }
        };
        
        // Add error information if request failed
        if (res.statusCode >= 400) {
          auditData.error = {
            message: responseData?.message || 'Request failed',
            code: responseData?.code || res.statusCode.toString()
          };
        }
        
        // Add data changes for update operations
        if (req.method === 'PUT' || req.method === 'PATCH') {
          auditData.changes = {
            before: req.originalData, // This would be set by specific route handlers
            after: responseData
          };
        }
        
        await AuditLog.create(auditData);
      } catch (error) {
        console.error('Audit logging error:', error);
        // Don't throw error to avoid breaking the main request
      }
    });
  };
};

// Middleware for manual audit logging
const manualAuditLog = async (req, res, next) => {
  req.auditLog = async (logData) => {
    try {
      const baseData = {
        userId: req.user ? req.user.id : null,
        userEmail: req.user ? req.user.email : null,
        ipAddress: getClientIp(req),
        userAgent: req.get('User-Agent'),
        resource: req.path,
        method: req.method,
        statusCode: res.statusCode || 200,
        timestamp: new Date()
      };
      
      await AuditLog.create({ ...baseData, ...logData });
    } catch (error) {
      console.error('Manual audit logging error:', error);
    }
  };
  
  next();
};

// Helper functions
const generateDescription = (req, res, action) => {
  const user = req.user ? req.user.email : 'Anonymous';
  const resource = req.path;
  const method = req.method;
  
  const descriptions = {
    'USER_LOGIN': `User ${user} logged in`,
    'USER_LOGOUT': `User ${user} logged out`,
    'USER_REGISTER': `New user registered: ${user}`,
    'USER_UPDATE_PROFILE': `User ${user} updated profile`,
    'USER_DELETE_ACCOUNT': `User ${user} deleted account`,
    'PASSWORD_CHANGE': `User ${user} changed password`,
    'PASSWORD_RESET': `Password reset requested for ${user}`,
    'FILE_UPLOAD': `File uploaded by ${user}`,
    'FILE_DELETE': `File deleted by ${user}`,
    'API_KEY_CREATED': `API key created by ${user}`,
    'API_KEY_DELETED': `API key deleted by ${user}`,
    'ADMIN_ACCESS': `Admin access by ${user}`,
    'DATA_EXPORT': `Data exported by ${user}`,
    'DATA_IMPORT': `Data imported by ${user}`,
    'SECURITY_VIOLATION': `Security violation detected for ${user}`,
    'CUSTOM': `${method} request to ${resource} by ${user}`
  };
  
  return descriptions[action] || `${method} request to ${resource} by ${user}`;
};

const categorizeAction = (action, resource) => {
  const authActions = ['USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTER', 'EMAIL_VERIFICATION'];
  const dataActions = ['USER_UPDATE_PROFILE', 'DATA_EXPORT', 'DATA_IMPORT'];
  const fileActions = ['FILE_UPLOAD', 'FILE_DELETE'];
  const paymentActions = ['PAYMENT_PROCESSED', 'PAYMENT_FAILED'];
  const securityActions = ['SECURITY_VIOLATION', 'PASSWORD_CHANGE', 'PASSWORD_RESET'];
  
  if (authActions.includes(action)) return 'AUTHENTICATION';
  if (dataActions.includes(action)) return 'DATA_MODIFICATION';
  if (fileActions.includes(action)) return 'FILE_OPERATION';
  if (paymentActions.includes(action)) return 'PAYMENT';
  if (securityActions.includes(action)) return 'SECURITY';
  if (resource.includes('/admin')) return 'SYSTEM';
  
  return 'AUTHORIZATION';
};

const determineSeverity = (statusCode, action) => {
  const criticalActions = ['USER_DELETE_ACCOUNT', 'SECURITY_VIOLATION', 'ADMIN_ACCESS'];
  const highActions = ['PASSWORD_CHANGE', 'PASSWORD_RESET', 'API_KEY_CREATED', 'API_KEY_DELETED'];
  
  if (statusCode >= 500) return 'CRITICAL';
  if (statusCode >= 400) return 'HIGH';
  if (criticalActions.includes(action)) return 'CRITICAL';
  if (highActions.includes(action)) return 'HIGH';
  if (statusCode >= 300) return 'MEDIUM';
  
  return 'LOW';
};

const sanitizeHeaders = (headers) => {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  const sanitized = { ...headers };
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

module.exports = {
  auditLogger,
  manualAuditLog
};