const AuditLog = require('../models/auditlog.models');
const { exportToCSV, aggregateByTimePeriod, formatDuration } = require('../utils/auditlog.utils');

// Get audit logs with filtering and pagination
const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      category,
      severity,
      startDate,
      endDate,
      ipAddress,
      method,
      statusCode,
      search
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (method) filter.method = method;
    if (statusCode) filter.statusCode = parseInt(statusCode);
    if (ipAddress) filter.ipAddress = { $regex: ipAddress, $options: 'i' };
    
    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [auditLogs, totalCount] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'email name')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: auditLogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
};

// Get audit log by ID
const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const auditLog = await AuditLog.findById(id)
      .populate('userId', 'email name')
      .lean();
    
    if (!auditLog) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }
    
    res.json({
      success: true,
      data: auditLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log',
      error: error.message
    });
  }
};

// Get audit log statistics
const getAuditLogStats = async (req, res) => {
  try {
    const { period = 'day', days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const filter = { timestamp: { $gte: startDate } };
    
    const auditLogs = await AuditLog.find(filter).lean();
    
    const stats = {
      totalLogs: auditLogs.length,
      uniqueUsers: new Set(auditLogs.map(log => log.userId).filter(Boolean)).size,
      uniqueIPs: new Set(auditLogs.map(log => log.ipAddress)).size,
      
      // Action distribution
      actionDistribution: auditLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {}),
      
      // Category distribution
      categoryDistribution: auditLogs.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
      }, {}),
      
      // Severity distribution
      severityDistribution: auditLogs.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {}),
      
      // Status code distribution
      statusCodeDistribution: auditLogs.reduce((acc, log) => {
        acc[log.statusCode] = (acc[log.statusCode] || 0) + 1;
        return acc;
      }, {}),
      
      // Top IP addresses
      topIPs: Object.entries(
        auditLogs.reduce((acc, log) => {
          acc[log.ipAddress] = (acc[log.ipAddress] || 0) + 1;
          return acc;
        }, {})
      )
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count })),
      
      // Top users
      topUsers: Object.entries(
        auditLogs
          .filter(log => log.userEmail)
          .reduce((acc, log) => {
            acc[log.userEmail] = (acc[log.userEmail] || 0) + 1;
            return acc;
          }, {})
      )
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([email, count]) => ({ email, count })),
      
      // Average response time
      averageResponseTime: auditLogs.length > 0 
        ? auditLogs.reduce((sum, log) => sum + log.duration, 0) / auditLogs.length
        : 0,
      
      // Time series data
      timeSeries: aggregateByTimePeriod(auditLogs, period)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log statistics',
      error: error.message
    });
  }
};

// Export audit logs to CSV
const exportAuditLogs = async (req, res) => {
  try {
    const {
      userId,
      action,
      category,
      severity,
      startDate,
      endDate,
      limit = 10000
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    
    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const auditLogs = await AuditLog.find(filter)
      .populate('userId', 'email name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();
    
    const csvData = exportToCSV(auditLogs);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
    res.send(csvData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export audit logs',
      error: error.message
    });
  }
};

// Get security events (high and critical severity)
const getSecurityEvents = async (req, res) => {
  try {
    const { page = 1, limit = 50, days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const filter = {
      timestamp: { $gte: startDate },
      severity: { $in: ['HIGH', 'CRITICAL'] }
    };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [securityEvents, totalCount] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'email name')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: securityEvents,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security events',
      error: error.message
    });
  }
};

// Get user activity
const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50, days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const filter = {
      userId: userId,
      timestamp: { $gte: startDate }
    };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [userActivity, totalCount] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'email name')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    // Calculate some basic statistics for the user
    const stats = {
      totalActions: totalCount,
      actionsByCategory: userActivity.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
      }, {}),
      actionsBySeverity: userActivity.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {}),
      lastActivity: userActivity.length > 0 ? userActivity[0].timestamp : null
    };
    
    res.json({
      success: true,
      data: userActivity,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: error.message
    });
  }
};

// Get IP address activity
const getIpActivity = async (req, res) => {
  try {
    const { ipAddress } = req.params;
    const { page = 1, limit = 50, days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const filter = {
      ipAddress: ipAddress,
      timestamp: { $gte: startDate }
    };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [ipActivity, totalCount] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'email name')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    // Calculate some basic statistics for the IP address
    const stats = {
      totalActions: totalCount,
      uniqueUsers: new Set(ipActivity.map(log => log.userId).filter(Boolean)).size,
      actionsByCategory: ipActivity.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
      }, {}),
      actionsBySeverity: ipActivity.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {}),
      lastActivity: ipActivity.length > 0 ? ipActivity[0].timestamp : null
    };
    
    res.json({
      success: true,
      data: ipActivity,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch IP address activity',
      error: error.message
    });
  }
};

