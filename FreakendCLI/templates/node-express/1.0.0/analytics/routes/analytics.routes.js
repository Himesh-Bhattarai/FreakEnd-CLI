
const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getRouteAnalytics,
  getRealTimeAnalytics,
  getPerformanceMetrics,
  getTopRoutes,
  getErrorAnalysis,
  exportData,
  createCustomEvent,
  getUserAnalytics
} = require('../controllers/analytics.controllers');

// Middleware
const authenticateToken = require('../../middleware/auth.middleware'); // Adjust path as needed
const { trackCustomEvent } = require('../middleware/analytics.middleware');

// Input validation middleware
const validateAnalyticsQuery = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid startDate format'
    });
  }
  
  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid endDate format'
    });
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'startDate cannot be after endDate'
    });
  }
  
  next();
};

// Routes

// GET /api/analytics/dashboard - Get analytics dashboard
router.get('/dashboard', 
  authenticateToken, 
  validateAnalyticsQuery,
  trackCustomEvent('analytics_dashboard_view'),
  getDashboard
);

// GET /api/analytics/realtime - Get real-time analytics
router.get('/realtime', 
  authenticateToken, 
  getRealTimeAnalytics
);

// GET /api/analytics/routes/:route - Get route-specific analytics
router.get('/routes/:route(*)', 
  authenticateToken, 
  validateAnalyticsQuery,
  getRouteAnalytics
);

// GET /api/analytics/performance - Get performance metrics
router.get('/performance', 
  authenticateToken, 
  validateAnalyticsQuery,
  getPerformanceMetrics
);

// GET /api/analytics/top-routes - Get top routes by various metrics
router.get('/top-routes', 
  authenticateToken, 
  validateAnalyticsQuery,
  getTopRoutes
);

// GET /api/analytics/errors - Get error analysis
router.get('/errors', 
  authenticateToken, 
  validateAnalyticsQuery,
  getErrorAnalysis
);

// GET /api/analytics/export - Export analytics data
router.get('/export', 
  authenticateToken, 
  validateAnalyticsQuery,
  trackCustomEvent('analytics_data_export'),
  exportData
);

// POST /api/analytics/events - Create custom analytics event
router.post('/events', 
  authenticateToken, 
  createCustomEvent
);

// GET /api/analytics/users/:userId - Get user-specific analytics
router.get('/users/:userId', 
  authenticateToken, 
  validateAnalyticsQuery,
  getUserAnalytics
);

module.exports = router;