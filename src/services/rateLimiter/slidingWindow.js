export class SlidingWindowRateLimiter {
  constructor({
    windowMs = 60000,
    maxRequests = 100,
  } = {}) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.clients = new Map();
  }

  check(clientId) {
    const now = Date.now();

    let timestamps = this.clients.get(clientId);

    if (!timestamps) {
      timestamps = [];
      this.clients.set(clientId, timestamps);
    }

    const cutoff = now - this.windowMs;

    while (timestamps.length > 0 && timestamps[0] <= cutoff) {
      timestamps.shift();
    }

    const allowed = timestamps.length < this.maxRequests;

    if (allowed) {
      timestamps.push(now);
    }

    const remaining = Math.max(
      0,
      this.maxRequests - timestamps.length
    );

    const resetAt =
      timestamps.length > 0
        ? timestamps[0] + this.windowMs
        : now + this.windowMs;

    return {
      allowed,
      limit: this.maxRequests,
      remaining,
      resetAt,
    };
  }
}