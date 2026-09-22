import { describe, it, expect, beforeEach, vi } from "vitest";
import { FixedWindowRateLimiter } from "../../../src/services/rateLimiter/fixedWindow.js";

describe("FixedWindowRateLimiter", () => {
  let limiter;

  beforeEach(() => {
    limiter = new FixedWindowRateLimiter({
      windowMs: 60000,
      maxRequests: 3,
    });
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

  it("resets after the window expires", () => {
    vi.useFakeTimers();

    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(false);

    vi.advanceTimersByTime(60000);

    expect(limiter.check("client-1").allowed).toBe(true);

    vi.useRealTimers();
  });
});