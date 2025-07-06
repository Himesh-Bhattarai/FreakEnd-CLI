const rateLimit = require('express-rate-limit');

// Rate limiting for chatbot requests
const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.CHATBOT_RATE_LIMIT_WINDOW) * 1000 || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.CHATBOT_RATE_LIMIT_MAX) || 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many chatbot requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.CHATBOT_RATE_LIMIT_WINDOW) || 900) / 60)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req, res) => {
    // Skip rate limiting for certain routes if needed
    return false;
  }
});

// Middleware to validate OpenAI API key
const validateOpenAIKey = (req, res, next) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      success: false,
      message: 'OpenAI API key not configured'
    });
  }
  next();
};

module.exports = {
  rateLimitMiddleware,
  validateOpenAIKey
};