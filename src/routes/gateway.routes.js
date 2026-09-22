import express from "express";

import { handleGatewayRequest } from "../controllers/gateway.controller.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.all(
  "/{*splat}",
  rateLimitMiddleware,
  handleGatewayRequest
);

export default router;