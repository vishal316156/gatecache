export class FixedWindowRateLimiter {constructor({
    windowMs = 60000,maxRequests = 100,} = {}) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.clients = new Map();
  }

  check(clientId) {
    const now = Date.now();
    let client = this.clients.get(clientId);

    if (!client || now - client.windowStart >= this.windowMs) {
      client = {
        count: 1,
        windowStart: now,
      };

      this.clients.set(clientId, client);
    } else {
      client.count++;
    }

    const remaining = Math.max(
      0,
      this.maxRequests - client.count
    );

    const resetAt = client.windowStart + this.windowMs;

    return {
      allowed: client.count <= this.maxRequests,
      limit: this.maxRequests,
      remaining,
      resetAt,
    };
  }
}
