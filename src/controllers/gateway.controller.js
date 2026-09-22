import { cacheService } from "../services/cache/index.js";
import { proxyRequest } from "../services/gateway/proxy.service.js";

export const handleGatewayRequest = async (req, res, next) => {
  try {
    if (req.method !== "GET") {
      const backendResponse = await proxyRequest(req);

      res.status(backendResponse.statusCode);

      if (backendResponse.headers?.["content-type"]) {
        res.set(
          "content-type",
          backendResponse.headers["content-type"]
        );
      }

      return res.json(backendResponse.body);
    }

    const cacheKey = `${req.method}:${req.originalUrl}`;

    const cachedResponse = await cacheService.get(cacheKey);

    if (cachedResponse !== null) {
      res.status(cachedResponse.statusCode);

      if (cachedResponse.headers?.["content-type"]) {
        res.set(
          "content-type",
          cachedResponse.headers["content-type"]
        );
      }

      return res.json(cachedResponse.body);
    }

    const backendResponse = await proxyRequest(req);

    await cacheService.set(cacheKey, backendResponse);

    res.status(backendResponse.statusCode);

    if (backendResponse.headers?.["content-type"]) {
      res.set(
        "content-type",
        backendResponse.headers["content-type"]
      );
    }

    return res.json(backendResponse.body);
  } catch (error) {
    next(error);
  }
};