import { useMemo, useState } from "react";
import { useGetIdentity, useList } from "@refinedev/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListView } from "@/components/refine-ui/views/list-view";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Assignment, ClassDetails, User } from "@/types";

const STATUS_TABS = ["all", "todo", "submitted", "graded", "overdue"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const getAssignmentStatus = (assignment: Assignment): Exclude<StatusTab, "all"> => {
  const dueAt = assignment.dueAt ? new Date(assignment.dueAt).getTime() : null;
  const now = Date.now();
  if (assignment.submission?.grade !== null && assignment.submission?.grade !== undefined) return "graded";
  if (assignment.submission?.submittedAt) return "submitted";
  if (dueAt !== null && dueAt < now) return "overdue";
  return "todo";
};

const formatDueDate = (dueAt?: string | null) => {
  if (!dueAt) return "No due date";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(dueAt));
};

const getDueLabel = (dueAt?: string | null) => {
  if (!dueAt) return "No deadline";
  const due = new Date(dueAt).getTime();
  const difference = Math.ceil((due - Date.now()) / 86_400_000);
  if (difference < 0) return `${Math.abs(difference)}d overdue`;
  if (difference === 0) return "Due today";
  if (difference === 1) return "Due tomorrow";
  return `Due in ${difference}d`;
};

const AssignmentsList = () => {
  const { data: user } = useGetIdentity<User>();
  const canModify = user?.role === "admin" || user?.role === "teacher";
  const [selectedClassId, setSelectedClassId] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");

  const { query: classesQuery } = useList<ClassDetails>({
    resource: "classes",
    pagination: { mode: "off" },
  });
  const classes = classesQuery?.data?.data ?? [];
  const activeClassId = selectedClassId || (classes.length ? String(classes[0].id) : "");

  const { query: assignmentsQuery } = useList<Assignment>({
    resource: "assignments",
    pagination: { mode: "off" },
    filters: activeClassId ? [{ field: "classId", operator: "eq", value: activeClassId }] : [],
    queryOptions: { enabled: Boolean(activeClassId) },
  });
  const assignments = (assignmentsQuery?.data?.data ?? []) as Assignment[];

  const filteredAssignments = useMemo(
    () => activeTab === "all" ? assignments : assignments.filter((assignment) => getAssignmentStatus(assignment) === activeTab),
    [activeTab, assignments],
  );

  const counts = useMemo(() => STATUS_TABS.reduce<Record<string, number>>((result, tab) => {
    result[tab] = tab === "all" ? assignments.length : assignments.filter((assignment) => getAssignmentStatus(assignment) === tab).length;
    return result;
  }, {}), [assignments]);

  return (
    <ListView>
      <Breadcrumb />
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="page-title">Assignment Command Center</h1>
          <p className="text-muted-foreground">See what needs your attention and move each assignment forward.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={activeClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((classItem) => <SelectItem key={classItem.id} value={String(classItem.id)}>{classItem.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {canModify && <CreateButton resource="assignments" />}
        </div>
      </div>

      {activeClassId ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {STATUS_TABS.map((tab) => (
              <Card key={tab} className={activeTab === tab ? "border-primary" : undefined}>
                <CardContent className="flex items-center justify-between p-4">
                  <span className="text-sm font-medium capitalize text-muted-foreground">{tab}</span>
                  <span className="text-2xl font-semibold text-foreground">{counts[tab]}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Assignment status">
            {STATUS_TABS.map((tab) => (
              <Button key={tab} type="button" size="sm" variant={activeTab === tab ? "default" : "outline"} onClick={() => setActiveTab(tab)} role="tab" aria-selected={activeTab === tab}>
                {tab === "all" ? "All assignments" : tab[0].toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>

          {assignmentsQuery.isLoading ? (
            <div className="mt-8 rounded-xl border border-border p-10 text-center text-muted-foreground">Loading assignments…</div>
          ) : assignmentsQuery.isError ? (
            <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center text-destructive">Assignments could not be loaded. Refresh and try again.</div>
          ) : filteredAssignments.length ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {filteredAssignments.map((assignment) => {
                const status = getAssignmentStatus(assignment);
                return (
                  <Card key={assignment.id} className="flex flex-col">
                    <CardHeader className="gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{assignment.description}</p>
                        </div>
                        <Badge variant={status === "overdue" ? "destructive" : status === "graded" ? "default" : "secondary"}>{status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                      <div className="text-sm text-muted-foreground">
                        <p>{formatDueDate(assignment.dueAt)}</p>
                        <p>{getDueLabel(assignment.dueAt)} · {assignment.maxPoints} points</p>
                      </div>
                      <ShowButton resource="assignments" recordItemId={assignment.id} variant="outline" size="sm">Open assignment</ShowButton>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center">
              <p className="font-medium text-foreground">No assignments in this view</p>
              <p className="mt-1 text-sm text-muted-foreground">New assignments and status changes will appear here automatically.</p>
            </div>
          )}
        </>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="font-medium text-foreground">No accessible classes found</p>
          <p className="mt-1 text-sm text-muted-foreground">Join a class or ask a teacher to assign you to one before viewing assignments.</p>
        </div>
      )}
    </ListView>
  );
};

export default AssignmentsList;
