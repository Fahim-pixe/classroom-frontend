import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AcademicRecordsSkeleton() {
  return (
    <div className="mt-6 space-y-4 sm:space-y-6" aria-label="Loading academic records" aria-busy="true">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-44" />
        </div>
        <Skeleton className="h-11 w-full sm:w-80" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex-row items-center justify-between space-y-0 p-4 sm:p-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-5 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
              <Skeleton className="h-7 w-20" />
              {index === 0 ? <Skeleton className="h-2 w-full" /> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-2 p-4 sm:p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
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
  );
}
