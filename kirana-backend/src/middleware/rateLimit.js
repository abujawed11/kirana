import rateLimit from 'express-rate-limit';

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth-specific rate limiting (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Login-specific rate limiting (very strict)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    error: 'Too many login attempts, please try again in 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// OTP rate limiting
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 OTP requests per 5 minutes
  message: {
    success: false,
    error: 'Too many OTP requests, please wait 5 minutes before trying again'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset rate limiting
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: {
    success: false,
    error: 'Too many password reset attempts, please try again in 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Create custom rate limiter with more flexibility
export function createCustomLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests',
    skipSuccessful = false,
    keyGenerator = undefined,
  } = options;

  const limiterConfig = {
    windowMs,
    max,
    message: {
      success: false,
      error: message
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: skipSuccessful,
  };

  // Only add keyGenerator if explicitly provided
  if (keyGenerator) {
    limiterConfig.keyGenerator = keyGenerator;
  }

  return rateLimit(limiterConfig);
}