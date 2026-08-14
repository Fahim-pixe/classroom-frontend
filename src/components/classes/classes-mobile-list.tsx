import { EditButton } from "@/components/refine-ui/buttons/edit";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/constants";

type ClassMobileListItem = {
  id: number;
  name: string;
  status: "active" | "inactive" | "archived";
  bannerUrl?: string;
  subject?: {
    name: string;
  };
  teacher?: {
    name: string;
  };
  capacity: number;
};

type ClassesMobileListProps = {
  classes: ClassMobileListItem[];
  canModify: boolean;
};

export function ClassesMobileList({ classes, canModify }: ClassesMobileListProps) {
  if (classes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="font-medium text-foreground">No classes match the current filters.</p>
          <p className="mt-1 text-sm text-muted-foreground">Adjust the search or filters to view more classes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {classes.map((classItem) => (
        <Card key={classItem.id} className="overflow-hidden">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start gap-3">
              {classItem.bannerUrl ? (
                <img
                  src={classItem.bannerUrl}
                  alt="Class banner"
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                  Class
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{classItem.name}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">{classItem.subject?.name ?? "Subject not set"}</p>
              </div>

              <Badge variant={classItem.status === "active" ? "default" : "secondary"} className="shrink-0">
                {classItem.status}
              </Badge>
            </div>

            <dl className="grid grid-cols-2 gap-3 border-y border-border py-3 text-sm">
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Teacher</dt>
                <dd className="mt-1 truncate font-medium text-foreground">{classItem.teacher?.name ?? "Not assigned"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Capacity</dt>
                <dd className="mt-1 font-medium text-foreground">{classItem.capacity}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2">
              <ShowButton
                resource={API_ENDPOINTS.CLASSES.LIST}
                recordItemId={classItem.id}
                variant="outline"
                className="min-h-11 flex-1"
              >
                View class
              </ShowButton>
              {canModify && (
                <>
                  <EditButton resource={API_ENDPOINTS.CLASSES.LIST} recordItemId={classItem.id} variant="outline" className="min-h-11" />
                  <DeleteButton resource={API_ENDPOINTS.CLASSES.LIST} recordItemId={classItem.id} className="min-h-11" />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