// Get recent activities
const getRecentActivities = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const recentActivities = await AuditLog.find()
      .populate('userId', 'email name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      data: recentActivities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: error.message
    });
  }
};

// Get activity heatmap data
const getActivityHeatmap = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const logs = await AuditLog.find({
      timestamp: { $gte: startDate }
    }).lean();
    
    // Group by hour of day and day of week
    const heatmapData = Array(7).fill().map(() => Array(24).fill(0));
    
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
      const hourOfDay = date.getHours(); // 0 to 23
      
      heatmapData[dayOfWeek][hourOfDay]++;
    });
    
    res.json({
      success: true,
      data: heatmapData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heatmap data',
      error: error.message
    });
  }
};
const skip = (parseInt(page) - 1) * parseInt(limit);
    
const [userActivity, totalCount] = await Promise.all([
  AuditLog.find(filter)
    .populate('userId', 'email name')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean(),
  AuditLog.countDocuments(filter)
]);

const totalPages = Math.ceil(totalCount / parseInt(limit));

// Calculate some basic statistics for the user
const stats = {
  totalActions: totalCount,
  actionsByCategory: userActivity.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {}),
  actionsBySeverity: userActivity.reduce((acc, log) => {
    acc[log.severity] = (acc[log.severity] || 0) + 1;
    return acc;
  }, {}),
  lastActivity: userActivity.length > 0 ? userActivity[0].timestamp : null
};

res.json({
  success: true,
  data: userActivity,
  stats,
  pagination: {
    currentPage: parseInt(page),
    totalPages,
    totalCount,
    limit: parseInt(limit),
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
});
} catch (error) {
res.status(500).json({
  success: false,
  message: 'Failed to fetch user activity',
  error: error.message
});
}
};

// Get IP address activity
const getIpActivity = async (req, res) => {
try {
const { ipAddress } = req.params;
const { page = 1, limit = 50, days = 7 } = req.query;

const startDate = new Date();
startDate.setDate(startDate.getDate() - parseInt(days));

const filter = {
  ipAddress: ipAddress,
  timestamp: { $gte: startDate }
};

const skip = (parseInt(page) - 1) * parseInt(limit);

const [ipActivity, totalCount] = await Promise.all([
  AuditLog.find(filter)
    .populate('userId', 'email name')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean(),
  AuditLog.countDocuments(filter)
]);

const totalPages = Math.ceil(totalCount / parseInt(limit));

// Calculate some basic statistics for the IP address
const stats = {
  totalActions: totalCount,
  uniqueUsers: new Set(ipActivity.map(log => log.userId).filter(Boolean)).size,
  actionsByCategory: ipActivity.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {}),
  actionsBySeverity: ipActivity.reduce((acc, log) => {
    acc[log.severity] = (acc[log.severity] || 0) + 1;
    return acc;
  }, {}),
  lastActivity: ipActivity.length > 0 ? ipActivity[0].timestamp : null
};

res.json({
  success: true,
  data: ipActivity,
  stats,
  pagination: {
    currentPage: parseInt(page),
    totalPages,
    totalCount,
    limit: parseInt(limit),
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
});
} catch (error) {
res.status(500).json({
  success: false,
  message: 'Failed to fetch IP address activity',
  error: error.message
});
}
};

// Get recent activities
const getRecentActivities = async (req, res) => {
try {
const { limit = 20 } = req.query;

const recentActivities = await AuditLog.find()
  .populate('userId', 'email name')
  .sort({ timestamp: -1 })
  .limit(parseInt(limit))
  .lean();

res.json({
  success: true,
  data: recentActivities
});
} catch (error) {
res.status(500).json({
  success: false,
  message: 'Failed to fetch recent activities',
  error: error.message
});
}
};

// Get activity heatmap data
const getActivityHeatmap = async (req, res) => {
try {
const { days = 30 } = req.query;

const startDate = new Date();
startDate.setDate(startDate.getDate() - parseInt(days));

const logs = await AuditLog.find({
  timestamp: { $gte: startDate }
}).lean();

// Group by hour of day and day of week
const heatmapData = Array(7).fill().map(() => Array(24).fill(0));

logs.forEach(log => {
  const date = new Date(log.timestamp);
  const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
  const hourOfDay = date.getHours(); // 0 to 23
  
  heatmapData[dayOfWeek][hourOfDay]++;
});

res.json({
  success: true,
  data: heatmapData
});
} catch (error) {
res.status(500).json({
  success: false,
  message: 'Failed to fetch heatmap data',
  error: error.message
});
}
};

module.exports = {
getAuditLogs,
getAuditLogById,
getAuditLogStats,
exportAuditLogs,
getSecurityEvents,
getUserActivity,
getIpActivity,
getRecentActivities,
getActivityHeatmap
};