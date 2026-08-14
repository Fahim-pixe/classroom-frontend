import { type ComponentType, type RefObject, useEffect, useRef, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DASHBOARD_ANALYTICS_DELIVERY_POLICY } from "@/constants";

import type { AdminDashboardAnalyticsProps } from "./admin-dashboard-analytics";

type VisibilityGateProps = {
  onVisible: () => void;
  rootMargin: string;
  threshold: number;
  targetRef: RefObject<HTMLElement | null>;
};

const observeVisibility = ({ onVisible, rootMargin, threshold, targetRef }: VisibilityGateProps) => {
  const target = targetRef.current;
  if (!target) return () => undefined;

  if (!DASHBOARD_ANALYTICS_DELIVERY_POLICY.visibilityGatingEnabled || typeof IntersectionObserver === "undefined") {
    onVisible();
    return () => undefined;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      onVisible();
      observer.disconnect();
    },
    { rootMargin, threshold },
  );

  observer.observe(target);
  return () => observer.disconnect();
};

const DashboardAnalyticsPlaceholder = () => (
  <section className="hidden grid-cols-2 gap-6 sm:grid xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.55fr)]" aria-busy="true" aria-label="Loading academic analytics">
    <Card className="overflow-hidden shadow-sm"><CardContent className="h-80 animate-pulse p-8"><div className="h-full rounded-xl bg-muted" /></CardContent></Card>
    <Card className="overflow-hidden shadow-sm"><CardContent className="h-80 animate-pulse p-8"><div className="h-full rounded-xl bg-muted" /></CardContent></Card>
  </section>
);

const MobileAnalyticsSummary = ({ donutData, monthlyData }: AdminDashboardAnalyticsProps) => {
  if (!DASHBOARD_ANALYTICS_DELIVERY_POLICY.compactMobileSummaryEnabled) return null;

  const largestDistribution = [...donutData].sort((left, right) => right.value - left.value)[0];
  const latestTrend = monthlyData.at(-1);

  return (
    <Card className="sm:hidden">
      <CardHeader>
        <CardTitle className="text-lg">Academic analytics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-xl bg-muted p-4">
          <p className="text-muted-foreground">Largest group</p>
          <p className="mt-2 font-semibold text-foreground">{largestDistribution?.name ?? "No data"}</p>
          <p className="mt-1 text-muted-foreground">{largestDistribution ? `${largestDistribution.value} students` : ""}</p>
        </div>
        <div className="rounded-xl bg-muted p-4">
          <p className="text-muted-foreground">Latest enrollment</p>
          <p className="mt-2 font-semibold text-foreground">{latestTrend?.current ?? 0}</p>
          <p className="mt-1 text-muted-foreground">{latestTrend?.month ?? "No trend data"}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export function DeferredAdminDashboardAnalytics({ donutData, monthlyData }: AdminDashboardAnalyticsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [Analytics, setAnalytics] = useState<ComponentType<AdminDashboardAnalyticsProps> | null>(null);

  useEffect(() => observeVisibility({
    onVisible: () => setIsVisible(true),
    rootMargin: DASHBOARD_ANALYTICS_DELIVERY_POLICY.observerRootMargin,
    threshold: DASHBOARD_ANALYTICS_DELIVERY_POLICY.observerThreshold,
    targetRef: containerRef,
  }), []);

  useEffect(() => {
    if (!isVisible || Analytics) return;

    void import("./admin-dashboard-analytics").then(({ AdminDashboardAnalytics }) => {
      setAnalytics(() => AdminDashboardAnalytics);
    });
  }, [Analytics, isVisible]);

  return (
    <div ref={containerRef}>
      <MobileAnalyticsSummary donutData={donutData} monthlyData={monthlyData} />
      {Analytics ? <div className="hidden sm:block"><Analytics donutData={donutData} monthlyData={monthlyData} /></div> : <DashboardAnalyticsPlaceholder />}
    </div>
  );
}
