import { useCallback, useEffect, useMemo, useState } from "react";
import { useCreate, useList, useCustomMutation } from "@refinedev/core";
import { FileText, Film, FileSpreadsheet, ExternalLink, Heart, Search, Upload, BookOpen, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetIdentity } from "@refinedev/core";
import { API_ENDPOINTS, BACKEND_BASE_URL, OFFLINE_RESILIENCE_CONFIG, PERFORMANCE_CONFIG, RESOURCE_LIFECYCLE_CONFIG, STORAGE_CLIENT_CONFIG, UI_TOKENS } from "@/constants";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useMutationFeedback } from "@/hooks/use-mutation-feedback";
import { uploadFileToSignedUrl } from "@/lib/storage-upload";
import { ResourcesListSkeleton } from "@/components/resources/resources-list-skeleton";
import { useLocalDraft } from "@/hooks/use-local-draft";
import { ContentFreshnessNotice } from "@/components/refine-ui/layout/content-freshness-notice";

type Resource = {
  id: number;
  classId: number;
  className: string;
  subjectName: string;
  title: string;
  description?: string | null;
  category: string;
  resourceUrl: string;
  storageAssetId?: string | null;
  mimeType?: string | null;
  isFavorite?: boolean;
  lastViewedAt?: string | null;
  folder?: string | null;
  tags?: string[];
  expiresAt?: string | null;
  version?: number;
  createdAt: string;
};

const categoryLabels: Record<string, string> = {
  all: "All materials",
  lecture_notes: "Lecture notes",
  videos: "Videos",
  practice: "Practice",
  references: "References",
  syllabus: "Syllabus",
  other: "Other",
};

