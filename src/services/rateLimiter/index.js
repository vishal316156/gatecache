import { FixedWindowRateLimiter } from "./fixedWindow.js";
import { SlidingWindowRateLimiter } from "./slidingWindow.js";
import { TokenBucketRateLimiter } from "./tokenBucket.js";

export const createRateLimiter = ({
  strategy,
  windowMs,
  maxRequests,
}) => {
  switch (strategy) {
    case "fixed-window":
      return new FixedWindowRateLimiter({
        windowMs,
        maxRequests,
      });

    case "sliding-window":
      return new SlidingWindowRateLimiter({
        windowMs,
        maxRequests,
      });

    case "token-bucket":
        return new TokenBucketRateLimiter({
            capacity: maxRequests,
            refillRate: 10,
        });

    default:
      throw new Error(
        `Unsupported rate limit strategy: ${strategy}`
      );
  }
};