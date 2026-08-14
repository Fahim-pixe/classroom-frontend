import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function GradeAssessmentsSkeleton() {
  return (
    <div className="mt-6 space-y-4 sm:space-y-6" aria-label="Loading grade assessments" aria-busy="true">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-11 w-full sm:w-80" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-11 w-full" />
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-11 w-full sm:w-44" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 p-4 sm:p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-8" />
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2 border-l-2 border-border pl-4">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