function resourceIcon(resource: Resource) {
  if (resource.category === "videos" || resource.mimeType?.startsWith("video/")) return <Film className="h-5 w-5" />;
  if (resource.category === "practice") return <FileSpreadsheet className="h-5 w-5" />;
  if (resource.category === "references") return <LinkIcon className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

export default function Resources() {
  const { data: identity } = useGetIdentity<{ id?: string; role?: string }>();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const canCreate = identity?.role === "teacher" || identity?.role === "admin";
  const initialResourceDraft = useMemo(() => ({
    classId: "",
    title: "",
    description: "",
    resourceUrl: "",
    category: "lecture_notes",
    folder: "",
    tags: "",
    expiresAt: "",
  }), []);
  const isResourceDraftEmpty = useCallback(
    (draft: typeof initialResourceDraft) => !draft.classId && !draft.title.trim() && !draft.description.trim() && !draft.resourceUrl.trim(),
    [],
  );
  const {
    value: resourceDraft,
    setValue: setResourceDraft,
    clear: clearResourceDraft,
    hasRecoveredDraft,
  } = useLocalDraft({
    key: `resource-form:${identity?.id ?? "pending"}`,
    initialValue: initialResourceDraft,
    enabled: canCreate && Boolean(identity?.id),
    isEmpty: isResourceDraftEmpty,
  });
  const { classId, title, description, resourceUrl, category: createCategory, folder: createFolder, tags: createTags, expiresAt: createExpiresAt } = resourceDraft;
  const setClassId = (value: string) => setResourceDraft((current) => ({ ...current, classId: value }));
  const setTitle = (value: string) => setResourceDraft((current) => ({ ...current, title: value }));
  const setDescription = (value: string) => setResourceDraft((current) => ({ ...current, description: value }));
  const setResourceUrl = (value: string) => setResourceDraft((current) => ({ ...current, resourceUrl: value }));
  const setCreateCategory = (value: string) => setResourceDraft((current) => ({ ...current, category: value }));
  const setCreateFolder = (value: string) => setResourceDraft((current) => ({ ...current, folder: value }));
  const setCreateTags = (value: string) => setResourceDraft((current) => ({ ...current, tags: value }));
  const setCreateExpiresAt = (value: string) => setResourceDraft((current) => ({ ...current, expiresAt: value }));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isResourceUploading, setIsResourceUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [revisionResourceId, setRevisionResourceId] = useState<number | null>(null);
  const [revisionFolder, setRevisionFolder] = useState("");
  const [revisionTags, setRevisionTags] = useState("");
  const [revisionExpiresAt, setRevisionExpiresAt] = useState("");
  const debouncedSearch = useDebouncedValue(
    search,
    UI_TOKENS.input.serverSearchDebounceMilliseconds,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [category, debouncedSearch]);

  const filters = useMemo(() => {
    const result: { field: string; operator: "eq"; value: string }[] = [];
    if (debouncedSearch.trim()) result.push({ field: "search", operator: "eq", value: debouncedSearch.trim() });
    if (category !== "all") result.push({ field: "category", operator: "eq", value: category });
    return result;
  }, [debouncedSearch, category]);

  const { result: resourceResult, query: resourceQuery } = useList<Resource>({
    resource: "resources",
    pagination: {
      currentPage,
      pageSize: PERFORMANCE_CONFIG.resourcePageSize,
    },
    filters,
  });
  const { result: classesResult } = useList<any>({ resource: "classes", pagination: { mode: "off" } });
  const { mutateAsync: createResource, mutation: createResourceMutation } = useCreate();
  const { mutateAsync: updateFavorite, mutation: favoriteMutation } = useCustomMutation();
  const { mutateAsync: updateResource, mutation: resourceLifecycleMutation } = useCustomMutation();
  const { execute } = useMutationFeedback();
  const resources: Resource[] = resourceResult.data ?? [];
  const resourceTotal = resourceResult.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(resourceTotal / PERFORMANCE_CONFIG.resourcePageSize));
  const rangeStart = resources.length === 0 ? 0 : ((currentPage - 1) * PERFORMANCE_CONFIG.resourcePageSize) + 1;
  const rangeEnd = Math.min(currentPage * PERFORMANCE_CONFIG.resourcePageSize, resourceTotal);
  const isLoading = resourceQuery.isLoading;
  const isError = resourceQuery.isError;
  const refetch = resourceQuery.refetch;
  const classesData = classesResult.data ?? [];
  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setUploadError("");
    let finalResourceUrl = resourceUrl.trim();
    let storageAssetId: string | undefined;

    try {
      await execute({
        action: async () => {
          if (selectedFile) {
            setIsResourceUploading(true);
            let uploadIntentId: string | null = null;
            try {
        if (!Number.isInteger(Number(classId)) || Number(classId) < 1) {
          throw new Error("Select a class before uploading a resource");
        }
        if (!STORAGE_CLIENT_CONFIG.resourceUpload.allowedMimeTypes.includes(selectedFile.type as never)) {
          throw new Error("This file type is not permitted for classroom resources");
        }
        if (selectedFile.size > STORAGE_CLIENT_CONFIG.resourceUpload.maximumBytes) {
          throw new Error("This file exceeds the configured classroom resource size limit");
        }

        const intentResponse = await fetch(`${BACKEND_BASE_URL}${API_ENDPOINTS.STORAGE.UPLOAD_INTENTS}`, {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            assetKind: STORAGE_CLIENT_CONFIG.assetKinds.resource,
            classId: Number(classId),
            fileName: selectedFile.name,
            mimeType: selectedFile.type,
            fileSizeBytes: selectedFile.size,
          }),
        });
        const intentPayload = await intentResponse.json();
        if (!intentResponse.ok) throw new Error(intentPayload.error || "Upload authorization failed");

        const intent = intentPayload.data;
        uploadIntentId = intent.uploadIntentId;
        await uploadFileToSignedUrl({
          signedUploadUrl: intent.signedUploadUrl,
          requiredHeaders: intent.requiredHeaders,
          file: selectedFile,
          onProgress: setUploadProgress,
        });

        const confirmationResponse = await fetch(`${BACKEND_BASE_URL}${API_ENDPOINTS.STORAGE.CONFIRM_UPLOAD_INTENT(intent.uploadIntentId)}`, {
          method: "POST",
          credentials: "include",
        });
        const confirmationPayload = await confirmationResponse.json();
        if (!confirmationResponse.ok || !confirmationPayload.data?.id) {
          throw new Error(confirmationPayload.error || "Uploaded file could not be verified");
        }
            storageAssetId = confirmationPayload.data.id;
            } catch (error) {
              if (uploadIntentId) {
                await fetch(`${BACKEND_BASE_URL}${API_ENDPOINTS.STORAGE.CANCEL_UPLOAD_INTENT(uploadIntentId)}`, {
                  method: "POST",
                  credentials: "include",
                }).catch(() => undefined);
              }
              throw error;
            } finally {
              setIsResourceUploading(false);
              setUploadProgress(null);
            }
          }

          if (!finalResourceUrl && !storageAssetId) throw new Error("Add a resource URL or choose a document to upload");
          return createResource({ resource: "resources", values: { classId: Number(classId), title, description, category: createCategory, resourceUrl: finalResourceUrl || undefined, storageAssetId, mimeType: selectedFile?.type, fileSizeBytes: selectedFile?.size, isPublished: true, folder: createFolder, tags: createTags.split(",").map((tag) => tag.trim()).filter(Boolean), expiresAt: createExpiresAt || null } });
        },
        labels: {
          pending: "Publishing material…",
          success: "Material published",
          successDescription: "The resource is now available to the class.",
          error: "Unable to publish material",
          errorDescription: RESOURCE_LIFECYCLE_CONFIG.copy.errorDescription,
        },
        onSuccess: async () => {
          setShowCreate(false);
          clearResourceDraft();
          setSelectedFile(null);
          await refetch();
        },
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    }
  };

  const beginRevision = (resource: Resource) => {
    setRevisionResourceId(resource.id);
    setRevisionFolder(resource.folder ?? "");
    setRevisionTags((resource.tags ?? []).join(", "));
    setRevisionExpiresAt(resource.expiresAt ? resource.expiresAt.slice(0, 10) : "");
  };

  const saveRevision = async (resource: Resource) => {
    try {
      await execute({
        action: () => updateResource({
          url: API_ENDPOINTS.RESOURCES.VERSION(resource.id),
          method: "patch",
          values: {
            title: resource.title,
            description: resource.description ?? "",
            folder: revisionFolder,
            tags: revisionTags.split(",").map((tag) => tag.trim()).filter(Boolean),
            expiresAt: revisionExpiresAt || null,
          },
        }),
        labels: {
          pending: RESOURCE_LIFECYCLE_CONFIG.copy.revisionPending,
          success: RESOURCE_LIFECYCLE_CONFIG.copy.revisionSuccess,
          error: RESOURCE_LIFECYCLE_CONFIG.copy.revisionError,
          errorDescription: RESOURCE_LIFECYCLE_CONFIG.copy.errorDescription,
        },
        onSuccess: async () => {
          setRevisionResourceId(null);
          await refetch();
        },
      });
    } catch {
      // The shared feedback layer has already announced the failure and retry action.
    }
  };

  const setArchivedState = async (resource: Resource, shouldArchive: boolean) => {
    try {
      await execute({
        action: () => updateResource({
          url: shouldArchive ? API_ENDPOINTS.RESOURCES.ARCHIVE(resource.id) : API_ENDPOINTS.RESOURCES.RESTORE(resource.id),
          method: "post",
          values: {},
        }),
        labels: shouldArchive
          ? { pending: RESOURCE_LIFECYCLE_CONFIG.copy.archivePending, success: RESOURCE_LIFECYCLE_CONFIG.copy.archiveSuccess, error: RESOURCE_LIFECYCLE_CONFIG.copy.archiveError, errorDescription: RESOURCE_LIFECYCLE_CONFIG.copy.errorDescription }
          : { pending: RESOURCE_LIFECYCLE_CONFIG.copy.restorePending, success: RESOURCE_LIFECYCLE_CONFIG.copy.restoreSuccess, error: RESOURCE_LIFECYCLE_CONFIG.copy.restoreError, errorDescription: RESOURCE_LIFECYCLE_CONFIG.copy.errorDescription },
        onSuccess: async () => {
          await refetch();
        },
      });
    } catch {
      // The shared feedback layer has already announced the failure and retry action.
    }
  };

  const toggleFavorite = async (resource: Resource) => {
    try {
      await execute({
        action: () => updateFavorite({ url: `resources/${resource.id}/favorite`, method: "post", values: {} }),
        labels: resource.isFavorite
          ? { pending: "Removing saved resource…", success: "Resource removed", successDescription: "The material is no longer in your saved resources.", error: "Unable to remove saved resource", errorDescription: "Please try again." }
          : { pending: "Saving resource…", success: "Resource saved", successDescription: "The material is available in Saved Resources.", error: "Unable to save resource", errorDescription: "Please try again." },
        onSuccess: async () => {
          await refetch();
        },
      });
    } catch {
      // The shared feedback layer has already announced the failure and retry action.
    }
  };

  const openResource = async (resource: Resource) => {
    try {
      const accessEndpoint = resource.storageAssetId
        ? API_ENDPOINTS.STORAGE.ACCESS_ASSET(resource.storageAssetId)
        : null;
      if (accessEndpoint) {
        const accessResponse = await fetch(`${BACKEND_BASE_URL}${accessEndpoint}`, { credentials: "include" });
        const accessPayload = await accessResponse.json();
        if (!accessResponse.ok || !accessPayload.data?.url) {
          throw new Error(accessPayload.error || "Resource access could not be authorized");
        }
        window.open(accessPayload.data.url, "_blank", "noopener,noreferrer");
      } else {
        window.open(resource.resourceUrl, "_blank", "noopener,noreferrer");
      }
      updateFavorite({ url: `resources/${resource.id}/view`, method: "post", values: {} });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Resource could not be opened");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Learning workspace</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Resources &amp; Materials</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-500">Find lecture notes, videos, practice material, and reference links organized by class.</p>
        </div>
        {canCreate && <Button onClick={() => setShowCreate((value) => !value)} className="h-11 rounded-xl bg-violet-600 px-5 hover:bg-violet-700"><Upload className="mr-2 h-4 w-4" /> Add material</Button>}
      </section>

      {showCreate && canCreate && <Card className="rounded-2xl border-violet-100 shadow-sm"><CardHeader><CardTitle>Add a resource link</CardTitle></CardHeader><CardContent><form onSubmit={submitCreate} className="grid gap-4 md:grid-cols-2">
        {hasRecoveredDraft && <p className="text-sm text-muted-foreground md:col-span-2" role="status">{OFFLINE_RESILIENCE_CONFIG.copy.draftRestored}</p>}
        <select value={classId} onChange={(event) => setClassId(event.target.value)} required className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="">Select class</option>{classesData.map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" required />
        <Input value={resourceUrl} onChange={(event) => setResourceUrl(event.target.value)} placeholder="File or link URL (optional when uploading)" type="url" required={!selectedFile} />
        <Input type="file" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} accept={STORAGE_CLIENT_CONFIG.resourceUpload.allowedMimeTypes.join(",")} disabled={isResourceUploading} />
        {isResourceUploading && <progress className="w-full md:col-span-2" value={uploadProgress ?? STORAGE_CLIENT_CONFIG.delivery.uploadProgressMinimumPercent} max={STORAGE_CLIENT_CONFIG.delivery.uploadProgressMaximumPercent} aria-label="Learning material upload progress" />}
        <select value={createCategory} onChange={(event) => setCreateCategory(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">{Object.entries(categoryLabels).filter(([key]) => key !== "all").map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description (optional)" className="md:col-span-2" />
        <Input value={createFolder} onChange={(event) => setCreateFolder(event.target.value)} placeholder={RESOURCE_LIFECYCLE_CONFIG.copy.folderPlaceholder} maxLength={RESOURCE_LIFECYCLE_CONFIG.metadata.maximumFolderLength} />
        <Input value={createTags} onChange={(event) => setCreateTags(event.target.value)} placeholder={RESOURCE_LIFECYCLE_CONFIG.copy.tagsPlaceholder} />
        <label className="grid gap-1 text-sm text-muted-foreground"><span>{RESOURCE_LIFECYCLE_CONFIG.copy.expiryLabel}</span><Input type="date" value={createExpiresAt} onChange={(event) => setCreateExpiresAt(event.target.value)} /></label>
        {uploadError && <p className="text-sm text-destructive md:col-span-2">{uploadError}</p>}
        <div className="flex gap-3 md:col-span-2"><Button type="submit" disabled={createResourceMutation.isPending || isResourceUploading} className="rounded-xl bg-violet-600 hover:bg-violet-700">{isResourceUploading ? `Uploading (${uploadProgress ?? STORAGE_CLIENT_CONFIG.delivery.uploadProgressMinimumPercent}%)` : createResourceMutation.isPending ? "Saving…" : "Save material"}</Button><Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="rounded-xl">Cancel</Button></div>
      </form></CardContent></Card>}

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search materials…" className="h-11 rounded-xl pl-9" /></div>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">{Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      </section>

      <ContentFreshnessNotice hasCachedContent={resources.length > 0} />
      {isError && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Resources could not be loaded. Check that the latest backend migration is deployed, then refresh.</div>}
      {!isLoading && !isError && resourceTotal > 0 && <div className="flex flex-col justify-between gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center"><span>Showing {rangeStart}–{rangeEnd} of {resourceTotal} materials</span><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>Previous</Button><Button type="button" variant="outline" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages}>Next</Button></div></div>}
      {isLoading ? <ResourcesListSkeleton /> : resources.length === 0 ? <Card className="rounded-2xl border-dashed border-slate-300 bg-slate-50"><CardContent className="flex flex-col items-center py-16 text-center"><BookOpen className="h-10 w-10 text-violet-400" /><h2 className="mt-4 text-lg font-semibold text-slate-900">No materials yet</h2><p className="mt-2 max-w-md text-sm text-slate-500">When a teacher adds a resource to one of your classes, it will appear here.</p></CardContent></Card> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{resources.map((resource) => <Card key={resource.id} className="rounded-2xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">{resourceIcon(resource)}</div><IconButton variant="ghost" onClick={() => void toggleFavorite(resource)} disabled={favoriteMutation.isPending} aria-pressed={resource.isFavorite} aria-label={resource.isFavorite ? "Remove from saved" : "Save resource"} className={resource.isFavorite ? "text-rose-500 hover:text-rose-600" : "text-muted-foreground hover:text-rose-500"}><Heart className="h-5 w-5" fill={resource.isFavorite ? "currentColor" : "none"} /></IconButton></div><p className="mt-5 text-xs font-semibold uppercase tracking-wide text-violet-600">{resource.subjectName} · {resource.className}</p><h2 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-900">{resource.title}</h2><p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">{resource.description || "Course material"}</p><div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">{resource.folder && <span>{resource.folder}</span>}{(resource.tags ?? []).map((tag) => <span key={tag}>{tag}</span>)}{resource.version && <span>{RESOURCE_LIFECYCLE_CONFIG.copy.versionPrefix} {resource.version}</span>}{resource.expiresAt && new Date(resource.expiresAt).getTime() < Date.now() && <span>{RESOURCE_LIFECYCLE_CONFIG.copy.expired}</span>}</div>{canCreate && revisionResourceId === resource.id && <div className="mt-4 grid gap-2"><Input value={revisionFolder} onChange={(event) => setRevisionFolder(event.target.value)} placeholder={RESOURCE_LIFECYCLE_CONFIG.copy.folderPlaceholder} maxLength={RESOURCE_LIFECYCLE_CONFIG.metadata.maximumFolderLength} /><Input value={revisionTags} onChange={(event) => setRevisionTags(event.target.value)} placeholder={RESOURCE_LIFECYCLE_CONFIG.copy.tagsPlaceholder} /><Input type="date" value={revisionExpiresAt} onChange={(event) => setRevisionExpiresAt(event.target.value)} aria-label={RESOURCE_LIFECYCLE_CONFIG.copy.expiryLabel} /><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => void saveRevision(resource)} disabled={resourceLifecycleMutation.isPending}>{RESOURCE_LIFECYCLE_CONFIG.copy.revise}</Button><Button type="button" variant="ghost" onClick={() => setRevisionResourceId(null)}>Cancel</Button></div></div>}<div className="mt-5 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-400">{categoryLabels[resource.category] || "Material"}</span><div className="flex gap-2"><Button variant="outline" onClick={() => openResource(resource)} className="h-9 rounded-lg px-3 text-xs"><ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open</Button>{canCreate && <Button type="button" variant="outline" onClick={() => beginRevision(resource)} disabled={resourceLifecycleMutation.isPending}>{RESOURCE_LIFECYCLE_CONFIG.copy.revise}</Button>}{canCreate && <Button type="button" variant="ghost" onClick={() => void setArchivedState(resource, true)} disabled={resourceLifecycleMutation.isPending}>{RESOURCE_LIFECYCLE_CONFIG.copy.archive}</Button>}</div></div></CardContent></Card>)}</div>}
    </div>
  );
}
