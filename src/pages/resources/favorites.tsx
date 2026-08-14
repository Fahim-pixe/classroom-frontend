import { useState } from "react";
import { useList, useCustomMutation } from "@refinedev/core";
import { FileText, Film, FileSpreadsheet, ExternalLink, Heart, BookOpen, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { ResourcesListSkeleton } from "@/components/resources/resources-list-skeleton";
import { PERFORMANCE_CONFIG, RESOURCE_LIST_CONFIG } from "@/constants";

type Resource = {
  id: number;
  classId: number;
  className: string;
  subjectName: string;
  title: string;
  description?: string | null;
  category: string;
  resourceUrl: string;
  mimeType?: string | null;
  isFavorite?: boolean;
  createdAt: string;
};

const categoryLabels: Record<string, string> = {
  lecture_notes: "Lecture notes",
  videos: "Videos",
  practice: "Practice",
  references: "References",
  syllabus: "Syllabus",
  other: "Other",
};

const resourceIcon = (resource: Resource) => {
  if (resource.category === "videos" || resource.mimeType?.startsWith("video/")) return <Film className="h-5 w-5" />;
  if (resource.category === "practice") return <FileSpreadsheet className="h-5 w-5" />;
  if (resource.category === "references") return <LinkIcon className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
};

const SavedResourcesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { result: resourceResult, query: resourceQuery } = useList<Resource>({
    resource: "resources",
    pagination: {
      mode: "server",
      currentPage,
      pageSize: PERFORMANCE_CONFIG.resourcePageSize,
    },
    filters: [{
      field: RESOURCE_LIST_CONFIG.queryParams.favoritesOnly,
      operator: "eq",
      value: "true",
    }],
  });

  const { mutate: updateFavorite } = useCustomMutation();

  const savedResources: Resource[] = resourceResult.data ?? [];
  const savedResourceTotal = resourceResult.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(savedResourceTotal / PERFORMANCE_CONFIG.resourcePageSize));
  const rangeStart = savedResources.length === 0
    ? 0
    : ((currentPage - 1) * PERFORMANCE_CONFIG.resourcePageSize) + 1;
  const rangeEnd = Math.min(currentPage * PERFORMANCE_CONFIG.resourcePageSize, savedResourceTotal);
  const isLoading = resourceQuery.isLoading;
  const refetch = resourceQuery.refetch;

  const toggleFavorite = (resource: Resource) => {
    updateFavorite(
      { url: `resources/${resource.id}/favorite`, method: "post", values: {} },
      { onSuccess: () => refetch() }
    );
  };

  const openResource = (resource: Resource) => {
    window.open(resource.resourceUrl, "_blank", "noopener,noreferrer");
    updateFavorite({ url: `resources/${resource.id}/view`, method: "post", values: {} });
  };

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Saved Resources &amp; Bookmarks</h1>
      <div className="intro-row">
        <p className="text-muted-foreground">Quickly access your bookmarked lecture notes, guides, and study materials.</p>
      </div>

      <div className="mt-6">
        {!isLoading && savedResourceTotal > 0 && (
          <div className="mb-4 flex flex-col justify-between gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center">
            <span>Showing {rangeStart}–{rangeEnd} of {savedResourceTotal} saved materials</span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        {isLoading ? (
          <ResourcesListSkeleton />
        ) : savedResources.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border bg-card/50">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <BookOpen className="h-10 w-10 text-primary/60" />
              <h2 className="mt-4 text-lg font-semibold text-foreground">No saved resources yet</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Click the heart icon on any learning material across your classes to save it here for quick exam review.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {savedResources.map((resource) => (
              <Card key={resource.id} className="rounded-2xl border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {resourceIcon(resource)}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(resource)}
                      aria-label="Remove from saved"
                      className="text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      <Heart className="h-5 w-5" fill="currentColor" />
                    </button>
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-primary">
                    {resource.subjectName} • {resource.className}
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-foreground">{resource.title}</h2>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted-foreground">
                    {resource.description || "Course material"}
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {categoryLabels[resource.category] || "Material"}
                    </Badge>
                    <Button variant="outline" onClick={() => openResource(resource)} className="h-9 rounded-lg px-3 text-xs">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ListView>
  );
};

export default SavedResourcesPage;
