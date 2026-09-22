import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HealthChecker } from "../../../src/services/gateway/healthChecker.service.js";

describe("HealthChecker", () => {
  let loadBalancer;

  beforeEach(() => {
    loadBalancer = {
      markHealthy: vi.fn(),
      markUnhealthy: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("marks target healthy when health check succeeds", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    });

    const checker = new HealthChecker({
      targets: ["http://server-1"],
      loadBalancer,
    });

    const result = await checker.checkTarget("http://server-1");

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "http://server-1/health",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );

    expect(loadBalancer.markHealthy)
      .toHaveBeenCalledWith("http://server-1");

    expect(loadBalancer.markUnhealthy)
      .not.toHaveBeenCalled();
  });

  it("marks target unhealthy when health check fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    const checker = new HealthChecker({
      targets: ["http://server-1"],
      loadBalancer,
    });

    const result = await checker.checkTarget("http://server-1");

    expect(result).toBe(false);

    expect(loadBalancer.markUnhealthy)
      .toHaveBeenCalledWith("http://server-1");

    expect(loadBalancer.markHealthy)
      .not.toHaveBeenCalled();
  });

  it("marks target unhealthy when request throws", async () => {
    global.fetch = vi.fn().mockRejectedValue(
      new Error("Connection refused")
    );

    const checker = new HealthChecker({
      targets: ["http://server-1"],
      loadBalancer,
    });

    const result = await checker.checkTarget("http://server-1");

    expect(result).toBe(false);

    expect(loadBalancer.markUnhealthy)
      .toHaveBeenCalledWith("http://server-1");
  });

  it("checks all targets", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    });

    const targets = [
      "http://server-1",
      "http://server-2",
      "http://server-3",
    ];

    const checker = new HealthChecker({
      targets,
      loadBalancer,
    });

    await checker.checkAll();

    expect(fetch).toHaveBeenCalledTimes(3);

    expect(loadBalancer.markHealthy)
      .toHaveBeenCalledTimes(3);
  });
});