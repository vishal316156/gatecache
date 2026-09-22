import { CacheService } from "./cache.service.js";
import { env } from "../../config/env.js";

export const cacheService = new CacheService({
  capacity: env.cacheMaxSize,
  defaultTTL: env.cacheDefaultTTL,
});