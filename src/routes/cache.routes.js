import { Router } from "express";
import { cacheService } from "../services/cache/index.js";
import {
  setCache,
  getCache,
  deleteCache,
  getCacheStats,
} from "../controllers/cache.controller.js";

const router = Router();

router.post("/", setCache);
router.get("/stats", getCacheStats);
router.get("/:key", getCache);
router.delete("/:key", deleteCache);

export default router;