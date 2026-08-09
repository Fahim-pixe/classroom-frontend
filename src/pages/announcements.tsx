import { useMemo, useState } from "react";
import { Megaphone, Pin, Plus, Trash2 } from "lucide-react";
import { useGetIdentity, useList, useCustomMutation } from "@refinedev/core";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotificationProvider } from "@/components/refine-ui/notification/use-notification-provider";
import { ClassDetails, User } from "@/types";

type Announcement = {
  id: number;
  classId: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  className?: string;
  author?: { id: string; name: string; image?: string | null };
};

const AnnouncementsPage = () => {
  const { data: user } = useGetIdentity<User>();
  const { open: notify } = useNotificationProvider();
  const canManage = user?.role === "teacher" || user?.role === "admin";
  const { query: classesQuery } = useList<ClassDetails>({ resource: "classes", pagination: { mode: "off" } });
  const classes = classesQuery.data?.data ?? [];
  const [selectedClassId, setSelectedClassId] = useState("");
  const activeClassId = selectedClassId || (classes[0] ? String(classes[0].id) : "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const announcementQuery = useList<Announcement>({
    resource: "announcements",
    filters: activeClassId ? [{ field: "classId", operator: "eq", value: activeClassId }] : [],
    pagination: { mode: "off" },
    queryOptions: { enabled: Boolean(activeClassId) },
  });
  const announcements = useMemo<Announcement[]>(() => (announcementQuery.query.data?.data ?? []) as Announcement[], [announcementQuery.query.data]);
  const { mutate: mutateAnnouncement, mutation } = useCustomMutation();

  const submitAnnouncement = () => {
    if (!activeClassId || !title.trim() || !content.trim()) {
      notify?.({ type: "error", message: "Select a class and provide a title and message." });
      return;
    }
    mutateAnnouncement({
      url: "announcements",
      method: "post",
      values: { classId: Number(activeClassId), title: title.trim(), content: content.trim(), isPinned },
    }, {
      onSuccess: () => {
        setTitle("");
        setContent("");
        setIsPinned(false);
        notify?.({ type: "success", message: "Announcement published." });
        announcementQuery.query.refetch();
      },
    });
  };

  const deleteAnnouncement = (announcement: Announcement) => {
    mutateAnnouncement({ url: `announcements/${announcement.id}`, method: "delete", values: {} }, {
      onSuccess: () => {
        notify?.({ type: "success", message: "Announcement deleted." });
        announcementQuery.query.refetch();
      },
    });
  };

  return (
    <ListView>
      <Breadcrumb />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="text-muted-foreground">Keep students and faculty informed with class updates.</p>
        </div>
        <Select value={activeClassId} onValueChange={setSelectedClassId}>
          <SelectTrigger className="w-full md:w-72"><SelectValue placeholder="Select a class" /></SelectTrigger>
          <SelectContent>{classes.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {canManage && activeClassId && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="size-4" /> Publish announcement</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Announcement title" maxLength={200} />
            <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write the update for this class" maxLength={5000} className="min-h-28" />
            <label className="flex items-center gap-2 text-sm text-muted-foreground"><Checkbox checked={isPinned} onCheckedChange={(checked) => setIsPinned(checked === true)} /> Pin this announcement</label>
            <Button onClick={submitAnnouncement} disabled={mutation.isPending}>{mutation.isPending ? "Publishing…" : "Publish announcement"}</Button>
          </CardContent>
        </Card>
      )}

      {!activeClassId ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">You must be enrolled in or assigned to a class to view announcements.</CardContent></Card>
      ) : announcementQuery.query.isLoading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Loading announcements…</CardContent></Card>
      ) : announcements.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No announcements have been posted for this class.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-2"><CardTitle className="flex items-center gap-2"><Megaphone className="size-4 text-primary" />{announcement.title}</CardTitle><p className="text-sm text-muted-foreground">{announcement.author?.name ?? "Class staff"} · {new Date(announcement.createdAt).toLocaleString()}</p></div>
                <div className="flex items-center gap-2">{announcement.isPinned && <Badge variant="secondary"><Pin className="mr-1 size-3" />Pinned</Badge>}{canManage && <Button variant="ghost" size="icon" aria-label={`Delete ${announcement.title}`} onClick={() => deleteAnnouncement(announcement)}><Trash2 className="size-4" /></Button>}</div>
              </CardHeader>
              <CardContent><p className="whitespace-pre-wrap text-sm text-foreground">{announcement.content}</p></CardContent>
            </Card>
          ))}
        </div>
      )}
    </ListView>
  );
};

export default AnnouncementsPage;

