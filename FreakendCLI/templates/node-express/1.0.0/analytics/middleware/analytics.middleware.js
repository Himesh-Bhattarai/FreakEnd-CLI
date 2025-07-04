
const AnalyticsEvent = require('../models/analytics-event.models');
const Analytics = require('../models/analytics.models');
const { getClientIP, parseUserAgent, getCountryFromIP } = require('../utils/analytics.utils');

// Middleware to track all route access
const trackRouteAccess = async (req, res, next) => {
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override res.end to capture response data
  res.end = function(chunk, encoding) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Call original end function
    originalEnd.call(this, chunk, encoding);
    
    // Track the event asynchronously
    setImmediate(async () => {
      try {
        await trackEvent(req, res, responseTime);
      } catch (error) {
        console.error('Analytics tracking error:', error);
      }
    });
  };
  
  next();
};

// Function to track individual events
const trackEvent = async (req, res, responseTime) => {
  try {
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ipAddress = getClientIP(req);
    const country = await getCountryFromIP(ipAddress);
    
    // Create event record
    const eventData = {
      eventType: 'route_access',
      eventName: `${method} ${route}`,
      route,
      method,
      statusCode,
      responseTime,
      userId: req.user ? req.user.id : null,
      sessionId: req.sessionID || null,
      isAuthenticated: !!req.user,
      userAgent,
      ipAddress,
      country,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      metadata: new Map([
        ['query', req.query],
        ['params', req.params],
        ['contentLength', res.get('Content-Length') || 0]
      ])
    };
    
    // Save event
    await AnalyticsEvent.create(eventData);
    
    // Update aggregated analytics
    await updateAggregatedAnalytics(eventData);
    
  } catch (error) {
    console.error('Error tracking analytics event:', error);
  }
};

// Function to update aggregated analytics
const updateAggregatedAnalytics = async (eventData) => {
  try {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    const filter = {
      route: eventData.route,
      method: eventData.method,
      date,
      hour,
      dayOfWeek
    };
    
    const isSuccess = eventData.statusCode >= 200 && eventData.statusCode < 400;
    const statusCodeKey = eventData.statusCode.toString();
    
    const update = {
      $inc: {
        totalRequests: 1,
        successfulRequests: isSuccess ? 1 : 0,
        failedRequests: isSuccess ? 0 : 1,
        [`statusCodes.${statusCodeKey}`]: 1,
        authenticatedRequests: eventData.isAuthenticated ? 1 : 0
      },
      $push: {
        countries: {
          $each: eventData.country ? [{ country: eventData.country, count: 1 }] : [],
          $slice: -100 // Keep only last 100 country entries
        },
        userAgents: {
          $each: [{ agent: eventData.userAgent, count: 1 }],
          $slice: -50 // Keep only last 50 user agent entries
        }
      }
    };
    
    // Calculate running average for response time
    const existing = await Analytics.findOne(filter);
    if (existing) {
      const newAverage = (existing.averageResponseTime * existing.totalRequests + eventData.responseTime) / (existing.totalRequests + 1);
      update.$set = { averageResponseTime: newAverage };
    } else {
      update.$set = { averageResponseTime: eventData.responseTime };
    }
    
    await Analytics.findOneAndUpdate(filter, update, { upsert: true });
    
  } catch (error) {
    console.error('Error updating aggregated analytics:', error);
  }
};

// Middleware to track custom events
const trackCustomEvent = (eventName, metadata = {}) => {
  return async (req, res, next) => {
    try {
      const eventData = {
        eventType: 'custom',
        eventName,
        route: req.route ? req.route.path : req.path,
        method: req.method,
        statusCode: res.statusCode || 200,
        responseTime: 0,
        userId: req.user ? req.user.id : null,
        sessionId: req.sessionID || null,
        isAuthenticated: !!req.user,
        userAgent: req.get('User-Agent') || 'Unknown',
        ipAddress: getClientIP(req),
        metadata: new Map(Object.entries(metadata))
      };
      
      await AnalyticsEvent.create(eventData);
    } catch (error) {
      console.error('Error tracking custom event:', error);
    }
    
    next();
  };
};

module.exports = {
  trackRouteAccess,
  trackCustomEvent,
  trackEvent
};