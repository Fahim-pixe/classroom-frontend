import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Preserves the detailed class hierarchy before class metadata and learning activity arrive. */
export const ClassDetailSkeleton = () => (
  <div className="space-y-5 sm:space-y-6" aria-busy="true" aria-label="Loading class details">
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-40" />
    </div>

    <Skeleton className="h-36 w-full rounded-xl sm:h-48" />

    <Card>
      <CardContent className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-4/5 max-w-md" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="rounded-lg border border-border p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-5 w-36" />
              <Skeleton className="mt-2 h-3 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {Array.from({ length: 2 }, (_, index) => (
      <Card key={index}>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);
