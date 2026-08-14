import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type EntityFormSkeletonProps = {
  fieldCount?: number;
};

/** Preserves a record-editing form's hierarchy while existing data is loaded. */
export const EntityFormSkeleton = ({ fieldCount = 6 }: EntityFormSkeletonProps) => (
  <Card aria-busy="true" aria-label="Loading form">
    <CardHeader className="space-y-2">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
    </CardHeader>
    <CardContent className="grid gap-5 sm:grid-cols-2">
      {Array.from({ length: fieldCount }, (_, index) => (
        <div key={index} className={index === fieldCount - 1 ? "sm:col-span-2" : ""}>
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="flex gap-3 sm:col-span-2">
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    </CardContent>
  </Card>
);
