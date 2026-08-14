import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Mirrors the profile header and account-information layout so identity loading
 * does not cause a blank page or a disruptive content shift.
 */
export const ProfileSkeleton = () => (
  <div className="space-y-5 sm:space-y-6" aria-busy="true" aria-label="Loading profile">
    <div className="space-y-2">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-full max-w-sm" />
    </div>

    <Card className="overflow-hidden">
      <Skeleton className="h-24 w-full sm:h-28" />
      <CardContent className="relative pt-0">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Skeleton className="h-20 w-20 rounded-full border-4 border-background sm:h-24 sm:w-24" />
            <div className="space-y-2 pb-1">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-52" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-44" />
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="rounded-lg border border-border bg-muted/20 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-4 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);
