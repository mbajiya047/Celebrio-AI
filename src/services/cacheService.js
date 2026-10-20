/**
 * @fileoverview In-Memory Cryptographic SHA-256 Response Cache Service
 * @module services/cacheService
 */

const crypto = require('crypto');
const { CACHE_TTL_MS, MAX_CACHE_SIZE } = require('../config/constants');

/** @type {Map<string, { value: any, timestamp: number }>} */
const responseCache = new Map();

/**
 * Generates a deterministic SHA-256 cache key from request payload.
 * @param {string} prefix - Namespace prefix (e.g., 'plan', 'speech')
 * @param {Object} data - Payload parameters to serialize and hash
 * @returns {string} Formatted cache key
 */
function getCacheKey(prefix, data) {
  const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return `${prefix}:${hash}`;
}

/**
 * Retrieves unexpired cached data by key.
 * @param {string} key - Cache lookup key
 * @returns {any|null} Cached response or null if missing/expired
 */
function getFromCache(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Stores payload in cache with current timestamp, maintaining LRU capacity.
 * @param {string} key - Unique cache key
 * @param {any} value - Serializable data payload
 */
function setInCache(key, value) {
  if (responseCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(key, { value, timestamp: Date.now() });
}

module.exports = {
  responseCache,
  getCacheKey,
  getFromCache,
  setInCache
};
