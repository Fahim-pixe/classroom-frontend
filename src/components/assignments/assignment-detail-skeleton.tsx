import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Preserves the assignment-detail reading and action hierarchy during a cold request. */
export const AssignmentDetailSkeleton = () => (
  <div className="space-y-5 sm:space-y-6" aria-busy="true" aria-label="Loading assignment details">
    <div className="space-y-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-full max-w-xl" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index}>
          <CardContent className="space-y-3 p-4 sm:p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>

    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full sm:w-36" />
      </CardContent>
    </Card>
  </div>
);
