import { describe, it, expect } from "vitest";
import { RoundRobinLoadBalancer } from "../../../src/services/gateway/loadBalancer.service.js";

describe("RoundRobinLoadBalancer", () => {
  it("cycles through targets in order", () => {
    const loadBalancer = new RoundRobinLoadBalancer([
      "server-1",
      "server-2",
      "server-3",
    ]);

    expect(loadBalancer.next()).toBe("server-1");
    expect(loadBalancer.next()).toBe("server-2");
    expect(loadBalancer.next()).toBe("server-3");
    expect(loadBalancer.next()).toBe("server-1");
    expect(loadBalancer.next()).toBe("server-2");
  });

  it("works with a single target", () => {
    const loadBalancer = new RoundRobinLoadBalancer([
      "server-1",
    ]);

    expect(loadBalancer.next()).toBe("server-1");
    expect(loadBalancer.next()).toBe("server-1");
  });

  it("rejects empty targets", () => {
    expect(() => {
      new RoundRobinLoadBalancer([]);
    }).toThrow("At least one target is required");
  });

  it("skips unhealthy targets", () => {
    const loadBalancer = new RoundRobinLoadBalancer([
      "server-1",
      "server-2",
      "server-3",
    ]);

    loadBalancer.markUnhealthy("server-2");

    expect(loadBalancer.next()).toBe("server-1");
    expect(loadBalancer.next()).toBe("server-3");
    expect(loadBalancer.next()).toBe("server-1");
    expect(loadBalancer.next()).toBe("server-3");
  });

  it("allows an unhealthy target to recover", () => {
    const loadBalancer = new RoundRobinLoadBalancer([
      "server-1",
      "server-2",
      "server-3",
    ]);

    loadBalancer.markUnhealthy("server-2");

    expect(loadBalancer.next()).toBe("server-1");
    expect(loadBalancer.next()).toBe("server-3");

    loadBalancer.markHealthy("server-2");

    expect(loadBalancer.next()).toBe("server-1");
    expect(loadBalancer.next()).toBe("server-2");
  });

  it("throws when all targets are unhealthy", () => {
    const loadBalancer = new RoundRobinLoadBalancer([
      "server-1",
      "server-2",
    ]);

    loadBalancer.markUnhealthy("server-1");
    loadBalancer.markUnhealthy("server-2");

    expect(() => loadBalancer.next()).toThrow(
      "No healthy targets available"
    );
  });
});