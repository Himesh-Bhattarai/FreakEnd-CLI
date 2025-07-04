const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

const searchRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'search_rate_limit',
  points: parseInt(process.env.SEARCH_RATE_LIMIT_POINTS) || 100,
  duration: parseInt(process.env.SEARCH_RATE_LIMIT_DURATION) || 3600,
  blockDuration: 60,
});

const rateLimitMiddleware = async (req, res, next) => {
  try {
    const key = req.user?.id || req.ip;
    await searchRateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const remainingPoints = rejRes.remainingPoints || 0;
    const msBeforeNext = rejRes.msBeforeNext || 0;
    
    res.set('Retry-After', Math.round(msBeforeNext / 1000) || 1);
    res.set('X-RateLimit-Limit', process.env.SEARCH_RATE_LIMIT_POINTS || 100);
    res.set('X-RateLimit-Remaining', remainingPoints);
    res.set('X-RateLimit-Reset', new Date(Date.now() + msBeforeNext).toISOString());
    
    return res.status(429).json({
      success: false,
      message: 'Too many search requests. Please try again later.',
      retryAfter: Math.round(msBeforeNext / 1000)
    });
  }
};

const validateSearchInput = (req, res, next) => {
  const { query, filters, searchType, limit } = req.body;

  // Validate query
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Query must be a string with at least 2 characters'
    });
  }

  if (query.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Query must be less than 500 characters'
    });
  }

  // Validate search type
  const validSearchTypes = ['semantic', 'text', 'hybrid'];
  if (searchType && !validSearchTypes.includes(searchType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid search type. Must be one of: semantic, text, hybrid'
    });
  }

  // Validate limit
  if (limit && (typeof limit !== 'number' || limit < 1 || limit > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be a number between 1 and 100'
    });
  }

  // Validate filters
  if (filters) {
    const validCategories = ['article', 'product', 'document', 'faq', 'tutorial', 'other'];
    
    if (filters.category && !validCategories.includes(filters.category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category filter'
      });
    }

    if (filters.tags && (!Array.isArray(filters.tags) || filters.tags.some(tag => typeof tag !== 'string'))) {
      return res.status(400).json({
        success: false,
        message: 'Tags filter must be an array of strings'
      });
    }
  }

  next();
};

const validateItemInput = (req, res, next) => {
  const { title, content, category, tags } = req.body;

  // Validate title
  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Title must be a string with at least 2 characters'
    });
  }

  if (title.length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Title must be less than 200 characters'
    });
  }

  // Validate content
  if (!content || typeof content !== 'string' || content.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Content must be a string with at least 10 characters'
    });
  }

  if (content.length > 10000) {
    return res.status(400).json({
      success: false,
      message: 'Content must be less than 10,000 characters'
    });
  }

  // Validate category
  const validCategories = ['article', 'product', 'document', 'faq', 'tutorial', 'other'];
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category'
    });
  }

  // Validate tags
  if (tags && (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string' || tag.length > 50))) {
    return res.status(400).json({
      success: false,
      message: 'Tags must be an array of strings, each less than 50 characters'
    });
  }

  next();
};

module.exports = {
  rateLimitMiddleware,
  validateSearchInput,
  validateItemInput
};