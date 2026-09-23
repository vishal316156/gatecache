import {describe,it,expect,beforeEach,afterEach,vi} from "vitest";

import { TokenBucketRateLimiter } from "../../../src/services/rateLimiter/tokenBucket.js";

describe("TokenBucketRateLimiter", () => {
  let limiter;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    limiter = new TokenBucketRateLimiter({
      capacity: 3,
      refillRate: 1,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests while tokens are available", () => {
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
  });

  it("rejects requests when the bucket is empty", () => {
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);

    expect(limiter.check("client-1").allowed).toBe(false);
  });

  it("refills tokens over time", () => {
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);

    expect(limiter.check("client-1").allowed).toBe(false);

    vi.advanceTimersByTime(1000);

    expect(limiter.check("client-1").allowed).toBe(true);
  });

  it("does not exceed bucket capacity", () => {
    vi.advanceTimersByTime(10000);

    const result = limiter.check("client-1");

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(3);
    expect(result.remaining).toBe(2);
  });

  it("tracks clients independently", () => {
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);

    expect(limiter.check("client-1").allowed).toBe(false);

    expect(limiter.check("client-2").allowed).toBe(true);
  });
});