import { describe, it, expect } from "vitest";
import { MetricsService } from "../../../src/services/metrics/metrics.service.js";

describe("MetricsService", () => {
  it("tracks request metrics", () => {
    const metrics = new MetricsService();

    metrics.incrementRequest();
    metrics.incrementRequest();

    metrics.recordRequestSuccess();
    metrics.recordRequestFailure();

    const result = metrics.getMetrics();

    expect(result.requests.total).toBe(2);
    expect(result.requests.successful).toBe(1);
    expect(result.requests.failed).toBe(1);
  });

  it("tracks backend failures", () => {
    const metrics = new MetricsService();

    metrics.recordBackendRequest();
    metrics.recordBackendRequest();
    metrics.recordBackendFailure();

    const result = metrics.getMetrics();

    expect(result.backend.requests).toBe(2);
    expect(result.backend.failures).toBe(1);
  });

  it("calculates average backend latency", () => {
    const metrics = new MetricsService();

    metrics.recordBackendRequest();
    metrics.recordBackendLatency(100);

    metrics.recordBackendRequest();
    metrics.recordBackendLatency(300);

    const result = metrics.getMetrics();

    expect(result.backend.averageLatency).toBe(200);
  });

  it("tracks rate limit metrics", () => {
    const metrics = new MetricsService();

    metrics.recordRateLimitAllowed();
    metrics.recordRateLimitAllowed();
    metrics.recordRateLimitRejected();

    const result = metrics.getMetrics();

    expect(result.rateLimit.allowed).toBe(2);
    expect(result.rateLimit.rejected).toBe(1);
  });

  it("resets all metrics", () => {
    const metrics = new MetricsService();

    metrics.incrementRequest();
    metrics.recordBackendRequest();
    metrics.recordBackendLatency(100);
    metrics.recordRateLimitRejected();

    metrics.reset();

    const result = metrics.getMetrics();

    expect(result.requests.total).toBe(0);
    expect(result.backend.requests).toBe(0);
    expect(result.backend.totalLatency).toBe(0);
    expect(result.rateLimit.rejected).toBe(0);
  });
});