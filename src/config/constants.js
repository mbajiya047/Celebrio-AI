/**
 * @fileoverview Application Constants and Configuration Defaults
 * @module config/constants
 */

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DEFAULT_GEMINI_KEY: process.env.GEMINI_API_KEY || '',
  DEFAULT_MODEL: process.env.DEFAULT_MODEL || 'gemini-3.5-flash',
  FALLBACK_MODEL: process.env.FALLBACK_MODEL || 'gemini-3.5-flash-lite',
  CACHE_TTL_MS: 30 * 60 * 1000, // 30 minutes in milliseconds
  MAX_CACHE_SIZE: 250,
  REQUEST_TIMEOUT_MS: 30000
};
