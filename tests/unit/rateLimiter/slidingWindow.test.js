import { describe, it, expect, beforeEach, vi,afterEach, } from "vitest";
import { SlidingWindowRateLimiter } from "../../../src/services/rateLimiter/slidingWindow.js";

describe("SlidingWindowRateLimiter", () => {
  let limiter;

  beforeEach(() => {
    limiter = new SlidingWindowRateLimiter({
      windowMs: 60000,
      maxRequests: 3,
    });

    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within the limit", () => {
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
  });

  it("rejects requests after the limit", () => {
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);

    expect(limiter.check("client-1").allowed).toBe(false);
  });

  it("tracks clients independently", () => {
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);

    expect(limiter.check("client-1").allowed).toBe(false);

    expect(limiter.check("client-2").allowed).toBe(true);
  });

  it("removes requests outside the sliding window", () => {
    expect(limiter.check("client-1").allowed).toBe(true);

    vi.advanceTimersByTime(10000);

    expect(limiter.check("client-1").allowed).toBe(true);

    vi.advanceTimersByTime(10000);

    expect(limiter.check("client-1").allowed).toBe(true);

    expect(limiter.check("client-1").allowed).toBe(false);


    vi.advanceTimersByTime(41000);

    expect(limiter.check("client-1").allowed).toBe(true);
  });

  it("does not count rejected requests", () => {
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);

    expect(limiter.check("client-1").allowed).toBe(false);
    expect(limiter.check("client-1").allowed).toBe(false);


    vi.advanceTimersByTime(60000);

    expect(limiter.check("client-1").allowed).toBe(true);
  });
});
