/**
 * cache.js – Practical 9: In-Memory Caching using node-cache
 * Student: Deep Patel  |  Roll No: 24CS061
 * Course:  B.Tech Computer Engineering, CSPIT, CHARUSAT University
 *
 * Implements:
 *  - Shared NodeCache instance with 60-second default TTL
 *  - Cache Hit / Miss tracking for empirical performance analysis
 *  - Granular cache invalidation on write operations
 *  - Debug statistics helper
 */

const NodeCache = require('node-cache');

// Standard TTL: 60 seconds, checkperiod: 120 seconds
const nodeCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Counters for cache hit/miss tracking (Supplementary Problem)
const metrics = {
  hits: 0,
  misses: 0,
};

const cache = {
  get(key) {
    const value = nodeCache.get(key);
    if (value !== undefined) {
      metrics.hits++;
      return value;
    }
    metrics.misses++;
    return undefined;
  },

  set(key, value, ttl) {
    if (ttl !== undefined) {
      return nodeCache.set(key, value, ttl);
    }
    return nodeCache.set(key, value);
  },

  del(key) {
    return nodeCache.del(key);
  },

  flush() {
    return nodeCache.flushAll();
  },

  keys() {
    return nodeCache.keys();
  },

  getStats() {
    const total = metrics.hits + metrics.misses;
    const hitRatio = total > 0 ? ((metrics.hits / total) * 100).toFixed(2) + '%' : '0%';
    return {
      hits: metrics.hits,
      misses: metrics.misses,
      totalRequests: total,
      hitRatio,
      cachedKeys: nodeCache.keys(),
      keyCount: nodeCache.keys().length,
      stdTTL: '60s',
      nodeCacheStats: nodeCache.getStats(),
    };
  },

  getHitMissStats() {
    return this.getStats();
  },

  resetMetrics() {
    metrics.hits = 0;
    metrics.misses = 0;
  },

  raw: nodeCache,
};

module.exports = cache;
