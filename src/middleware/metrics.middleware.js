import { metricsService } from "../services/metrics/index.js";
import { logger } from "../utils/logger.js";

export const metricsMiddleware = (req, res, next) => {
  if (req.path === "/metrics") {
    return next();
  }

  metricsService.incrementRequest();

  const startTime = performance.now();

  res.on("finish", () => {
    const duration = performance.now() - startTime;

    if (res.statusCode >= 200 && res.statusCode < 400) {
      metricsService.recordRequestSuccess();
    } else {
      metricsService.recordRequestFailure();
    }

    logger.info(
      {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Number(duration.toFixed(2)),
      },
      "Request completed"
    );
  });

  next();
};