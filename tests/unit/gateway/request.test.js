import { describe, it, expect, vi, afterEach } from "vitest";
import { requestWithTimeout } from "../../../src/services/gateway/request.service.js";

describe("requestWithTimeout", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("returns the response when request succeeds", async () => {
    const response = {
      ok: true,
      status: 200,
    };

    global.fetch = vi.fn().mockResolvedValue(response);

    const result = await requestWithTimeout({
      url: "http://server-1/users/1",
      options: {
        method: "GET",
      },
      timeoutMs: 2000,
    });

    expect(result).toBe(response);

    expect(fetch).toHaveBeenCalledWith(
      "http://server-1/users/1",
      expect.objectContaining({
        method: "GET",
        signal: expect.any(AbortSignal),
      })
    );
  });

  it("passes through request errors", async () => {
    const error = new Error("Connection refused");

    global.fetch = vi.fn().mockRejectedValue(error);

    await expect(
      requestWithTimeout({
        url: "http://server-1/users/1",
        options: {
          method: "GET",
        },
        timeoutMs: 2000,
      })
    ).rejects.toThrow("Connection refused");
  });

  it("aborts when request exceeds timeout", async () => {
  vi.useFakeTimers();

  global.fetch = vi.fn().mockImplementation(
    (_url, { signal }) =>
      new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      })
  );

  const requestPromise = requestWithTimeout({
    url: "http://server-1/users/1",
    options: {
      method: "GET",
    },
    timeoutMs: 2000,
  });

  const assertion = expect(requestPromise).rejects.toThrow(
    "Aborted"
  );

  await vi.advanceTimersByTimeAsync(2000);

  await assertion;
});
});