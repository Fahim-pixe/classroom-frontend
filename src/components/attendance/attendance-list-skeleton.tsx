import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ATTENDANCE_SKELETON_IDS = ["one", "two", "three"] as const;

export function AttendanceListSkeleton({ showStudentProgress }: { showStudentProgress: boolean }) {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <section className="grid gap-4 md:grid-cols-3">
        {ATTENDANCE_SKELETON_IDS.map((id) => (
          <Card key={id}>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-5" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </section>

      {showStudentProgress ? (
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <Skeleton className="h-5 w-52" />
            {ATTENDANCE_SKELETON_IDS.map((id) => (
              <div key={id} className="space-y-3 border-l-2 border-border pl-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-52 max-w-full" />
                  </div>
                  <Skeleton className="h-6 w-14 shrink-0" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <Skeleton className="h-5 w-40" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ATTENDANCE_SKELETON_IDS.map((id) => (
              <div key={id} className="space-y-3 border-l-2 border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
