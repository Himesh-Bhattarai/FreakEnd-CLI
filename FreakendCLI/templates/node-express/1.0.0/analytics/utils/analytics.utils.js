const useragent = require('useragent');
const geoip = require('geoip-lite');

// Extract client IP address
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
};

// Parse user agent string
const parseUserAgent = (userAgentString) => {
  const agent = useragent.parse(userAgentString);
  return {
    browser: agent.toAgent(),
    os: agent.os.toString(),
    device: agent.device.toString(),
    version: agent.toVersion()
  };
};

// Get country from IP address
const getCountryFromIP = async (ipAddress) => {
  try {
    // Skip localhost and private IPs
    if (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
      return 'Unknown';
    }
    
    const geo = geoip.lookup(ipAddress);
    return geo ? geo.country : 'Unknown';
  } catch (error) {
    console.error('Error getting country from IP:', error);
    return 'Unknown';
  }
};

// Generate analytics report
const generateAnalyticsReport = async (Analytics, AnalyticsEvent, filters = {}) => {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date(),
      route = null,
      method = null
    } = filters;
    
    const matchConditions = {
      date: { $gte: startDate, $lte: endDate }
    };
    
    if (route) matchConditions.route = route;
    if (method) matchConditions.method = method;
    
    // Get aggregated data
    const aggregatedData = await Analytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: '$totalRequests' },
          averageResponseTime: { $avg: '$averageResponseTime' },
          successfulRequests: { $sum: '$successfulRequests' },
          failedRequests: { $sum: '$failedRequests' },
          uniqueUsers: { $sum: '$uniqueUsers' }
        }
      }
    ]);
    
    // Get top routes
    const topRoutes = await Analytics.getTopRoutes(10);
    
    // Get hourly distribution
    const hourlyData = await Analytics.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$hour',
          requests: { $sum: '$totalRequests' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get error analysis
    const errorAnalysis = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          statusCode: { $gte: 400 }
        }
      },
      {
        $group: {
          _id: '$statusCode',
          count: { $sum: 1 },
          routes: { $addToSet: '$route' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    return {
      summary: aggregatedData[0] || {
        totalRequests: 0,
        averageResponseTime: 0,
        successfulRequests: 0,
        failedRequests: 0,
        uniqueUsers: 0
      },
      topRoutes,
      hourlyDistribution: hourlyData,
      errorAnalysis,
      period: {
        startDate,
        endDate
      }
    };
    
  } catch (error) {
    console.error('Error generating analytics report:', error);
    throw error;
  }
};

// Calculate performance metrics
const calculatePerformanceMetrics = async (AnalyticsEvent, route, timeframe = '24h') => {
  try {
    const timeframeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const startTime = new Date(Date.now() - timeframeMs[timeframe]);
    
    const metrics = await AnalyticsEvent.aggregate([
      {
        $match: {
          route,
          timestamp: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
          p95ResponseTime: { $percentile: { input: '$responseTime', p: [0.95], method: 'approximate' } },
          totalRequests: { $sum: 1 },
          errorRate: {
            $avg: {
              $cond: [{ $gte: ['$statusCode', 400] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    return metrics[0] || {
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      p95ResponseTime: [0],
      totalRequests: 0,
      errorRate: 0
    };
    
  } catch (error) {
    console.error('Error calculating performance metrics:', error);
    throw error;
  }
};

// Data export utilities
const exportAnalyticsData = async (Analytics, format = 'json', filters = {}) => {
  try {
    const data = await Analytics.find(filters).lean();
    
    if (format === 'csv') {
      const fields = ['route', 'method', 'date', 'totalRequests', 'averageResponseTime', 'successfulRequests', 'failedRequests'];
      const csv = [
        fields.join(','),
        ...data.map(item => fields.map(field => item[field] || '').join(','))
      ].join('\n');
      
      return csv;
    }
    
    return JSON.stringify(data, null, 2);
    
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    throw error;
  }
};

module.exports = {
  getClientIP,
  parseUserAgent,
  getCountryFromIP,
  generateAnalyticsReport,
  calculatePerformanceMetrics,
  exportAnalyticsData
};