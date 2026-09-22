export class MetricsService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
      },

      backend: {
        requests: 0,
        failures: 0,
        totalLatency: 0,
      },

      rateLimit: {
        allowed: 0,
        rejected: 0,
      },
    };
  }

  incrementRequest() {
    this.metrics.requests.total++;
  }

  recordRequestSuccess() {
    this.metrics.requests.successful++;
  }

  recordRequestFailure() {
    this.metrics.requests.failed++;
  }

  recordBackendRequest() {
    this.metrics.backend.requests++;
  }

  recordBackendFailure() {
    this.metrics.backend.failures++;
  }

  recordBackendLatency(durationMs) {
    this.metrics.backend.totalLatency += durationMs;
  }

  recordRateLimitAllowed() {
    this.metrics.rateLimit.allowed++;
  }

  recordRateLimitRejected() {
    this.metrics.rateLimit.rejected++;
  }

  getMetrics() {
    const backendRequests = this.metrics.backend.requests;

    return {
      requests: {
        ...this.metrics.requests,
      },

      backend: {
        ...this.metrics.backend,
        averageLatency:
          backendRequests === 0
            ? 0
            : this.metrics.backend.totalLatency / backendRequests,
      },

      rateLimit: {
        ...this.metrics.rateLimit,
      },
    };
  }

  reset() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
      },

      backend: {
        requests: 0,
        failures: 0,
        totalLatency: 0,
      },

      rateLimit: {
        allowed: 0,
        rejected: 0,
      },
    };
  }
}