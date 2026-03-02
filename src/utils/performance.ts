// Web Vitals Performance Monitoring
// This utility tracks Core Web Vitals and sends them to your analytics

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number;  // Largest Contentful Paint
  FID?: number;  // First Input Delay
  CLS?: number;  // Cumulative Layout Shift
  FCP?: number;  // First Contentful Paint
  TTFB?: number; // Time to First Byte
  
  // Additional metrics
  loadTime?: number;
  domContentLoaded?: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private readonly metrics: PerformanceMetrics = {};

  private constructor() {
    this.initPerformanceObserver();
    this.captureNavigationTiming();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initPerformanceObserver() {
    if (globalThis.window === undefined || !('PerformanceObserver' in globalThis.window)) {
      return;
    }

    try {
      // Observe Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number; loadTime: number };
          this.metrics.LCP = lastEntry.renderTime || lastEntry.loadTime;
          this.reportMetric('LCP', this.metrics.LCP);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.FID = entry.processingStart - entry.startTime;
          this.reportMetric('FID', this.metrics.FID);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Observe Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.metrics.CLS = clsValue;
          }
        }
        this.reportMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Observe Navigation Timing
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.TTFB = entry.responseStart - entry.requestStart;
          if (entry.responseEnd !== undefined) {
            this.metrics.FCP = entry.responseEnd;
            if (this.metrics.FCP !== undefined) {
              this.reportMetric('FCP', this.metrics.FCP);
            }
          }
          this.reportMetric('TTFB', this.metrics.TTFB);
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });

    } catch (error) {
      console.warn('Performance Observer not fully supported:', error);
    }
  }

  private captureNavigationTiming() {
    if (globalThis.window === undefined) return;

    globalThis.window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          this.metrics.loadTime = perfData.loadEventEnd - perfData.fetchStart;
          this.metrics.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
        }
        
        console.log('📊 Performance Metrics:', {
          'Load Time': `${this.metrics.loadTime || 'N/A'}ms`,
          'DOM Content Loaded': `${this.metrics.domContentLoaded || 'N/A'}ms`,
          'LCP': this.metrics.LCP ? `${this.metrics.LCP.toFixed(2)}ms` : 'N/A',
          'FID': this.metrics.FID ? `${this.metrics.FID.toFixed(2)}ms` : 'N/A',
          'CLS': this.metrics.CLS ? this.metrics.CLS.toFixed(4) : 'N/A',
          'TTFB': this.metrics.TTFB ? `${this.metrics.TTFB.toFixed(2)}ms` : 'N/A',
        });
      }, 0);
    });
  }

  private reportMetric(name: string, value: number) {
    // Get rating based on Web Vitals thresholds
    const rating = this.getRating(name, value);
    
    console.log(`${this.getMetricEmoji(rating)} ${name}: ${value.toFixed(2)} (${rating})`);

    // Send to analytics (customize this to your needs)
    this.sendToAnalytics({ name, value, rating });
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[name];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private getMetricEmoji(rating: string): string {
    switch (rating) {
      case 'good': return '✅';
      case 'needs-improvement': return '⚠️';
      case 'poor': return '❌';
      default: return '📊';
    }
  }

  private sendToAnalytics(metric: { name: string; value: number; rating: string }) {
    // Send to your analytics service
    // Examples: Google Analytics, Vercel Analytics, custom endpoint
    
    // For Vercel Analytics (automatically included if you're on Vercel)
    if (globalThis.window !== undefined && (globalThis.window as any).va) {
      (globalThis.window as any).va('track', 'Web Vitals', metric);
    }

    // For custom endpoint - you can implement this if needed
    if (import.meta.env.PROD) {
      // Implement your custom analytics endpoint here
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public logMetrics() {
    console.table(this.metrics);
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Export a function to initialize performance monitoring
export const initPerformanceMonitoring = () => {
  return performanceMonitor;
};
