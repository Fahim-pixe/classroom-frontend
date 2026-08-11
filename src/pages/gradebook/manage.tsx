import { useMemo, useState } from "react";
import { useCustom, useCustomMutation, useList, useNotification } from "@refinedev/core";
import { ClipboardCheck, Plus, Users } from "lucide-react";

import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { API_ENDPOINTS } from "@/constants";
import type { GradebookEntry, User } from "@/types";

type AcademicClass = {
  id: number;
  name: string;
  subjectCode: string;
  subjectName: string;
};

type AcademicClassesPayload = {
  data?: AcademicClass[];
};

type GradebookPayload = {
  data?: GradebookEntry[];
};

type CustomQueryResponse<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  query: {
    refetch: () => unknown;
  };
};

const isWholeNumber = (value: number) => Number.isInteger(value);

const GradeAssessmentsPage = () => {
  const { open: notify } = useNotification();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("");
  const [maxPoints, setMaxPoints] = useState("");
  const [feedback, setFeedback] = useState("");

  const classesQuery = useCustom({
    url: API_ENDPOINTS.ACADEMIC_RECORDS.CLASSES,
    method: "get",
    queryOptions: { retry: 1 },
  }) as unknown as CustomQueryResponse<AcademicClassesPayload>;
  const classesPayload = classesQuery.data?.data as AcademicClassesPayload | AcademicClass[] | undefined;
  const availableClasses = useMemo(
    () => (Array.isArray(classesPayload) ? classesPayload : classesPayload?.data ?? []),
    [classesPayload],
  );
  const activeClassId = selectedClassId || (availableClasses[0] ? String(availableClasses[0].id) : "");

  const { query: rosterQuery } = useList<User>({
    resource: activeClassId ? API_ENDPOINTS.ACADEMIC_RECORDS.CLASS_USERS(activeClassId) : "",
    filters: [{ field: "role", operator: "eq", value: "student" }],
    pagination: { mode: "off" },
    queryOptions: { enabled: Boolean(activeClassId) },
  });
  const students = useMemo(() => rosterQuery.data?.data ?? [], [rosterQuery.data?.data]);

  const gradesQuery = useCustom({
    url: API_ENDPOINTS.ACADEMIC_RECORDS.LIST,
    method: "get",
    config: { query: { classId: activeClassId } },
    queryOptions: { enabled: Boolean(activeClassId), retry: 1 },
  }) as unknown as CustomQueryResponse<GradebookPayload>;
  const gradesPayload = gradesQuery.data?.data as GradebookPayload | GradebookEntry[] | undefined;
  const grades = Array.isArray(gradesPayload) ? gradesPayload : gradesPayload?.data ?? [];

  const { mutate: createGrade, mutation } = useCustomMutation();

  const clearForm = () => {
    setStudentId("");
    setTitle("");
    setPoints("");
    setMaxPoints("");
    setFeedback("");
  };

  const submitGrade = () => {
    const earnedPoints = Number(points);
    const totalPoints = Number(maxPoints);

    if (!activeClassId || !studentId || !title.trim()) {
      notify?.({ type: "error", message: "Select a class and student, then provide an assessment title." });
      return;
    }

    if (!isWholeNumber(earnedPoints) || !isWholeNumber(totalPoints) || earnedPoints < 0 || totalPoints <= 0 || earnedPoints > totalPoints) {
      notify?.({ type: "error", message: "Enter whole-number points from zero through the assessment maximum." });
      return;
    }

    createGrade(
      {
        url: API_ENDPOINTS.ACADEMIC_RECORDS.LIST,
        method: "post",
        values: {
          classId: Number(activeClassId),
          studentId,
          title: title.trim(),
          points: earnedPoints,
          maxPoints: totalPoints,
          feedback: feedback.trim() || null,
        },
      },
      {
        onSuccess: () => {
          clearForm();
          notify?.({ type: "success", message: "Assessment grade recorded." });
          gradesQuery.query.refetch();
        },
      },
    );
  };

  return (
    <ListView>
      <Breadcrumb />
      <section className="space-y-2">
        <h1 className="page-title">Grades &amp; Assessments</h1>
        <p className="text-muted-foreground">
          Record and review class assessments for the classes you are authorized to manage.
        </p>
      </section>

      <section className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-muted-foreground">Assessment class</p>
          <p className="text-foreground">
            {availableClasses.find((item) => String(item.id) === activeClassId)?.subjectCode ?? "Select a class"}
          </p>
        </div>
        <Select value={activeClassId} onValueChange={(value) => { setSelectedClassId(value); clearForm(); }} disabled={classesQuery.isLoading || availableClasses.length === 0}>
          <SelectTrigger aria-label="Select a class for assessment grading" className="w-full md:w-80">
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

      {classesQuery.isLoading ? (
        <Card className="mt-6"><CardContent className="p-6 text-muted-foreground">Loading classes available for assessment management…</CardContent></Card>
      ) : classesQuery.isError ? (
        <Card className="mt-6"><CardContent className="p-6 text-destructive">Assessment classes could not be loaded. Please refresh and try again.</CardContent></Card>
      ) : availableClasses.length === 0 ? (
        <Card className="mt-6"><CardContent className="p-6 text-muted-foreground">No classes are available for assessment management.</CardContent></Card>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plus className="h-(--icon-size-button) w-(--icon-size-button)" aria-hidden="true" /> Record assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="grade-student">Student</label>
                <Select value={studentId} onValueChange={setStudentId} disabled={rosterQuery.isLoading || students.length === 0}>
                  <SelectTrigger id="grade-student"><SelectValue placeholder="Select a student" /></SelectTrigger>
                  <SelectContent>
                    {students.map((student) => <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {!rosterQuery.isLoading && students.length === 0 ? <p className="text-sm text-muted-foreground">This class has no enrolled students.</p> : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="grade-title">Assessment title</label>
                <Input id="grade-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="For example, Midterm examination" maxLength={200} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="grade-points">Points earned</label>
                  <Input id="grade-points" inputMode="numeric" value={points} onChange={(event) => setPoints(event.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="grade-max-points">Maximum points</label>
                  <Input id="grade-max-points" inputMode="numeric" value={maxPoints} onChange={(event) => setMaxPoints(event.target.value)} placeholder="100" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="grade-feedback">Feedback</label>
                <Textarea id="grade-feedback" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Optional feedback for the student" maxLength={5000} />
              </div>
              <Button onClick={submitGrade} disabled={mutation.isPending || rosterQuery.isLoading || students.length === 0}>
                <ClipboardCheck className="h-(--icon-size-button) w-(--icon-size-button)" aria-hidden="true" />
                {mutation.isPending ? "Recording assessment…" : "Record assessment"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2"><Users className="h-(--icon-size-button) w-(--icon-size-button)" aria-hidden="true" /> Recorded assessments</CardTitle>
              <Badge variant="secondary">{grades.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {gradesQuery.isError ? (
                <p className="text-destructive">Recorded assessments could not be loaded. Please refresh and try again.</p>
              ) : gradesQuery.isLoading ? (
                <p className="text-muted-foreground">Loading recorded assessments…</p>
              ) : grades.length === 0 ? (
                <p className="text-muted-foreground">No assessments have been recorded for this class yet.</p>
              ) : (
                grades.map((grade) => (
                  <article key={grade.id} className="border-l-2 border-primary pl-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-foreground">{grade.title}</p>
                        <p className="text-sm text-muted-foreground">{grade.student?.name ?? "Student"}</p>
                      </div>
                      <Badge variant="secondary">{grade.points} / {grade.maxPoints} points</Badge>
                    </div>
                    {grade.feedback ? <p className="mt-2 text-sm text-muted-foreground">Feedback: {grade.feedback}</p> : null}
                  </article>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </ListView>
  );
};

export default GradeAssessmentsPage;
