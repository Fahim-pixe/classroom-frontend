import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors roster rows so attendance staff can orient themselves while student data loads. */
export const AttendanceRosterSkeleton = () => (
  <div className="space-y-3" aria-busy="true" aria-label="Loading class roster">
    {Array.from({ length: 5 }, (_, index) => (
      <div key={index} className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <Skeleton className="h-9 w-full sm:w-52" />
      </div>
    ))}
  </div>
);
