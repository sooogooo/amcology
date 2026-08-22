/**
 * Performance & Resource Load Telemetry Monitor
 * Tracks Web Vitals (FCP, TTFB, LCP), script/asset load durations, 
 * and interactive component latency (Calculators, Article Render, Audio Guide).
 */

export interface PerformanceMetric {
  name: string;
  value: number; // in milliseconds
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  details?: Record<string, any>;
}

export interface ResourceTimingInfo {
  name: string;
  initiatorType: string;
  duration: number; // ms
  transferSize?: number; // bytes
  decodedBodySize?: number;
}

class PerformanceMonitorService {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private interactionLogs: Array<{ name: string; duration: number; timestamp: number; meta?: any }> = [];
  private listeners: Set<(metrics: Map<string, PerformanceMetric>) => void> = new Set();
  private isInitialized = false;

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Navigation Timing (TTFB, DOM Interactive, Complete)
    if (window.performance && window.performance.getEntriesByType) {
      const navEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const nav = navEntries[0];
        const ttfb = Math.round(nav.responseStart - nav.requestStart);
        const domReady = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
        
        this.recordMetric('TTFB', ttfb, ttfb < 200 ? 'good' : ttfb < 500 ? 'needs-improvement' : 'poor');
        this.recordMetric('DOM_READY', domReady, domReady < 800 ? 'good' : 'needs-improvement');
      }
    }

    // 2. First Contentful Paint (FCP) Observer
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              const fcp = Math.round(entry.startTime);
              this.recordMetric('FCP', fcp, fcp < 1000 ? 'good' : fcp < 2500 ? 'needs-improvement' : 'poor', {
                startTime: entry.startTime,
              });
            }
          }
        });
        paintObserver.observe({ type: 'paint', buffered: true });
      } catch {
        // Fallback or unsupported observer
      }

      // 3. Largest Contentful Paint (LCP) Observer
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            const lcp = Math.round(lastEntry.startTime);
            this.recordMetric('LCP', lcp, lcp < 2000 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor');
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        // Safe fallback
      }
    }
  }

  public recordMetric(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor', details?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value: Math.round(value * 100) / 100,
      rating,
      timestamp: Date.now(),
      details,
    };
    this.metrics.set(name, metric);
    this.notifyListeners();
  }

  /**
   * Benchmark and measure duration of synchronous or async interaction (e.g. calculation, render)
   */
  public measureInteraction<T>(interactionName: string, fn: () => T, meta?: any): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.logInteraction(interactionName, duration, meta);
      return result;
    } catch (err) {
      const duration = performance.now() - start;
      this.logInteraction(`${interactionName}_FAILED`, duration, meta);
      throw err;
    }
  }

  public logInteraction(name: string, duration: number, meta?: any) {
    const cleanDuration = Math.round(duration * 100) / 100;
    this.interactionLogs.unshift({
      name,
      duration: cleanDuration,
      timestamp: Date.now(),
      meta,
    });
    if (this.interactionLogs.length > 50) {
      this.interactionLogs.pop();
    }
    
    // Update active metric for rapid display
    this.recordMetric(`INTERACTION_${name}`, cleanDuration, cleanDuration < 16 ? 'good' : cleanDuration < 50 ? 'needs-improvement' : 'poor', meta);
  }

  public getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  public getInteractionLogs() {
    return [...this.interactionLogs];
  }

  public getResourceTimings(): ResourceTimingInfo[] {
    if (typeof window === 'undefined' || !window.performance) return [];
    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.slice(-20).map((r) => ({
      name: r.name.split('/').pop() || r.name,
      initiatorType: r.initiatorType,
      duration: Math.round(r.duration),
      transferSize: r.transferSize,
      decodedBodySize: r.decodedBodySize,
    }));
  }

  public subscribe(cb: (metrics: Map<string, PerformanceMetric>) => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.metrics));
  }
}

export const performanceMonitor = new PerformanceMonitorService();
