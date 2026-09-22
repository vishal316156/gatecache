import { findRoute } from "./routing.service.js";
import { RoundRobinLoadBalancer } from "./loadBalancer.service.js";
import { retryRequest } from "./retry.service.js";
import { requestWithTimeout } from "./request.service.js";
import { metricsService } from "../metrics/index.js";
import { logger } from "../../utils/logger.js";

const loadBalancers = new Map();

export const getLoadBalancer = (route) => {
  if (!loadBalancers.has(route.prefix)) {
    loadBalancers.set(
      route.prefix,
      new RoundRobinLoadBalancer(route.targets)
    );
  }

  return loadBalancers.get(route.prefix);
};

export const proxyRequest = async (req) => {
  const path = req.originalUrl.replace(/^\/gateway/, "");

  const route = await findRoute(path);

  if (!route) {
    throw new Error(`No route found for ${path}`);
  }

  const loadBalancer = getLoadBalancer(route);

  const options = {
    method: req.method,
    headers: {
      "content-type": req.headers["content-type"],
    },
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    options.body = JSON.stringify(req.body);
  }

  const backendResponse = await retryRequest({
    loadBalancer,
    maxRetries: 2,

  request: async (target) => {
  const url = `${target}${path}`;

  metricsService.recordBackendRequest();

  const startTime = performance.now();
  let failed = false;

  try {
    const response = await requestWithTimeout({
      url,
      options,
      timeoutMs: 2000,
    });

    if (!response.ok) {
      failed = true;

      throw new Error(
        `Backend returned ${response.status}`
      );
    }

    const body = await response.json();

    return {
      statusCode: response.status,
      headers: {
        "content-type": response.headers.get(
          "content-type"
        ),
      },
      body,
    };
  } catch (error) {
    failed = true;

    logger.error(
      {
        target,
        path,
        error: error.message,
      },
      "Backend request failed"
    );

    throw error;
  } finally {
    const duration = performance.now() - startTime;

    metricsService.recordBackendLatency(duration);

    if (failed) {
      metricsService.recordBackendFailure();
    }
  }
},
  });

  return backendResponse;
};