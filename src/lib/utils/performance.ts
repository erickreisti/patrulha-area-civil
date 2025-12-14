interface PerformanceEntry {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceTracker {
  private entries: PerformanceEntry[] = [];
  private maxEntries = 100;

  measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();

    return fn().finally(() => {
      const duration = performance.now() - start;
      this.addEntry({ name, duration, timestamp: Date.now() });

      if (duration > 1000) {
        console.warn(`⚠️ ${name} levou ${duration.toFixed(2)}ms`);
      }
    });
  }

  private addEntry(entry: PerformanceEntry) {
    this.entries.push(entry);

    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  getStats() {
    if (this.entries.length === 0) return null;

    const durations = this.entries.map((e) => e.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const max = Math.max(...durations);
    const min = Math.min(...durations);

    return {
      totalEntries: this.entries.length,
      average: avg.toFixed(2),
      max: max.toFixed(2),
      min: min.toFixed(2),
      slowest: this.entries.find((e) => e.duration === max),
    };
  }

  clear() {
    this.entries = [];
  }
}

export const perf = new PerformanceTracker();
