import { createRateLimiter } from "../services/rateLimiter/index.js";
import { env } from "../config/env.js";
import { metricsService } from "../services/metrics/index.js";

const limiter = createRateLimiter({
  strategy: env.rateLimitStrategy,
  windowMs: env.rateLimitWindow,
  maxRequests: env.rateLimitMaxRequests,
});

export const rateLimitMiddleware = (req, res, next) => {
  const clientId = req.ip;

  const result = limiter.check(clientId);

  res.set("X-RateLimit-Limit", result.limit);
  res.set("X-RateLimit-Remaining", result.remaining);
  res.set("X-RateLimit-Reset", result.resetAt);

  if (!result.allowed) {
    metricsService.recordRateLimitRejected();

    return res.status(429).json({
      error: "Too many requests",
    });
  }

  metricsService.recordRateLimitAllowed();

  next();
};