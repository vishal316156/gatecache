export class TokenBucketRateLimiter {
  constructor({
    capacity = 100,
    refillRate = 10,
  } = {}) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.clients = new Map();
  }

  check(clientId) {
    const now = Date.now();

    let client = this.clients.get(clientId);

    if (!client) {
      client = {
        tokens: this.capacity,
        lastRefillTime: now,
      };

      this.clients.set(clientId, client);
    }

    const elapsedSeconds =
      (now - client.lastRefillTime) / 1000;

    const newTokens = elapsedSeconds * this.refillRate;

    client.tokens = Math.min(
      this.capacity,
      client.tokens + newTokens
    );

    client.lastRefillTime = now;

    let allowed = false;

    if (client.tokens >= 1) {
      client.tokens -= 1;
      allowed = true;
    }

    const remaining = Math.floor(client.tokens);

    const resetAt = allowed
      ? now
      : now + (1 - client.tokens) * (1000 / this.refillRate);

    return {
      allowed,
      limit: this.capacity,
      remaining,
      resetAt,
    };
  }
}