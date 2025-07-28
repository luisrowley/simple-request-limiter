// limiter.js

class TokenBucket {
    constructor(burst, sustainedPerMin) {
      this.capacity = burst;
      this.tokens = burst;
      this.refillRatePerMs = sustainedPerMin / 60000;
      this.lastRefill = Date.now();
    }
  
    refill() {
      const now = Date.now();
      const elapsedMs = now - this.lastRefill;
  
      const tokensToAdd = elapsedMs * this.refillRatePerMs;
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
  
      this.lastRefill = now;
    }
  
    consume() {
      this.refill();
  
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return { accepted: true, remaining: Math.floor(this.tokens) };
      } else {
        return { accepted: false, remaining: 0 };
      }
    }
}
  
class RateLimiter {
    constructor() {
      this.buckets = new Map();
    }
  
    loadConfig(config) {
      config.rateLimitsPerEndpoint.forEach(({ endpoint, burst, sustained }) => {
        this.buckets.set(endpoint, new TokenBucket(burst, sustained));
      });
    }
  
    take(endpoint) {
      const bucket = this.buckets.get(endpoint);
      if (!bucket) {
        return { error: `No rate limit configured for endpoint: ${endpoint}` };
      }
      return bucket.consume();
    }
}
  
module.exports = new RateLimiter();
