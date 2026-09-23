import { LRUCache } from "./lru.cache.js";
import { RedisCache } from "./redis.cache.js";

export class CacheService {
  constructor(options = {}) {
    const {
      capacity = 1000,
      defaultTTL = null,
    } = options;

    this.defaultTTL = defaultTTL;

    this.l1 = new LRUCache(capacity);
    this.l2 = new RedisCache();

    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  async get(key) {
    const l1Value = this.l1.get(key);

    if (l1Value !== null) {
      this.stats.hits++;
      return l1Value;
    }

    const l2Value = await this.l2.get(key);

    if (l2Value !== null) {
      this.stats.hits++;

      this.l1.set(key, l2Value, this.defaultTTL);

      return l2Value;
    }

    this.stats.misses++;

    return null;
  }

  async set(key, value, ttl = this.defaultTTL) {
    const evicted = this.l1.set(key, value, ttl);

    if (evicted) {
      this.stats.evictions++;
    }

    await this.l2.set(key, value, ttl);
  }

  async delete(key) {
    const l1Deleted = this.l1.delete(key);
    const l2Deleted = await this.l2.delete(key);

    return l1Deleted || l2Deleted;
  }

  async has(key) {
    if (this.l1.has(key)) {
      return true;
    }

    return await this.l2.has(key);
  }

  size() {
    return this.l1.size();
  }

  clear() {
    this.l1.clear();
  }

  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      hitRatio: totalRequests === 0
        ? 0
        : this.stats.hits / totalRequests,
    };
  }
}