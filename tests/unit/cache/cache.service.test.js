import { describe, it, expect, beforeEach } from "vitest";
import { CacheService } from "../../../src/services/cache/cache.service.js";
import { redis } from "../../../src/config/redis.js";


describe("CacheService", () => {
    beforeEach(async () => {
  await redis.flushdb();
});
  it("should store and retrieve values", async () => {
    const cache = new CacheService({
      capacity: 3,
    });

    await cache.set("A", 100);

    expect(await cache.get("A")).toBe(100);
  });

  it("should delete values", async () => {
    const cache = new CacheService({
      capacity: 3,
    });

    await cache.set("A", 100);

    expect(await cache.delete("A")).toBe(true);
    expect(await cache.get("A")).toBeNull();
  });

  it("should report correct size", async () => {
    const cache = new CacheService({
      capacity: 3,
    });

    await cache.set("A", 100);
    await cache.set("B", 200);

    expect(cache.size()).toBe(2);
  });

  it("should use default TTL", async () => {
    const cache = new CacheService({
      capacity: 3,
      defaultTTL: 100,
    });

    await cache.set("A", 100);

    expect(await cache.get("A")).toBe(100);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(await cache.get("A")).toBeNull();
  });

  it("should track cache hits", async () => {
    const cache = new CacheService({
      capacity: 3,
    });

    await cache.set("A", 100);

    await cache.get("A");
    await cache.get("A");

    const stats = cache.getStats();

    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(0);
  });

  it("should track cache misses", async () => {
    const cache = new CacheService({
      capacity: 3,
    });

    await cache.get("A");
    await cache.get("B");

    const stats = cache.getStats();

    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(2);
  });

  it("should calculate hit ratio", async () => {
    const cache = new CacheService({
      capacity: 3,
    });

    await cache.set("A", 100);

    await cache.get("A");
    await cache.get("A");
    await cache.get("B");

    const stats = cache.getStats();

    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRatio).toBeCloseTo(2 / 3);
  });

  it("should track evictions", async () => {
    const cache = new CacheService({
      capacity: 2,
    });

    await cache.set("A", 1);
    await cache.set("B", 2);
    await cache.set("C", 3);

    const stats = cache.getStats();

    expect(stats.evictions).toBe(1);
  });
});