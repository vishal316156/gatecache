import { describe, it, expect, beforeEach } from "vitest";
import { RedisCache } from "../../../src/services/cache/redis.cache.js";

describe("RedisCache", () => {
  const cache = new RedisCache();

  beforeEach(async () => {
    await cache.clear();
  });

  it("should store and retrieve values", async () => {
    await cache.set("test:user", {
      name: "Vishal",
    });

    const value = await cache.get("test:user");

    expect(value).toEqual({
      name: "Vishal",
    });
  });

  it("should return null for missing key", async () => {
    const value = await cache.get("does-not-exist");

    expect(value).toBeNull();
  });

  it("should delete values", async () => {
    await cache.set("test:delete", "hello");

    const deleted = await cache.delete("test:delete");

    expect(deleted).toBe(true);
    expect(await cache.get("test:delete")).toBeNull();
  });

  it("should expire values using TTL", async () => {
    await cache.set("test:ttl", "hello", 100);

    expect(await cache.get("test:ttl")).toBe("hello");

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(await cache.get("test:ttl")).toBeNull();
  });
});