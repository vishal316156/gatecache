import { describe, it, expect, vi } from "vitest";
import { retryRequest } from "../../../src/services/gateway/retry.service.js";

describe("retryRequest", () => {
  it("returns immediately when the first request succeeds", async () => {
    const loadBalancer = {
      next: vi.fn().mockReturnValue("server-1"),
      markUnhealthy: vi.fn(),
    };

    const request = vi.fn().mockResolvedValue("success");

    const result = await retryRequest({
      loadBalancer,
      request,
      maxRetries: 2,
    });

    expect(result).toBe("success");
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith("server-1");
  });

  it("retries using another target after failure", async () => {
    const loadBalancer = {
      next: vi
        .fn()
        .mockReturnValueOnce("server-1")
        .mockReturnValueOnce("server-2"),

      markUnhealthy: vi.fn(),
    };

    const request = vi
      .fn()
      .mockRejectedValueOnce(
        new Error("server-1 failed")
      )
      .mockResolvedValueOnce("success");

    const result = await retryRequest({
      loadBalancer,
      request,
      maxRetries: 2,
    });

    expect(result).toBe("success");

    expect(loadBalancer.next)
      .toHaveBeenCalledTimes(2);

    expect(loadBalancer.markUnhealthy)
      .toHaveBeenCalledWith("server-1");

    expect(request).toHaveBeenNthCalledWith(
      1,
      "server-1"
    );

    expect(request).toHaveBeenNthCalledWith(
      2,
      "server-2"
    );
  });

  it("throws the last error when all attempts fail", async () => {
    const error1 = new Error("server-1 failed");
    const error2 = new Error("server-2 failed");

    const loadBalancer = {
      next: vi
        .fn()
        .mockReturnValueOnce("server-1")
        .mockReturnValueOnce("server-2"),

      markUnhealthy: vi.fn(),
    };

    const request = vi
      .fn()
      .mockRejectedValueOnce(error1)
      .mockRejectedValueOnce(error2);

    await expect(
      retryRequest({
        loadBalancer,
        request,
        maxRetries: 1,
      })
    ).rejects.toThrow("server-2 failed");

    expect(loadBalancer.next)
      .toHaveBeenCalledTimes(2);

    expect(loadBalancer.markUnhealthy)
      .toHaveBeenCalledTimes(2);

    expect(loadBalancer.markUnhealthy)
      .toHaveBeenNthCalledWith(
        1,
        "server-1"
      );

    expect(loadBalancer.markUnhealthy)
      .toHaveBeenNthCalledWith(
        2,
        "server-2"
      );

    expect(request).toHaveBeenCalledTimes(2);
  });

  it("does not exceed maxRetries", async () => {
    const loadBalancer = {
      next: vi.fn().mockReturnValue("server-1"),
      markUnhealthy: vi.fn(),
    };

    const request = vi
      .fn()
      .mockRejectedValue(new Error("failed"));

    await expect(
      retryRequest({
        loadBalancer,
        request,
        maxRetries: 2,
      })
    ).rejects.toThrow("failed");

    expect(request).toHaveBeenCalledTimes(3);

    expect(loadBalancer.next)
      .toHaveBeenCalledTimes(3);

    expect(loadBalancer.markUnhealthy)
      .toHaveBeenCalledTimes(3);
  });

  it("makes only one attempt when maxRetries is zero", async () => {
    const loadBalancer = {
      next: vi.fn().mockReturnValue("server-1"),
      markUnhealthy: vi.fn(),
    };

    const request = vi
      .fn()
      .mockRejectedValue(new Error("failed"));

    await expect(
      retryRequest({
        loadBalancer,
        request,
        maxRetries: 0,
      })
    ).rejects.toThrow("failed");

    expect(request).toHaveBeenCalledTimes(1);

    expect(loadBalancer.next)
      .toHaveBeenCalledTimes(1);

    expect(loadBalancer.markUnhealthy)
      .toHaveBeenCalledWith("server-1");
  });
});