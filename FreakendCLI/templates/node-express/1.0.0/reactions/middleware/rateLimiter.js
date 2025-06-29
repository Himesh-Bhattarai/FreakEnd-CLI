const rateLimit = require('express-rate-limit');

const rateLimiter = {
  // Rate limiter for reaction endpoints
  reactionLimiter: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
      success: false,
      message: 'Too many reaction requests, please try again later',
      retryAfter: '1 minute'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id || req.ip;
    },
    skip: (req) => {
      // Skip rate limiting for GET requests (reading stats)
      return req.method === 'GET';
    }
  }),

  // More strict rate limiter for creating reactions
  createReactionLimiter: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each user to 5 reaction creations per minute
    message: {
      success: false,
      message: 'Too many reactions created, please try again later',
      retryAfter: '1 minute'
    },
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
    skip: (req) => {
      return req.method !== 'POST';
    }
  })
};

module.exports = rateLimiter;