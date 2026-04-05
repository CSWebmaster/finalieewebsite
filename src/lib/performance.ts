/**
 * Core Performance Instrumentation for IEEE SOU SB
 */

export interface LatencyMetric {
  name: string;
  duration: number;
  type: "api" | "component" | "image" | "script";
  timestamp: number;
}

const metrics: LatencyMetric[] = [];

/**
 * Log a new latency metric and broadcast via custom event
 */
export const logMetric = (metric: LatencyMetric) => {
  metrics.push(metric);
  
  // Custom event for real-time monitoring components
  window.dispatchEvent(new CustomEvent('ieee_perf_metric', { detail: metric }));

  // Console output for development/auditing
  if (import.meta.env.DEV) {
    const color = metric.duration > 1000 ? '\x1b[31m' : metric.duration > 300 ? '\x1b[33m' : '\x1b[32m';
    console.log(`[PERF] ${metric.type.toUpperCase()}: ${metric.name} took ${color}${metric.duration.toFixed(2)}ms\x1b[0m`);
  }
};

/**
 * Global Fetch Interceptor
 * Intercepts all fetch calls to measure network latency
 */
export const initFetchInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const start = performance.now();
    let urlString = "unknown";
    let name = "unknown";

    try {
      if (typeof args[0] === "string") {
        urlString = args[0];
      } else if (args[0] instanceof URL) {
        urlString = args[0].toString();
      } else if (args[0] && (args[0] as Request).url) {
        urlString = (args[0] as Request).url;
      }

      const parsedUrl = new URL(urlString, window.location.origin);
      name = parsedUrl.pathname;
    } catch (e) {
      // Fallback if URL parsing fails
      if (typeof args[0] === 'string') name = args[0].substring(0, 50);
    }

    try {
      const response = await originalFetch(...args);
      const duration = performance.now() - start;
      
      logMetric({
        name: `API: ${name}`,
        duration,
        type: "api",
        timestamp: Date.now()
      });

      return response;
    } catch (error) {
      const duration = performance.now() - start;
      logMetric({
        name: `API (FAILED): ${name}`,
        duration,
        type: "api",
        timestamp: Date.now()
      });
      throw error;
    }
  };
};


/**
 * Component Mount Timer
 */
export const trackComponentMount = (name: string, duration: number) => {
  logMetric({
    name,
    duration,
    type: "component",
    timestamp: Date.now()
  });
};

/**
 * Get all collected metrics
 */
export const getMetrics = () => [...metrics];

/**
 * Summary Audit Report
 */
export const generateAuditReport = () => {
  const table = metrics.map(m => ({
    Component: m.name,
    'Load Time (ms)': m.duration.toFixed(2),
    Type: m.type,
    Category: m.duration < 100 ? 'Instant' : m.duration < 300 ? 'Fast' : m.duration < 1000 ? 'Medium' : 'Slow'
  }));
  console.table(table);
  return table;
};
