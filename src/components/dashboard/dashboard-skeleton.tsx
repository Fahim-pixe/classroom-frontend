import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DASHBOARD_SKELETON_IDS = ["one", "two", "three", "four"] as const;
const DASHBOARD_CONTENT_SKELETON_IDS = ["primary", "secondary"] as const;

type DashboardSkeletonProps = {
  variant: "admin" | "student";
};

export function DashboardSkeleton({ variant }: DashboardSkeletonProps) {
  const isAdmin = variant === "admin";

  return (
    <div className="min-h-full space-y-6 bg-background px-1 pb-10 text-foreground sm:space-y-8 sm:px-2" aria-busy="true" aria-live="polite">
      <section className="flex flex-col gap-4 pt-2 sm:gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-9 w-56 sm:h-12 sm:w-80" />
          <Skeleton className="h-5 w-full max-w-128" />
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
          <Skeleton className="h-11 w-full sm:w-28" />
          <Skeleton className="h-11 w-full sm:w-32" />
        </div>
      </section>

      {isAdmin && (
        <section className="space-y-4 border-b border-border pb-6 sm:pb-8">
          <Skeleton className="h-7 w-36" />
          <div className="grid gap-3 lg:grid-cols-3 sm:gap-4">
            {DASHBOARD_CONTENT_SKELETON_IDS.map((id) => (
              <Skeleton key={id} className="h-24 w-full sm:h-28" />
            ))}
            <Skeleton className="hidden h-24 w-full lg:block sm:h-28" />
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {DASHBOARD_SKELETON_IDS.map((id) => (
          <Card key={id} className="overflow-hidden">
            <CardContent className="space-y-4 p-4 sm:space-y-6 sm:p-6">
              <Skeleton className="h-4 w-20 sm:h-5 sm:w-28" />
              <Skeleton className="h-8 w-16 sm:h-10 sm:w-20" />
              <Skeleton className="h-4 w-24 sm:w-32" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2 sm:gap-6">
        {DASHBOARD_CONTENT_SKELETON_IDS.map((id) => (
          <Card key={id} className="overflow-hidden">
            <CardHeader className="space-y-2 border-b border-border pb-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-4 pt-5 sm:pt-6">
              <Skeleton className="h-20 w-full sm:h-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-4/5" />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
