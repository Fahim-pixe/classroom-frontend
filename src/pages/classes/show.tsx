import { AdvancedImage } from "@cloudinary/react";
import {
  useCreate,
  useGetIdentity,
  useList,
  useShow,
} from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { FormEvent, useMemo, useState } from "react";
import { useParams } from "react-router";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/refine-ui/views/show-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotificationProvider } from "@/components/refine-ui/notification/use-notification-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { bannerPhoto } from "@/lib/cloudinary";
import { ClassDetails } from "@/types";

type ClassUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
};

type Announcement = {
  id: number;
  classId: number;
  authorId: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; name: string; image?: string | null };
  className?: string;
};

type Assignment = {
  id: number;
  classId: number;
  title: string;
  description: string;
  dueAt?: string | null;
  maxPoints: number;
  submission?: {
    id: number;
    content: string;
    submittedAt: string;
    grade?: number | null;
    feedback?: string | null;
  } | null;
};

type AttendanceSession = {
  id: number;
  sessionDate: string;
  notes?: string | null;
  records: Array<{ studentId: string; status: "present" | "absent" | "late" | "excused"; student?: { name: string } }>;
};

type GradebookEntry = {
  id: number;
  studentId: string;
  title: string;
  points: number;
  maxPoints: number;
  feedback?: string | null;
  student?: { name: string; email: string };
};

