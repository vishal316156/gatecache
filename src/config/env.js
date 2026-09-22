import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 3000,

  mongoUri: process.env.MONGO_URI,

  redisUrl: process.env.REDIS_URL,

  jwtSecret: process.env.JWT_SECRET,

  cacheMaxSize: Number(process.env.CACHE_MAX_SIZE) || 1000,

  cacheDefaultTTL: Number(process.env.CACHE_DEFAULT_TTL) || 60000,

  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 60000,

  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  rateLimitStrategy: process.env.RATE_LIMIT_STRATEGY || "fixed-window",
};
