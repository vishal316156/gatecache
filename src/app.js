import express from "express";
import pinoHttp from "pino-http";

import { logger } from "./utils/logger.js";
import healthRoutes from "./routes/health.routes.js";
import cacheRoutes from "./routes/cache.routes.js";
import gatewayRoutes from "./routes/gateway.routes.js";
import { metricsMiddleware } from "./middleware/metrics.middleware.js";
import metricsRoutes from "./routes/metrics.routes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(metricsMiddleware);
app.use("/metrics", metricsRoutes);


// Routes
app.use("/health", healthRoutes);
app.use("/cache", cacheRoutes);
app.use("/gateway", gatewayRoutes);

export default app;