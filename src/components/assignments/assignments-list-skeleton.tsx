import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ASSIGNMENT_SKELETON_IDS = ["one", "two", "three"] as const;

export function AssignmentsListSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ASSIGNMENT_SKELETON_IDS.map((id) => (
          <Card key={id}>
            <CardContent className="flex items-center justify-between p-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-8" />
            </CardContent>
          </Card>
        ))}
        <Card className="hidden sm:block lg:hidden">
          <CardContent className="flex items-center justify-between p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-8" />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 overflow-hidden">
        {ASSIGNMENT_SKELETON_IDS.map((id) => <Skeleton key={id} className="h-10 w-24 shrink-0" />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {ASSIGNMENT_SKELETON_IDS.map((id) => (
          <Card key={id} className="overflow-hidden">
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-6 w-16 shrink-0" />
              </div>
              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-11 w-full sm:w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
