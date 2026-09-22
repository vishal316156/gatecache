export class HealthChecker {
  constructor({
    targets,
    loadBalancer,
    intervalMs = 5000,
    timeoutMs = 2000,
  }) {
    this.targets = targets;
    this.loadBalancer = loadBalancer;
    this.intervalMs = intervalMs;
    this.timeoutMs = timeoutMs;
    this.timer = null;
  }

  async checkTarget(target) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, this.timeoutMs);

    try {
      const response = await fetch(`${target}/health`, {
        signal: controller.signal,
      });

      if (response.ok) {
        this.loadBalancer.markHealthy(target);
        return true;
      }

      this.loadBalancer.markUnhealthy(target);
      return false;
    } catch (error) {
      this.loadBalancer.markUnhealthy(target);
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  async checkAll() {
    await Promise.all(
      this.targets.map((target) =>
        this.checkTarget(target)
      )
    );
  }

  start() {
    if (this.timer) return;

    this.checkAll();

    this.timer = setInterval(() => {
      this.checkAll();
    }, this.intervalMs);
  }

  stop() {
    if (!this.timer) return;

    clearInterval(this.timer);
    this.timer = null;
  }
}