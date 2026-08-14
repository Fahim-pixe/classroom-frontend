import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CLASS_SKELETON_IDS = ["one", "two", "three"] as const;

export function ClassesListSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>

      <section className="space-y-4">
        <Skeleton className="h-5 w-80 max-w-full" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-11 w-full sm:col-span-2" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </section>

      <div className="space-y-3 md:hidden">
        {CLASS_SKELETON_IDS.map((id) => (
          <Card key={id} className="overflow-hidden">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-14" />
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-md border md:block">
        <div className="space-y-4 p-4">
          {CLASS_SKELETON_IDS.map((id) => (
            <Skeleton key={id} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
