import { findRoute } from "./routing.service.js";
import { getLoadBalancer } from "./proxy.service.js";
import { HealthChecker } from "./healthChecker.service.js";

const healthCheckers = new Map();

export const startHealthChecks = async () => {
  const routes = await Promise.all([
    findRoute("/users"),
    findRoute("/products"),
  ]);

  for (const route of routes) {
    if (!route) continue;

    if (healthCheckers.has(route.prefix)) {
      continue;
    }

    const loadBalancer = getLoadBalancer(route);

    const checker = new HealthChecker({
      targets: route.targets,
      loadBalancer,
      intervalMs: 5000,
      timeoutMs: 2000,
    });

    healthCheckers.set(route.prefix, checker);

    await checker.checkAll();

    checker.start();
  }
};