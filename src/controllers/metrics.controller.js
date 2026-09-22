import { metricsService } from "../services/metrics/index.js";
import { cacheService } from "../services/cache/index.js";

export const getMetrics = (req, res) => {
  const metrics = metricsService.getMetrics();
  const cache = cacheService.getStats();

  res.json({
    requests: metrics.requests,
    backend: metrics.backend,
    rateLimit: metrics.rateLimit,
    cache,
  });
};