const { RateLimiterMemory } = require('rate-limiter-flexible');

// Create different rate limiters for different endpoints
const authLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 5, // 5 attempts
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 || 900, // Per 15 minutes
});

const generalLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // 100 requests
  duration: 900, // Per 15 minutes
});

/**
 * Rate limiting middleware for authentication endpoints
 */
const authRateLimiter = async (req, res, next) => {
  try {
    await authLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const remainingPoints = rejRes.remainingPoints || 0;
    const msBeforeNext = rejRes.msBeforeNext || 1000;
    
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: Math.round(msBeforeNext / 1000),
      remainingAttempts: remainingPoints
    });
  }
};

/**
 * General rate limiting middleware
 */
const rateLimiter = async (req, res, next) => {
  try {
    await generalLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const remainingPoints = rejRes.remainingPoints || 0;
    const msBeforeNext = rejRes.msBeforeNext || 1000;
    
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.round(msBeforeNext / 1000),
      remainingRequests: remainingPoints
    });
  }
};

module.exports = {
  authRateLimiter,
  rateLimiter
};