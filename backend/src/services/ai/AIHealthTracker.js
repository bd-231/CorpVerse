class AIHealthTracker {
  constructor() {
    this.healthMap = new Map();
  }

  getHealth(providerName) {
    if (!this.healthMap.has(providerName)) {
      this.healthMap.set(providerName, {
        provider: providerName,
        status: 'HEALTHY', // HEALTHY | DEGRADED | RATE_LIMITED | TEMPORARILY_FAILED | DISABLED
        lastSuccess: null,
        lastFailure: null,
        failureCount: 0,
        rateLimitedUntil: null,
        totalRequests: 0,
        totalLatencyMs: 0,
        averageLatencyMs: 0,
      });
    }
    const state = this.healthMap.get(providerName);
    if (state.status === 'RATE_LIMITED' && state.rateLimitedUntil && Date.now() > state.rateLimitedUntil) {
      state.status = 'HEALTHY';
      state.rateLimitedUntil = null;
    }
    return state;
  }

  recordSuccess(providerName, latencyMs = 0) {
    const health = this.getHealth(providerName);
    health.lastSuccess = new Date();
    health.failureCount = 0;
    health.totalRequests += 1;
    health.totalLatencyMs += latencyMs;
    health.averageLatencyMs = Math.round(health.totalLatencyMs / health.totalRequests);
    health.status = 'HEALTHY';
  }

  recordFailure(providerName, error) {
    const health = this.getHealth(providerName);
    health.lastFailure = new Date();
    health.failureCount += 1;

    const errMsg = (error?.message || '').toLowerCase();
    if (errMsg.includes('rate limit') || errMsg.includes('429')) {
      health.status = 'RATE_LIMITED';
      health.rateLimitedUntil = Date.now() + 60000; // 1 min rate limit window
    } else if (health.failureCount >= 3) {
      health.status = 'TEMPORARILY_FAILED';
    } else {
      health.status = 'DEGRADED';
    }
  }

  setDisabled(providerName, disabled = true) {
    const health = this.getHealth(providerName);
    health.status = disabled ? 'DISABLED' : 'HEALTHY';
  }

  getAllHealth() {
    const results = {};
    for (const [key] of this.healthMap) {
      results[key] = this.getHealth(key);
    }
    return results;
  }
}

module.exports = new AIHealthTracker();
