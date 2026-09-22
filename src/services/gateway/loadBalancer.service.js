export class RoundRobinLoadBalancer {
  constructor(targets) {
    if (!targets || targets.length === 0) {
      throw new Error("At least one target is required");
    }

    this.targets = targets.map((url) => ({
      url,
      healthy: true,
    }));

    this.currentIndex = 0;
  }

  markUnhealthy(target) {
    const server = this.targets.find(
      (item) => item.url === target
    );

    if (server) {
      server.healthy = false;
    }
  }

  markHealthy(target) {
    const server = this.targets.find(
      (item) => item.url === target
    );

    if (server) {
      server.healthy = true;
    }
  }

  next() {
    const totalTargets = this.targets.length;

    for (let i = 0; i < totalTargets; i++) {
      const target = this.targets[this.currentIndex];

      this.currentIndex =
        (this.currentIndex + 1) % totalTargets;

      if (target.healthy) {
        return target.url;
      }
    }

    throw new Error("No healthy targets available");
  }
}
