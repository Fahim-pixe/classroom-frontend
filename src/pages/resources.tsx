import { useMemo, useState } from "react";
import { useCreate, useList, useCustomMutation } from "@refinedev/core";
import { FileText, Film, FileSpreadsheet, ExternalLink, Heart, Search, Upload, BookOpen, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetIdentity } from "@refinedev/core";

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
  lastViewedAt?: string | null;
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
  const { data: identity } = useGetIdentity<{ role?: string }>();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [classId, setClassId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [createCategory, setCreateCategory] = useState("lecture_notes");

  const filters = useMemo(() => {
    const result: { field: string; operator: "eq"; value: string }[] = [];
    if (search.trim()) result.push({ field: "search", operator: "eq", value: search.trim() });
    if (category !== "all") result.push({ field: "category", operator: "eq", value: category });
    return result;
  }, [search, category]);

  const { result: resourceResult, query: resourceQuery } = useList<Resource>({
    resource: "resources",
    pagination: { mode: "off" },
    filters,
  });
  const { result: classesResult } = useList<any>({ resource: "classes", pagination: { mode: "off" } });
  const { mutate: createResource, mutation } = useCreate();
  const { mutate: updateFavorite } = useCustomMutation();
  const resources: Resource[] = resourceResult.data ?? [];
  const isLoading = resourceQuery.isLoading;
  const isError = resourceQuery.isError;
  const refetch = resourceQuery.refetch;
  const classesData = classesResult.data ?? [];
  const canCreate = identity?.role === "teacher" || identity?.role === "admin";

  const submitCreate = (event: React.FormEvent) => {
    event.preventDefault();
    createResource(
      { resource: "resources", values: { classId: Number(classId), title, description, category: createCategory, resourceUrl, isPublished: true } },
      {
        onSuccess: () => {
          setShowCreate(false);
          setClassId(""); setTitle(""); setDescription(""); setResourceUrl("");
          refetch();
        },
      }
    );
  };

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
        <select value={classId} onChange={(event) => setClassId(event.target.value)} required className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="">Select class</option>{classesData.map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" required />
        <Input value={resourceUrl} onChange={(event) => setResourceUrl(event.target.value)} placeholder="File or link URL" type="url" required />
        <select value={createCategory} onChange={(event) => setCreateCategory(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">{Object.entries(categoryLabels).filter(([key]) => key !== "all").map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description (optional)" className="md:col-span-2" />
        <div className="flex gap-3 md:col-span-2"><Button type="submit" disabled={mutation.isPending} className="rounded-xl bg-violet-600 hover:bg-violet-700">{mutation.isPending ? "Saving…" : "Save material"}</Button><Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="rounded-xl">Cancel</Button></div>
      </form></CardContent></Card>}

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search materials…" className="h-11 rounded-xl pl-9" /></div>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">{Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      </section>

      {isError && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Resources could not be loaded. Check that the latest backend migration is deployed, then refresh.</div>}
      {isLoading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading materials…</div> : resources.length === 0 ? <Card className="rounded-2xl border-dashed border-slate-300 bg-slate-50"><CardContent className="flex flex-col items-center py-16 text-center"><BookOpen className="h-10 w-10 text-violet-400" /><h2 className="mt-4 text-lg font-semibold text-slate-900">No materials yet</h2><p className="mt-2 max-w-md text-sm text-slate-500">When a teacher adds a resource to one of your classes, it will appear here.</p></CardContent></Card> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{resources.map((resource) => <Card key={resource.id} className="rounded-2xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">{resourceIcon(resource)}</div><button type="button" onClick={() => toggleFavorite(resource)} aria-label={resource.isFavorite ? "Remove from saved" : "Save resource"} className={resource.isFavorite ? "text-rose-500" : "text-slate-300 hover:text-rose-400"}><Heart className="h-5 w-5" fill={resource.isFavorite ? "currentColor" : "none"} /></button></div><p className="mt-5 text-xs font-semibold uppercase tracking-wide text-violet-600">{resource.subjectName} · {resource.className}</p><h2 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-900">{resource.title}</h2><p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">{resource.description || "Course material"}</p><div className="mt-5 flex items-center justify-between"><span className="text-xs text-slate-400">{categoryLabels[resource.category] || "Material"}</span><Button variant="outline" onClick={() => openResource(resource)} className="h-9 rounded-lg px-3 text-xs"><ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open</Button></div></CardContent></Card>)}</div>}
    </div>
  );
}
