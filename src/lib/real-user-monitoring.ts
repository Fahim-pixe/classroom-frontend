import type { Metric } from "web-vitals";
import { API_ENDPOINTS, BACKEND_BASE_URL, PERFORMANCE_CONFIG } from "@/constants";

const reportAttemptsByMetric = new Map<string, number>();

const canReport = () => {
  if (!PERFORMANCE_CONFIG.realUserMonitoring.enabled || !BACKEND_BASE_URL) {
    return false;
  }

  return !PERFORMANCE_CONFIG.realUserMonitoring.productionOnly || import.meta.env.PROD;
};

const reportMetric = (metric: Metric) => {
  const reportAttempts = reportAttemptsByMetric.get(metric.name) ?? 0;

  if (reportAttempts >= PERFORMANCE_CONFIG.realUserMonitoring.maximumReportsPerMetric) {
    return;
  }

  reportAttemptsByMetric.set(metric.name, reportAttempts + 1);

  void fetch(`${BACKEND_BASE_URL}${API_ENDPOINTS.MONITORING.WEB_VITALS}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    }),
    keepalive: true,
  }).catch(() => {
    // Monitoring must never interrupt an academic workflow when telemetry is unavailable.
  });
};

const loadReporter = async () => {
  const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import("web-vitals");

  onCLS(reportMetric);
  onFCP(reportMetric);
  onINP(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);
};

export const initializeRealUserMonitoring = () => {
  if (typeof window === "undefined" || !canReport()) {
    return;
  }

  const scheduleReporterLoad = () => {
    window.setTimeout(() => {
      void loadReporter().catch(() => {
        // The optional analytics module is intentionally non-blocking.
      });
    }, PERFORMANCE_CONFIG.realUserMonitoring.deferredLoadTimeoutMilliseconds);
  };

  if (document.readyState === "complete") {
    scheduleReporterLoad();
    return;
  }

  window.addEventListener("load", scheduleReporterLoad, { once: true });
};
