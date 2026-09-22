import { describe, it, expect } from "vitest";
import { createRateLimiter } from "../../../src/services/rateLimiter/index.js";
import { FixedWindowRateLimiter } from "../../../src/services/rateLimiter/fixedWindow.js";
import { SlidingWindowRateLimiter } from "../../../src/services/rateLimiter/slidingWindow.js";
import { TokenBucketRateLimiter } from "../../../src/services/rateLimiter/tokenBucket.js";

describe("RateLimiter Factory", () => {
  it("creates a fixed window limiter", () => {
    const limiter = createRateLimiter({
      strategy: "fixed-window",
      windowMs: 60000,
      maxRequests: 3,
    });

    expect(limiter).toBeInstanceOf(FixedWindowRateLimiter);
  });

  it("creates a sliding window limiter", () => {
    const limiter = createRateLimiter({
      strategy: "sliding-window",
      windowMs: 60000,
      maxRequests: 3,
    });

    expect(limiter).toBeInstanceOf(SlidingWindowRateLimiter);
  });

  it("creates a token bucket limiter", () => {
    const limiter = createRateLimiter({
      strategy: "token-bucket",
      windowMs: 60000,
      maxRequests: 3,
    });

    expect(limiter).toBeInstanceOf(TokenBucketRateLimiter);
  });

  it("rejects unsupported strategies", () => {
    expect(() => {
      createRateLimiter({
        strategy: "something-else",
        windowMs: 60000,
        maxRequests: 3,
      });
    }).toThrow("Unsupported rate limit strategy");
  });
});