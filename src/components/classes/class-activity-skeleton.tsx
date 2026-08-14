import { Skeleton } from "@/components/ui/skeleton";

type ClassActivitySkeletonProps = {
  rows?: number;
};

/** Keeps class activity sections stable while their independent requests complete. */
export const ClassActivitySkeleton = ({ rows = 2 }: ClassActivitySkeletonProps) => (
  <div className="space-y-3" aria-busy="true" aria-label="Loading class activity">
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="rounded-lg border border-border p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);
