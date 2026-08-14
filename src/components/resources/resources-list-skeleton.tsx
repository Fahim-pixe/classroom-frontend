import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the resources library controls and material cards during a paginated fetch. */
export const ResourcesListSkeleton = () => (
  <div className="space-y-5" aria-busy="true" aria-label="Loading learning materials">
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center">
      <Skeleton className="h-11 w-full flex-1 rounded-xl" />
      <Skeleton className="h-11 w-full rounded-xl md:w-44" />
    </div>

    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Card key={index} className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <Skeleton className="mt-5 h-3 w-32" />
            <Skeleton className="mt-3 h-6 w-4/5" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/5" />
            <div className="mt-5 flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);
