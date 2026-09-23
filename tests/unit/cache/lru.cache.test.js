import { describe, it, expect } from "vitest";
import { LRUCache } from "../../../src/services/cache/lru.cache.js";

describe("LRU Cache", () => {
  it("should store and retrieve values", () => {
    const cache = new LRUCache(3);

    cache.set("A", 100);

    expect(cache.get("A")).toBe(100);
  });

  it("should return null for missing key", () => {
    const cache = new LRUCache(3);

    expect(cache.get("A")).toBeNull();
  });

  it("should update existing key", () => {
    const cache = new LRUCache(3);

    cache.set("A", 100);
    cache.set("A", 200);

    expect(cache.get("A")).toBe(200);
    expect(cache.size()).toBe(1);
  });

  it("should evict least recently used item", () => {
    const cache = new LRUCache(3);

    cache.set("A", 1);
    cache.set("B", 2);
    cache.set("C", 3);

    cache.get("A");

    cache.set("D", 4);

    expect(cache.get("B")).toBeNull();
    expect(cache.get("A")).toBe(1);
    expect(cache.get("C")).toBe(3);
    expect(cache.get("D")).toBe(4);
  });

  it("should delete an item", () => {
    const cache = new LRUCache(3);

    cache.set("A", 1);

    expect(cache.delete("A")).toBe(true);
    expect(cache.get("A")).toBeNull();
    expect(cache.size()).toBe(0);
  });

  it("should return false when deleting missing key", () => {
    const cache = new LRUCache(3);

    expect(cache.delete("A")).toBe(false);
  });

  it("should clear the cache", () => {
    const cache = new LRUCache(3);

    cache.set("A", 1);
    cache.set("B", 2);

    cache.clear();

    expect(cache.size()).toBe(0);
    expect(cache.get("A")).toBeNull();
    expect(cache.get("B")).toBeNull();
  });
  it("should expire an item after TTL", async () => {
  const cache = new LRUCache(3);

  cache.set("A", 100, 100);

  expect(cache.get("A")).toBe(100);

  await new Promise((resolve) => setTimeout(resolve, 150));

  expect(cache.get("A")).toBeNull();
});
  
});
