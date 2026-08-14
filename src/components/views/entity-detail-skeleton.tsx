import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Preserves the common record-detail hierarchy while entity data is loading. */
export const EntityDetailSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading record details">
    <section className="space-y-3">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </section>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-2 pb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-16" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  </div>
);
