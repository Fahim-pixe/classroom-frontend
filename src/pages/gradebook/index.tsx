import { useMemo, useState } from "react";
import { useCustom, useGetIdentity } from "@refinedev/core";
import { Award, BookOpen, Users } from "lucide-react";

import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_ENDPOINTS } from "@/constants";
import type { GradebookEntry, User } from "@/types";

type AcademicClass = {
  id: number;
  name: string;
  subjectCode: string;
  subjectName: string;
};

type AcademicMetrics = {
  evaluationCount: number;
  gradedStudents: number;
  earnedPoints: number;
  possiblePoints: number;
  percentage: number | null;
};

type AcademicSummary = {
  class: AcademicClass;
  metrics: AcademicMetrics;
};

type AcademicClassesPayload = {
  data?: AcademicClass[];
};

type AcademicSummaryPayload = AcademicSummary & {
  data?: AcademicSummary;
};

type GradebookPayload = {
  data?: GradebookEntry[];
};

type CustomQueryResponse<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
};

const GradebookPage = () => {
  const { data: currentUser } = useGetIdentity<User>();
  const isStudent = currentUser?.role === "student";
  const { data: classesResponse, isLoading: classesLoading, isError: classesError } = useCustom({
    url: API_ENDPOINTS.ACADEMIC_RECORDS.CLASSES,
    method: "get",
    queryOptions: { retry: 1 },
  }) as unknown as CustomQueryResponse<AcademicClassesPayload>;

  const availableClasses = useMemo(() => {
    const classesPayload = classesResponse?.data as AcademicClassesPayload | AcademicClass[] | undefined;
    return Array.isArray(classesPayload) ? classesPayload : classesPayload?.data ?? [];
  }, [classesResponse?.data]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const activeClassId = selectedClassId || (availableClasses[0] ? String(availableClasses[0].id) : "");

  const { data: summaryResponse, isLoading: summaryLoading, isError: summaryError } = useCustom({
    url: API_ENDPOINTS.ACADEMIC_RECORDS.SUMMARY,
    method: "get",
    config: { query: { classId: activeClassId } },
    queryOptions: { enabled: Boolean(activeClassId), retry: 1 },
  }) as unknown as CustomQueryResponse<AcademicSummaryPayload>;

  const { data: entriesResponse, isLoading: entriesLoading, isError: entriesError } = useCustom({
    url: API_ENDPOINTS.ACADEMIC_RECORDS.LIST,
    method: "get",
    config: { query: { classId: activeClassId } },
    queryOptions: { enabled: Boolean(activeClassId), retry: 1 },
  }) as unknown as CustomQueryResponse<GradebookPayload>;

  const summaryPayload = summaryResponse?.data as AcademicSummaryPayload | AcademicSummary | undefined;
  const summary = summaryPayload && "data" in summaryPayload
    ? summaryPayload.data
    : summaryPayload;
  const entriesPayload = entriesResponse?.data as GradebookPayload | GradebookEntry[] | undefined;
  const entries = Array.isArray(entriesPayload)
    ? entriesPayload
    : entriesPayload?.data ?? [];
  const selectedClass = summary?.class ?? availableClasses.find((item) => String(item.id) === activeClassId);
  const scoreLabel = summary?.metrics.percentage === null || summary?.metrics.percentage === undefined
    ? "Not available"
    : `${summary.metrics.percentage}%`;

  return (
    <ListView>
      <Breadcrumb />
      <section className="space-y-2">
        <h1 className="page-title">Academic Records</h1>
        <p className="text-muted-foreground">
          {isStudent
            ? "Review only the evaluations published for your enrolled classes."
            : "Review class-level evaluation records for the classes you are authorized to manage."}
        </p>
      </section>

      <section className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <p className="text-muted-foreground">Class record</p>
          {selectedClass ? (
            <p className="text-foreground">{selectedClass.subjectCode} · {selectedClass.name}</p>
          ) : null}
        </div>
        <Select value={activeClassId} onValueChange={setSelectedClassId} disabled={classesLoading || availableClasses.length === 0}>
          <SelectTrigger aria-label="Select an academic record">
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {availableClasses.map((classRecord) => (
              <SelectItem key={classRecord.id} value={String(classRecord.id)}>
                {classRecord.subjectCode} · {classRecord.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {classesLoading ? (
        <Card className="mt-6"><CardContent className="p-6 text-muted-foreground">Loading available academic records…</CardContent></Card>
      ) : classesError ? (
        <Card className="mt-6"><CardContent className="p-6 text-destructive">Academic Records could not be loaded. Please refresh and try again.</CardContent></Card>
      ) : availableClasses.length === 0 ? (
        <Card className="mt-6"><CardContent className="p-6 text-muted-foreground">No academic records are available for your account yet.</CardContent></Card>
      ) : (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{isStudent ? "Current standing" : "Average recorded score"}</CardTitle>
                <Award aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)] text-primary" />
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-foreground">{summaryLoading ? "Loading…" : scoreLabel}</p>
                <Progress value={summary?.metrics.percentage ?? 0} aria-label="Recorded score percentage" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Published evaluations</CardTitle>
                <BookOpen aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)] text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{summaryLoading ? "Loading…" : summary?.metrics.evaluationCount ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{isStudent ? "Points recorded" : "Students evaluated"}</CardTitle>
                <Users aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)] text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  {summaryLoading
                    ? "Loading…"
                    : isStudent
                      ? `${summary?.metrics.earnedPoints ?? 0} / ${summary?.metrics.possiblePoints ?? 0}`
                      : summary?.metrics.gradedStudents ?? 0}
                </p>
              </CardContent>
            </Card>
          </section>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recorded evaluations</CardTitle>
              {selectedClass ? <p className="text-muted-foreground">{selectedClass.subjectName}</p> : null}
            </CardHeader>
            <CardContent className="space-y-4">
              {summaryError || entriesError ? (
                <p className="text-destructive">This academic record could not be loaded. Please refresh and try again.</p>
              ) : summaryLoading || entriesLoading ? (
                <p className="text-muted-foreground">Loading recorded evaluations…</p>
              ) : entries.length === 0 ? (
                <p className="text-muted-foreground">No evaluations have been published for this class yet.</p>
              ) : (
                entries.map((entry) => (
                  <article key={entry.id} className="border-l-2 border-primary pl-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="space-y-1">
                        <p className="text-foreground">{entry.title}</p>
                        {!isStudent && entry.student ? (
                          <p className="text-muted-foreground">Student: {entry.student.name}</p>
                        ) : null}
                      </div>
                      <Badge variant="secondary">{entry.points} / {entry.maxPoints} points</Badge>
                    </div>
                    {entry.feedback ? (
                      <p className="mt-3 text-muted-foreground">Instructor feedback: {entry.feedback}</p>
                    ) : null}
                  </article>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </ListView>
  );
};

export default GradebookPage;
