import { redis } from "../../config/redis.js";

export class RedisCache {
  async get(key) {
    const value = await redis.get(key);

    if (value === null) {
      return null;
    }

    return JSON.parse(value);
  }

  async set(key, value, ttl = null) {
    const serializedValue = JSON.stringify(value);

    if (ttl) {
      await redis.set(key, serializedValue, "PX", ttl);
    } else {
      await redis.set(key, serializedValue);
    }
  }

  async delete(key) {
    return (await redis.del(key)) > 0;
  }

  async has(key) {
    return (await redis.exists(key)) === 1;
  }

  async clear() {
    await redis.flushdb();
  }
}   