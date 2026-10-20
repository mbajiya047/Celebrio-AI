/**
 * @fileoverview Security Hardening Middleware: Helmet CSP, Rate Limiting, and Socket Timeouts
 * @module middleware/security
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { REQUEST_TIMEOUT_MS } = require('../config/constants');

/**
 * Helmet Content-Security-Policy and HTTP Protection configuration
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false
});

/**
 * General API Rate Limiter (120 req / 15 min)
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again after a few minutes.' }
});

/**
 * AI Generation Rate Limiter (40 req / 5 min)
 */
const aiGenerationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI generation rate limit reached. Please wait a moment before generating more plans.' }
});

/**
 * Request Timeout Middleware to prevent socket exhaustion and Slowloris attacks.
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next handler
 */
function requestTimeoutMiddleware(req, res, next) {
  res.setTimeout(REQUEST_TIMEOUT_MS, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout: server took too long to respond.' });
    }
  });
  next();
}

module.exports = {
  helmetMiddleware,
  apiLimiter,
  aiGenerationLimiter,
  requestTimeoutMiddleware
};
