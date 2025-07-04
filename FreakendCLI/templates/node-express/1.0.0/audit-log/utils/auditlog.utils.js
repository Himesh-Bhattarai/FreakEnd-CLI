const crypto = require('crypto');

// Get client IP address
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
};

// Sanitize sensitive data
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = (process.env.AUDIT_LOG_SENSITIVE_FIELDS || 'password,token,secret,key')
    .split(',')
    .map(field => field.trim().toLowerCase());
  
  const sanitized = JSON.parse(JSON.stringify(data));
  
  const sanitizeRecursive = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeRecursive(item));
    } else if (obj && typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = sanitizeRecursive(value);
        }
      }
      return result;
    }
    return obj;
  };
  
  return sanitizeRecursive(sanitized);
};

// Determine action from request
const determineActionFromRequest = (req) => {
  const path = req.path.toLowerCase();
  const method = req.method.toUpperCase();
  
  // Authentication routes
  if (path.includes('/auth/login')) return 'USER_LOGIN';
  if (path.includes('/auth/logout')) return 'USER_LOGOUT';
  if (path.includes('/auth/register')) return 'USER_REGISTER';
  if (path.includes('/auth/verify')) return 'EMAIL_VERIFICATION';
  if (path.includes('/auth/reset')) return 'PASSWORD_RESET';
  
  // User routes
  if (path.includes('/users') && method === 'PUT') return 'USER_UPDATE_PROFILE';
  if (path.includes('/users') && method === 'DELETE') return 'USER_DELETE_ACCOUNT';
  if (path.includes('/password') && method === 'PUT') return 'PASSWORD_CHANGE';
  
  // File routes
  if (path.includes('/upload') && method === 'POST') return 'FILE_UPLOAD';
  if (path.includes('/files') && method === 'DELETE') return 'FILE_DELETE';
  
  // API Key routes
  if (path.includes('/api-keys') && method === 'POST') return 'API_KEY_CREATED';
  if (path.includes('/api-keys') && method === 'DELETE') return 'API_KEY_DELETED';
  
  // Payment routes
  if (path.includes('/payments') && method === 'POST') return 'PAYMENT_PROCESSED';
  
  // Admin routes
  if (path.includes('/admin')) return 'ADMIN_ACCESS';
  
  // Export/Import routes
  if (path.includes('/export')) return 'DATA_EXPORT';
  if (path.includes('/import')) return 'DATA_IMPORT';
  
  // System configuration
  if (path.includes('/config') && (method === 'PUT' || method === 'PATCH')) return 'SYSTEM_CONFIG_CHANGE';
  
  return 'CUSTOM';
};

// Generate hash for data integrity
const generateHash = (data) => {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

// Validate IP address
const isValidIP = (ip) => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// Format duration in human readable format
const formatDuration = (milliseconds) => {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(2)}s`;
  return `${(milliseconds / 60000).toFixed(2)}m`;
};

// Export data to CSV format
const exportToCSV = (auditLogs) => {
  if (!auditLogs || auditLogs.length === 0) return '';
  
  const headers = [
    'Timestamp',
    'User Email',
    'Action',
    'Resource',
    'Method',
    'Status Code',
    'IP Address',
    'Description',
    'Category',
    'Severity',
    'Duration (ms)'
  ];
  
  const rows = auditLogs.map(log => [
    log.timestamp.toISOString(),
    log.userEmail || 'Anonymous',
    log.action,
    log.resource,
    log.method,
    log.statusCode,
    log.ipAddress,
    log.description,
    log.category,
    log.severity,
    log.duration
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
};

// Aggregate audit logs by time period
const aggregateByTimePeriod = (auditLogs, period = 'day') => {
  const aggregated = {};
  
  auditLogs.forEach(log => {
    const date = new Date(log.timestamp);
    let key;
    
    switch (period) {
      case 'hour':
        key = date.toISOString().substr(0, 13);
        break;
      case 'day':
        key = date.toISOString().substr(0, 10);
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().substr(0, 10);
        break;
      case 'month':
        key = date.toISOString().substr(0, 7);
        break;
      default:
        key = date.toISOString().substr(0, 10);
    }
    
    if (!aggregated[key]) {
      aggregated[key] = {
        period: key,
        count: 0,
        actions: {},
        categories: {},
        severities: {},
        statusCodes: {}
      };
    }
    
    aggregated[key].count++;
    aggregated[key].actions[log.action] = (aggregated[key].actions[log.action] || 0) + 1;
    aggregated[key].categories[log.category] = (aggregated[key].categories[log.category] || 0) + 1;
    aggregated[key].severities[log.severity] = (aggregated[key].severities[log.severity] || 0) + 1;
    aggregated[key].statusCodes[log.statusCode] = (aggregated[key].statusCodes[log.statusCode] || 0) + 1;
  });
  
  return Object.values(aggregated);
};

module.exports = {
  getClientIp,
  sanitizeData,
  determineActionFromRequest,
  generateHash,
  isValidIP,
  formatDuration,
  exportToCSV,
  aggregateByTimePeriod
};