export class RateLimiter {
  private queue: (() => Promise<any>)[] = [];
  private activeRequests = 0;
  private maxRequests: number;
  private interval: number;

  constructor(maxRequests: number, interval: number) {
    this.maxRequests = maxRequests;
    this.interval = interval;
    setInterval(() => this.processQueue(), this.interval / this.maxRequests);
  }

  private processQueue() {
    if (this.activeRequests >= this.maxRequests) {
      return;
    }
    const task = this.queue.shift();
    if (task) {
      this.activeRequests++;
      console.log(`[RateLimiter] Starting request. Active: ${this.activeRequests}, Queue: ${this.queue.length}`);
      task().finally(() => {
        this.activeRequests--;
        console.log(`[RateLimiter] Finished request. Active: ${this.activeRequests}, Queue: ${this.queue.length}`);
      });
    }
  }

  public schedule<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedTask = () => task().then(resolve).catch(reject);
      this.queue.push(wrappedTask);
      console.log(`[RateLimiter] Queued request. Queue size: ${this.queue.length}`);
      this.processQueue();
    });
  }
} 