const ClassesShow = () => {
  const { id } = useParams();
  const classId = id ?? "";

  const { query } = useShow<ClassDetails>({
    resource: "classes",
  });
  const { data: identity } = useGetIdentity<{ role?: string }>();
  const { open: notify } = useNotificationProvider();
  const {
    result: announcementsResult,
    query: announcementsQuery,
  } = useList<Announcement>({
    resource: "announcements",
    filters: [
      { field: "classId", operator: "eq", value: classId },
    ],
    sorters: [
      { field: "isPinned", order: "desc" },
      { field: "createdAt", order: "desc" },
    ],
    pagination: { mode: "off" },
    queryOptions: { enabled: Boolean(classId) },
  });
  const announcementsData = announcementsResult.data;
  const announcementsLoading = announcementsQuery.isLoading;
  const refetchAnnouncements = announcementsQuery.refetch;
  const {
    result: assignmentsResult,
    query: assignmentsQuery,
  } = useList<Assignment>({
    resource: "assignments",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    pagination: { mode: "off" },
    queryOptions: { enabled: Boolean(classId) },
  });
  const assignmentsData = assignmentsResult.data;
  const assignmentsLoading = assignmentsQuery.isLoading;
  const refetchAssignments = assignmentsQuery.refetch;
  const { result: attendanceResult, query: attendanceQuery } = useList<AttendanceSession>({
    resource: "attendance",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    pagination: { mode: "off" },
    queryOptions: { enabled: Boolean(classId) },
  });
  const { result: gradebookResult, query: gradebookQuery } = useList<GradebookEntry>({
    resource: "gradebook",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    pagination: { mode: "off" },
    queryOptions: { enabled: Boolean(classId) },
  });
  const attendanceData = attendanceResult.data;
  const gradebookData = gradebookResult.data;
  const { mutateAsync: createAnnouncement, mutation: announcementMutation } = useCreate<Announcement>();
  const { mutateAsync: createAssignment, mutation: assignmentMutation } = useCreate<Assignment>();
  const { mutateAsync: createSubmission, mutation: submissionMutation } = useCreate();
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementPinned, setAnnouncementPinned] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueAt, setAssignmentDueAt] = useState("");
  const [assignmentMaxPoints, setAssignmentMaxPoints] = useState("100");
  const [submissionDrafts, setSubmissionDrafts] = useState<Record<number, string>>({});

  const classDetails = query.data?.data;

  const studentColumns = useMemo<ColumnDef<ClassUser>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        size: 240,
        header: () => <p className="column-title">Student</p>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              {row.original.image && (
                <AvatarImage src={row.original.image} alt={row.original.name} />
              )}
              <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="truncate">{row.original.name}</span>
              <span className="text-xs text-muted-foreground truncate">
                {row.original.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "details",
        size: 140,
        header: () => <p className="column-title">Details</p>,
        cell: ({ row }) => (
          <ShowButton
            resource="users"
            recordItemId={row.original.id}
            variant="outline"
            size="sm"
          >
            View
          </ShowButton>
        ),
      },
    ],
    []
  );

  const handleAnnouncementSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = announcementTitle.trim();
    const content = announcementContent.trim();

    if (!title || !content) {
      notify?.({
        type: "error",
        message: "Announcement title and message are required",
        description: "Add both fields before publishing.",
      });
      return;
    }

    try {
      await createAnnouncement({
        resource: "announcements",
        values: {
          classId: Number(classId),
          title,
          content,
          isPinned: announcementPinned,
        },
      });
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setAnnouncementPinned(false);
      await refetchAnnouncements();
      notify?.({
        type: "success",
        message: "Announcement published",
      });
    } catch (error) {
      notify?.({
        type: "error",
        message: "Could not publish announcement",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleAssignmentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = assignmentTitle.trim();
    const description = assignmentDescription.trim();
    const maxPoints = Number(assignmentMaxPoints);
    if (!title || !description || !Number.isInteger(maxPoints) || maxPoints <= 0) {
      notify({ type: "error", message: "Enter a title, description, and positive points value" });
      return;
    }
    try {
      await createAssignment({
        resource: "assignments",
        values: {
          classId: Number(classId), title, description, maxPoints,
          dueAt: assignmentDueAt ? new Date(assignmentDueAt).toISOString() : null,
        },
      });
      setAssignmentTitle(""); setAssignmentDescription(""); setAssignmentDueAt(""); setAssignmentMaxPoints("100");
      await refetchAssignments();
      notify({ type: "success", message: "Assignment published" });
    } catch (error) {
      notify({ type: "error", message: "Could not publish assignment", description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const handleSubmission = async (assignmentId: number) => {
    const content = submissionDrafts[assignmentId]?.trim();
    if (!content) {
      notify({ type: "error", message: "Write a submission before sending it" });
      return;
    }
    try {
      await createSubmission({ resource: `assignments/${assignmentId}/submissions`, values: { content } });
      await refetchAssignments();
      notify({ type: "success", message: "Submission saved" });
    } catch (error) {
      notify({ type: "error", message: "Could not save submission", description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const studentsTable = useTable<ClassUser>({
    columns: studentColumns,
    refineCoreProps: {
      resource: `classes/${classId}/users`,
      pagination: {
        pageSize: 3,
        mode: "server",
      },
      filters: {
        permanent: [
          {
            field: "role",
            operator: "eq",
            value: "student",
          },
        ],
      },
    },
  });

  if (query.isLoading || query.isError || !classDetails) {
    return (
      <ShowView className="class-view class-show">
        <ShowViewHeader resource="classes" title="Class Details" />
        <p className="state-message">
          {query.isLoading
            ? "Loading class details..."
            : query.isError
            ? "Failed to load class details."
            : "Class details not found."}
        </p>
      </ShowView>
    );
  }

  const teacherName = classDetails.teacher?.name ?? "Unknown";
  const teacherInitials = teacherName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(
    teacherInitials || "NA"
  )}`;

  return (
    <ShowView className="class-view class-show space-y-6">
      <ShowViewHeader resource="classes" title="Class Details" />

      <div className="banner">
        {classDetails.bannerUrl ? (
          classDetails.bannerUrl.includes("res.cloudinary.com") &&
          classDetails.bannerCldPubId ? (
            <AdvancedImage
              cldImg={bannerPhoto(
                classDetails.bannerCldPubId ?? "",
                classDetails.name
              )}
              alt="Class Banner"
            />
          ) : (
            <img
              src={classDetails.bannerUrl}
              alt={classDetails.name}
              loading="lazy"
            />
          )
        ) : (
          <div className="placeholder" />
        )}
      </div>

      <Card className="details-card">
        {/* Class Details */}
        <div>
          <div className="details-header">
            <div>
              <h1>{classDetails.name}</h1>
              <p>{classDetails.description}</p>
            </div>

            <div>
              <Badge variant="outline">{classDetails.capacity} spots</Badge>
              <Badge
                variant={
                  classDetails.status === "active" ? "default" : "secondary"
                }
                data-status={classDetails.status}
              >
                {classDetails.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="details-grid">
            <div className="instructor">
              <p>👨‍🏫 Instructor</p>
              <div>
                <img
                  src={classDetails.teacher?.image ?? placeholderUrl}
                  alt={teacherName}
                />

                <div>
                  <p>{teacherName}</p>
                  <p>{classDetails?.teacher?.email}</p>
                </div>
              </div>
            </div>

            <div className="department">
              <p>🏛️ Department</p>

              <div>
                <p>{classDetails?.department?.name}</p>
                <p>{classDetails?.department?.description}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Subject Card */}
        <div className="subject">
          <p>📚 Subject</p>

          <div>
            <Badge variant="outline">
              Code: <span>{classDetails?.subject?.code}</span>
            </Badge>
            <p>{classDetails?.subject?.name}</p>
            <p>{classDetails?.subject?.description}</p>
          </div>
        </div>

        <Separator />

        {/* Join Class Section */}
        <div className="join">
          <h2>🎓 Join Class</h2>

          <ol>
            <li>Ask your teacher for the invite code.</li>
            <li>Click on &quot;Join Class&quot; button.</li>
            <li>Paste the code and click &quot;Join&quot;</li>
          </ol>
        </div>

        <Button size="lg" className="w-full">
          Join Class
        </Button>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {(identity?.role === "teacher" || identity?.role === "admin") && (
            <form onSubmit={handleAnnouncementSubmit} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">Post an announcement</h3>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={announcementPinned}
                    onChange={(event) => setAnnouncementPinned(event.target.checked)}
                  />
                  Pin
                </label>
              </div>
              <Input
                value={announcementTitle}
                onChange={(event) => setAnnouncementTitle(event.target.value)}
                placeholder="Announcement title"
                maxLength={200}
              />
              <textarea
                value={announcementContent}
                onChange={(event) => setAnnouncementContent(event.target.value)}
                placeholder="Share an update with this class"
                maxLength={5000}
                rows={4}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              />
              <Button type="submit" disabled={announcementMutation.isPending}>
                {announcementMutation.isPending ? "Publishing..." : "Publish announcement"}
              </Button>
            </form>
          )}

          {announcementsLoading ? (
            <p className="text-sm text-muted-foreground">Loading announcements...</p>
          ) : announcementsData?.length ? (
            <div className="space-y-3">
              {announcementsData.map((announcement) => (
                <article key={announcement.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {announcement.author?.name ?? "Class staff"} · {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {announcement.isPinned && <Badge variant="secondary">Pinned</Badge>}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{announcement.content}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No announcements have been posted for this class yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {(identity?.role === "teacher" || identity?.role === "admin") && (
            <form onSubmit={handleAssignmentSubmit} className="space-y-3 rounded-lg border p-4">
              <h3 className="font-medium">Create assignment</h3>
              <Input value={assignmentTitle} onChange={(event) => setAssignmentTitle(event.target.value)} placeholder="Assignment title" maxLength={200} />
              <textarea value={assignmentDescription} onChange={(event) => setAssignmentDescription(event.target.value)} placeholder="Instructions" rows={4} className="border-input bg-background placeholder:text-muted-foreground flex w-full rounded-md border px-3 py-2 text-sm" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input type="datetime-local" value={assignmentDueAt} onChange={(event) => setAssignmentDueAt(event.target.value)} />
                <Input type="number" min={1} value={assignmentMaxPoints} onChange={(event) => setAssignmentMaxPoints(event.target.value)} placeholder="Max points" />
              </div>
              <Button type="submit" disabled={assignmentMutation.isPending}>{assignmentMutation.isPending ? "Publishing..." : "Publish assignment"}</Button>
            </form>
          )}
          {assignmentsLoading ? <p className="text-sm text-muted-foreground">Loading assignments...</p> : assignmentsData.length ? assignmentsData.map((assignment) => (
            <article key={assignment.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{assignment.title}</h3><p className="text-xs text-muted-foreground">{assignment.dueAt ? `Due ${new Date(assignment.dueAt).toLocaleString()}` : "No due date"} · {assignment.maxPoints} points</p></div>{assignment.submission?.grade != null && <Badge variant="secondary">{assignment.submission.grade}/{assignment.maxPoints}</Badge>}</div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{assignment.description}</p>
              {identity?.role === "student" && <div className="mt-4 space-y-2"><textarea value={submissionDrafts[assignment.id] ?? assignment.submission?.content ?? ""} onChange={(event) => setSubmissionDrafts((current) => ({ ...current, [assignment.id]: event.target.value }))} placeholder="Write your submission" rows={4} className="border-input bg-background placeholder:text-muted-foreground flex w-full rounded-md border px-3 py-2 text-sm" /><Button type="button" onClick={() => handleSubmission(assignment.id)} disabled={submissionMutation.isPending}>{submissionMutation.isPending ? "Saving..." : assignment.submission ? "Update submission" : "Submit work"}</Button>{assignment.submission?.feedback && <p className="text-sm text-muted-foreground">Feedback: {assignment.submission.feedback}</p>}</div>}
            </article>
          )) : <p className="text-sm text-muted-foreground">No assignments have been posted for this class yet.</p>}
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading attendance...</p> : attendanceData.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{attendanceData.map((session) => { const counts = session.records.reduce((acc, record) => ({ ...acc, [record.status]: (acc[record.status] ?? 0) + 1 }), {} as Record<string, number>); return <article key={session.id} className="rounded-lg border p-4"><p className="font-medium">{new Date(session.sessionDate).toLocaleDateString()}</p><p className="text-sm text-muted-foreground">Present {counts.present ?? 0} · Late {counts.late ?? 0} · Absent {counts.absent ?? 0}</p>{session.notes && <p className="mt-2 text-sm text-muted-foreground">{session.notes}</p>}</article>; })}</div> : <p className="text-sm text-muted-foreground">No attendance sessions recorded yet.</p>}
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Gradebook</CardTitle>
        </CardHeader>
        <CardContent>
          {gradebookQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading grades...</p> : gradebookData.length ? <div className="space-y-3">{gradebookData.map((entry) => <article key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border p-4"><div><p className="font-medium">{entry.title}</p><p className="text-sm text-muted-foreground">{entry.student?.name ?? "Student"}{entry.feedback ? ` · ${entry.feedback}` : ""}</p></div><Badge variant="secondary">{entry.points}/{entry.maxPoints}</Badge></article>)}</div> : <p className="text-sm text-muted-foreground">No grades have been recorded yet.</p>}
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Enrolled Students</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable table={studentsTable} paginationVariant="simple" />
        </CardContent>
      </Card>
    </ShowView>
  );
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return `${parts[0][0] ?? ""}${
    parts[parts.length - 1][0] ?? ""
  }`.toUpperCase();
};

export default ClassesShow;