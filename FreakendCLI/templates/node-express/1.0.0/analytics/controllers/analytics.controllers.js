const Analytics = require('../models/analytics.models');
const AnalyticsEvent = require('../models/analytics-event.models');
const { 
  generateAnalyticsReport, 
  calculatePerformanceMetrics, 
  exportAnalyticsData 
} = require('../utils/analytics.utils');

// Get analytics dashboard data
const getDashboard = async (req, res) => {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date(),
      route,
      method
    } = req.query;
    
    const filters = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      route,
      method
    };
    
    const report = await generateAnalyticsReport(Analytics, AnalyticsEvent, filters);
    
    res.status(200).json({
      success: true,
      data: report,
      message: 'Analytics dashboard data retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics dashboard data',
      error: error.message
    });
  }
};

// Get route-specific analytics
const getRouteAnalytics = async (req, res) => {
  try {
    const { route } = req.params;
    const { 
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate = new Date(),
      timeframe = '24h'
    } = req.query;
    
    // Get basic route stats
    const routeStats = await Analytics.getRouteStats(
      route,
      new Date(startDate),
      new Date(endDate)
    );
    
    // Get performance metrics
    const performanceMetrics = await calculatePerformanceMetrics(
      AnalyticsEvent,
      route,
      timeframe
    );
    
    // Get recent events for this route
    const recentEvents = await AnalyticsEvent
      .find({ route })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();
    
    res.status(200).json({
      success: true,
      data: {
        routeStats: routeStats[0] || {},
        performanceMetrics,
        recentEvents,
        route
      },
      message: 'Route analytics retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching route analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch route analytics',
      error: error.message
    });
  }
};

// Get real-time analytics
const getRealTimeAnalytics = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Get recent events
    const recentEvents = await AnalyticsEvent
      .find({ timestamp: { $gte: fiveMinutesAgo } })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();
    
    // Get current system metrics
    const systemMetrics = {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date()
    };
    
    // Get active routes in last 5 minutes
    const activeRoutes = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: fiveMinutesAgo }
        }
      },
      {
        $group: {
          _id: '$route',
          count: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        recentEvents,
        systemMetrics,
        activeRoutes,
        timestamp: new Date()
      },
      message: 'Real-time analytics retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time analytics',
      error: error.message
    });
  }
};

// Get performance metrics
const getPerformanceMetrics = async (req, res) => {
  try {
    const { route, timeframe = '24h' } = req.query;
    
    if (!route) {
      return res.status(400).json({
        success: false,
        message: 'Route parameter is required'
      });
    }
    
    const metrics = await calculatePerformanceMetrics(AnalyticsEvent, route, timeframe);
    
    res.status(200).json({
      success: true,
      data: metrics,
      message: 'Performance metrics retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics',
      error: error.message
    });
  }
};

// Get top routes by various metrics
const getTopRoutes = async (req, res) => {
  try {
    const { 
      metric = 'requests', 
      limit = 10,
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date()
    } = req.query;
    
    let sortField;
    switch (metric) {
      case 'requests':
        sortField = 'totalRequests';
        break;
      case 'response_time':
        sortField = 'averageResponseTime';
        break;
      case 'errors':
        sortField = 'failedRequests';
        break;
      default:
        sortField = 'totalRequests';
    }
    
    const topRoutes = await Analytics.aggregate([
      {
        $match: {
          date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: '$route',
          totalRequests: { $sum: '$totalRequests' },
          averageResponseTime: { $avg: '$averageResponseTime' },
          failedRequests: { $sum: '$failedRequests' },
          successRate: {
            $avg: {
              $divide: ['$successfulRequests', '$totalRequests']
            }
          }
        }
      },
      { $sort: { [sortField]: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.status(200).json({
      success: true,
      data: topRoutes,
      message: 'Top routes retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching top routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top routes',
      error: error.message
    });
  }
};

// Get error analysis
const getErrorAnalysis = async (req, res) => {
  try {
    const { 
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate = new Date(),
      statusCode
    } = req.query;
    
    const matchConditions = {
      timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
      statusCode: { $gte: 400 }
    };
    
    if (statusCode) {
      matchConditions.statusCode = parseInt(statusCode);
    }
    
    const errorAnalysis = await AnalyticsEvent.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: {
            statusCode: '$statusCode',
            route: '$route'
          },
          count: { $sum: 1 },
          errors: {
            $push: {
              message: '$error.message',
              timestamp: '$timestamp'
            }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);
    
    res.status(200).json({
      success: true,
      data: errorAnalysis,
      message: 'Error analysis retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching error analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch error analysis',
      error: error.message
    });
  }
};

// Export analytics data
const exportData = async (req, res) => {
  try {
    const { 
      format = 'json',
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date(),
      route,
      method
    } = req.query;
    
    const filters = {
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };
    
    if (route) filters.route = route;
    if (method) filters.method = method;
    
    const exportedData = await exportAnalyticsData(Analytics, format, filters);
    
    const contentType = format === 'csv' ? 'text/csv' : 'application/json';
    const filename = `analytics_${Date.now()}.${format}`;
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportedData);
    
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data',
      error: error.message
    });
  }
};

// Create custom analytics event
const createCustomEvent = async (req, res) => {
  try {
    const { eventName, metadata = {} } = req.body;
    
    if (!eventName) {
      return res.status(400).json({
        success: false,
        message: 'Event name is required'
      });
    }
    
    const eventData = {
      eventType: 'custom',
      eventName,
      route: req.route ? req.route.path : req.path,
      method: req.method,
      statusCode: 200,
      responseTime: 0,
      userId: req.user ? req.user.id : null,
      sessionId: req.sessionID || null,
      isAuthenticated: !!req.user,
      userAgent: req.get('User-Agent') || 'Unknown',
      ipAddress: req.ip || req.connection.remoteAddress,
      metadata: new Map(Object.entries(metadata))
    };
    
    const event = await AnalyticsEvent.create(eventData);
    
    res.status(201).json({
      success: true,
      data: event,
      message: 'Custom event created successfully'
    });
    
  } catch (error) {
    console.error('Error creating custom event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom event',
      error: error.message
    });
  }
};

// Get user analytics (if user is authenticated)
const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date()
    } = req.query;
    
    // Verify user can access this data (either own data or admin)
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const userAnalytics = await AnalyticsEvent.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
          routesAccessed: { $addToSet: '$route' },
          lastActivity: { $max: '$timestamp' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: userAnalytics[0] || {},
      message: 'User analytics retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboard,
  getRouteAnalytics,
  getRealTimeAnalytics,
  getPerformanceMetrics,
  getTopRoutes,
  getErrorAnalysis,
  exportData,
  createCustomEvent,
  getUserAnalytics
};