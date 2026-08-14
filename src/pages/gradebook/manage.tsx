import { useMemo, useState } from "react";
import { useCustom, useCustomMutation, useList, useNotification } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, Download, History, Plus, Users } from "lucide-react";

import { GradeAssessmentsSkeleton } from "@/components/gradebook/grade-assessments-skeleton";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { API_ENDPOINTS, API_RESPONSE_POLICY, BACKEND_BASE_URL, GRADEBOOK_WORKFLOW_CONFIG, ROUTES } from "@/constants";
import { useMutationFeedback } from "@/hooks/use-mutation-feedback";
import { getRoutePrefetchedData } from "@/lib/route-data-preload";
import type { GradebookCategory, GradebookEntry, GradebookEntryAudit, User } from "@/types";

type AcademicClass = {
  id: number;
  name: string;
  subjectCode: string;
  subjectName: string;
};

type AcademicClassesPayload = { data?: AcademicClass[] };
type GradebookPayload = { data?: GradebookEntry[] };
type GradebookCategoriesPayload = { data?: GradebookCategory[] };
type GradebookAuditPayload = { data?: GradebookEntryAudit[] };
type GradebookSummaryPayload = { data?: { metrics?: { weightedPercentage?: number | null } } };

type GradeAssessmentsPrefetchPayload = {
  classes?: { data: AcademicClassesPayload };
  students?: { data: User[]; total: number };
};

type CustomQueryResponse<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  query: { refetch: () => unknown };
};

const isWholeNumber = (value: number) => Number.isInteger(value);

const GradeAssessmentsPage = () => {
  const queryClient = useQueryClient();
  const prefetchedGradeAssessments = getRoutePrefetchedData<GradeAssessmentsPrefetchPayload>(queryClient, ROUTES.GRADE_ASSESSMENTS);
  const { open: notify } = useNotification();
  const { execute } = useMutationFeedback();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("");
  const [maxPoints, setMaxPoints] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isReleased, setIsReleased] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [categoryWeight, setCategoryWeight] = useState("");
  const [auditEntryId, setAuditEntryId] = useState<number | null>(null);

  const classesQuery = useCustom({
    url: API_ENDPOINTS.ACADEMIC_RECORDS.CLASSES,
    method: "get",
    queryOptions: { retry: 1, initialData: prefetchedGradeAssessments?.classes },
  }) as unknown as CustomQueryResponse<AcademicClassesPayload>;
  const classesPayload = classesQuery.data?.data as AcademicClassesPayload | AcademicClass[] | undefined;
  const availableClasses = useMemo(
    () => (Array.isArray(classesPayload) ? classesPayload : classesPayload?.data ?? []),
    [classesPayload],
  );
  const activeClassId = selectedClassId || (availableClasses[0] ? String(availableClasses[0].id) : "");
  const usesPrefetchedClass = activeClassId !== "" && String(availableClasses[0]?.id) === activeClassId;

  const { query: rosterQuery } = useList<User>({
    resource: activeClassId ? API_ENDPOINTS.ACADEMIC_RECORDS.CLASS_USERS(activeClassId) : "",
    filters: [{ field: "role", operator: "eq", value: "student" }],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: Boolean(activeClassId),
      initialData: usesPrefetchedClass ? prefetchedGradeAssessments?.students : undefined,
    },
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

  const categoriesQuery = useCustom({
    url: API_ENDPOINTS.ACADEMIC_RECORDS.CATEGORIES,
    method: "get",
    config: { query: { classId: activeClassId } },
    queryOptions: { enabled: Boolean(activeClassId), retry: 1 },
  }) as unknown as CustomQueryResponse<GradebookCategoriesPayload>;
  const categoriesPayload = categoriesQuery.data?.data as GradebookCategoriesPayload | GradebookCategory[] | undefined;
  const categories = Array.isArray(categoriesPayload) ? categoriesPayload : categoriesPayload?.data ?? [];

  const summaryQuery = useCustom({
    url: API_ENDPOINTS.ACADEMIC_RECORDS.SUMMARY,
    method: "get",
    config: { query: { classId: activeClassId } },
    queryOptions: { enabled: Boolean(activeClassId), retry: 1 },
  }) as unknown as CustomQueryResponse<GradebookSummaryPayload>;
  const summaryPayload = summaryQuery.data?.data as GradebookSummaryPayload | undefined;
  const weightedPercentage = summaryPayload?.data?.metrics?.weightedPercentage;

  const auditQuery = useCustom({
    url: auditEntryId === null ? "" : API_ENDPOINTS.ACADEMIC_RECORDS.AUDIT(auditEntryId),
    method: "get",
    queryOptions: { enabled: auditEntryId !== null, retry: 1 },
  }) as unknown as CustomQueryResponse<GradebookAuditPayload>;
  const auditPayload = auditQuery.data?.data as GradebookAuditPayload | GradebookEntryAudit[] | undefined;
  const auditRows = Array.isArray(auditPayload) ? auditPayload : auditPayload?.data ?? [];

  const { mutateAsync: createGrade, mutation: createGradeMutation } = useCustomMutation();
  const { mutateAsync: createCategory, mutation: createCategoryMutation } = useCustomMutation();
  const { mutateAsync: updateRelease, mutation: releaseMutation } = useCustomMutation();

  const clearForm = () => {
    setStudentId("");
    setCategoryId("");
    setTitle("");
    setPoints("");
    setMaxPoints("");
    setFeedback("");
    setIsReleased(true);
  };

  const refreshGradebook = async () => {
    await Promise.all([gradesQuery.query.refetch(), summaryQuery.query.refetch()]);
  };

  const submitGrade = async () => {
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

    try {
      await execute({
        action: () => createGrade({
          url: API_ENDPOINTS.ACADEMIC_RECORDS.LIST,
          method: "post",
          values: {
            classId: Number(activeClassId),
            studentId,
            categoryId: categoryId ? Number(categoryId) : null,
            title: title.trim(),
            points: earnedPoints,
            maxPoints: totalPoints,
            feedback: feedback.trim() || null,
            isReleased,
          },
        }),
        labels: {
          pending: "Recording assessment…",
          success: "Assessment recorded",
          successDescription: "The student’s academic record has been updated.",
          error: "Unable to record assessment",
          errorDescription: "Please review the assessment details and try again.",
        },
        onSuccess: async () => {
          clearForm();
          await refreshGradebook();
        },
      });
    } catch {
      // The shared feedback layer has already announced the failure and retry action.
    }
  };

  const submitCategory = async () => {
    const weight = Number(categoryWeight);
    if (!activeClassId || !categoryTitle.trim() || !isWholeNumber(weight) || weight < GRADEBOOK_WORKFLOW_CONFIG.category.minimumWeight || weight > GRADEBOOK_WORKFLOW_CONFIG.category.maximumWeight) {
      notify?.({ type: "error", message: GRADEBOOK_WORKFLOW_CONFIG.copy.categoryError, description: GRADEBOOK_WORKFLOW_CONFIG.copy.categoryErrorDescription });
      return;
    }

    try {
      await execute({
        action: () => createCategory({
          url: API_ENDPOINTS.ACADEMIC_RECORDS.CATEGORIES,
          method: "post",
          values: { classId: Number(activeClassId), title: categoryTitle.trim(), weight },
        }),
        labels: {
          pending: GRADEBOOK_WORKFLOW_CONFIG.copy.categoryPending,
          success: GRADEBOOK_WORKFLOW_CONFIG.copy.categorySuccess,
          error: GRADEBOOK_WORKFLOW_CONFIG.copy.categoryError,
          errorDescription: GRADEBOOK_WORKFLOW_CONFIG.copy.categoryErrorDescription,
        },
        onSuccess: async () => {
          setCategoryTitle("");
          setCategoryWeight("");
          await Promise.all([categoriesQuery.query.refetch(), summaryQuery.query.refetch()]);
        },
      });
    } catch {
      // The shared feedback layer has already announced the failure and retry action.
    }
  };

  const toggleRelease = async (grade: GradebookEntry) => {
    const nextIsReleased = !(grade.isReleased ?? true);
    try {
      await execute({
        action: () => updateRelease({
          url: API_ENDPOINTS.ACADEMIC_RECORDS.RELEASE(grade.id),
          method: "patch",
          values: { isReleased: nextIsReleased },
        }),
        labels: {
          pending: GRADEBOOK_WORKFLOW_CONFIG.copy.releasePending,
          success: GRADEBOOK_WORKFLOW_CONFIG.copy.releaseSuccess,
          error: GRADEBOOK_WORKFLOW_CONFIG.copy.releaseError,
          errorDescription: GRADEBOOK_WORKFLOW_CONFIG.copy.releaseErrorDescription,
        },
        onSuccess: refreshGradebook,
      });
    } catch {
      // The shared feedback layer has already announced the failure and retry action.
    }
  };

  const downloadExport = async () => {
    if (!activeClassId) return;

    try {
      await execute({
        action: async () => {
          const query = new URLSearchParams({ classId: activeClassId });
          const response = await fetch(`${BACKEND_BASE_URL}${API_ENDPOINTS.ACADEMIC_RECORDS.EXPORT}?${query.toString()}`, {
            credentials: API_RESPONSE_POLICY.credentials,
          });
          if (!response.ok) throw new Error(GRADEBOOK_WORKFLOW_CONFIG.copy.exportError);

          const blobUrl = URL.createObjectURL(await response.blob());
          const anchor = document.createElement("a");
          anchor.href = blobUrl;
          anchor.download = "";
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          URL.revokeObjectURL(blobUrl);
        },
        labels: {
          pending: GRADEBOOK_WORKFLOW_CONFIG.copy.exportPending,
          success: GRADEBOOK_WORKFLOW_CONFIG.copy.exportSuccess,
          error: GRADEBOOK_WORKFLOW_CONFIG.copy.exportError,
          errorDescription: GRADEBOOK_WORKFLOW_CONFIG.copy.exportErrorDescription,
        },
      });
    } catch {
      // The shared feedback layer has already announced the failure and retry action.
    }
  };

  const changeClass = (value: string) => {
    setSelectedClassId(value);
    setAuditEntryId(null);
    clearForm();
  };

  return (
    <ListView>
      <Breadcrumb />
      <section className="space-y-2">
        <h1 className="page-title">Grades &amp; Assessments</h1>
        <p className="text-muted-foreground">Record, release, and audit class assessments for the classes you are authorized to manage.</p>
      </section>

      <section className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-muted-foreground">Assessment class</p>
          <p className="truncate text-foreground">{availableClasses.find((item) => String(item.id) === activeClassId)?.subjectCode ?? "Select a class"}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Select value={activeClassId} onValueChange={changeClass} disabled={classesQuery.isLoading || availableClasses.length === 0}>
            <SelectTrigger aria-label="Select a class for assessment grading" className="w-full sm:w-80"><SelectValue placeholder="Select a class" /></SelectTrigger>
            <SelectContent>
              {availableClasses.map((classRecord) => <SelectItem key={classRecord.id} value={String(classRecord.id)}>{classRecord.subjectCode} · {classRecord.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={() => void downloadExport()} disabled={!activeClassId}>
            <Download className="h-(--icon-size-button) w-(--icon-size-button)" aria-hidden="true" />
            {GRADEBOOK_WORKFLOW_CONFIG.copy.export}
          </Button>
        </div>
      </section>

      {classesQuery.isLoading ? (
        <GradeAssessmentsSkeleton />
      ) : classesQuery.isError ? (
        <Card className="mt-5 sm:mt-6"><CardContent className="p-4 text-destructive sm:p-6">Assessment classes could not be loaded. Please refresh and try again.</CardContent></Card>
      ) : availableClasses.length === 0 ? (
        <Card className="mt-5 sm:mt-6"><CardContent className="p-4 text-muted-foreground sm:p-6">No classes are available for assessment management.</CardContent></Card>
      ) : (
        <div className="mt-5 grid gap-4 sm:mt-6 lg:grid-cols-2 lg:gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6"><CardTitle className="flex items-center gap-2"><Plus className="h-(--icon-size-button) w-(--icon-size-button)" aria-hidden="true" /> Record assessment</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="grade-student">Student</label>
                  <Select value={studentId} onValueChange={setStudentId} disabled={rosterQuery.isLoading || students.length === 0}>
                    <SelectTrigger id="grade-student"><SelectValue placeholder="Select a student" /></SelectTrigger>
                    <SelectContent>{students.map((student) => <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {!rosterQuery.isLoading && students.length === 0 ? <p className="text-sm text-muted-foreground">This class has no enrolled students.</p> : null}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="grade-category">{GRADEBOOK_WORKFLOW_CONFIG.copy.categorySelectLabel}</label>
                  <Select value={categoryId || "uncategorized"} onValueChange={(value) => setCategoryId(value === "uncategorized" ? "" : value)} disabled={categoriesQuery.isLoading}>
                    <SelectTrigger id="grade-category"><SelectValue placeholder={GRADEBOOK_WORKFLOW_CONFIG.copy.categorySelectPlaceholder} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uncategorized">{GRADEBOOK_WORKFLOW_CONFIG.copy.categorySelectPlaceholder}</SelectItem>
                      {categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.title} · {category.weight}%</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="grade-title">Assessment title</label>
                  <Input id="grade-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="For example, Midterm examination" maxLength={GRADEBOOK_WORKFLOW_CONFIG.entry.maximumTitleLength} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><label className="text-sm font-medium" htmlFor="grade-points">Points earned</label><Input id="grade-points" inputMode="numeric" value={points} onChange={(event) => setPoints(event.target.value)} placeholder="0" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium" htmlFor="grade-max-points">Maximum points</label><Input id="grade-max-points" inputMode="numeric" value={maxPoints} onChange={(event) => setMaxPoints(event.target.value)} placeholder="100" /></div>
                </div>
                <div className="space-y-2"><label className="text-sm font-medium" htmlFor="grade-feedback">Feedback</label><Textarea id="grade-feedback" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Optional feedback for the student" maxLength={GRADEBOOK_WORKFLOW_CONFIG.entry.maximumFeedbackLength} /></div>
                <label className="flex min-h-(--touch-target-minimum) items-center gap-2 text-sm font-medium" htmlFor="grade-release"><Checkbox id="grade-release" checked={isReleased} onCheckedChange={(checked) => setIsReleased(checked === true)} />{GRADEBOOK_WORKFLOW_CONFIG.copy.releaseLabel}</label>
                <Button className="w-full sm:w-auto" onClick={() => void submitGrade()} disabled={createGradeMutation.isPending || rosterQuery.isLoading || students.length === 0}>
                  <ClipboardCheck className="h-(--icon-size-button) w-(--icon-size-button)" aria-hidden="true" />
                  {createGradeMutation.isPending ? "Recording assessment…" : "Record assessment"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6"><CardTitle>{GRADEBOOK_WORKFLOW_CONFIG.copy.categoryTitle}</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
                <p className="text-sm text-muted-foreground">{GRADEBOOK_WORKFLOW_CONFIG.copy.categoryDescription}</p>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.5fr)]">
                  <div className="space-y-2"><label className="text-sm font-medium" htmlFor="grade-category-title">{GRADEBOOK_WORKFLOW_CONFIG.copy.categoryNameLabel}</label><Input id="grade-category-title" value={categoryTitle} onChange={(event) => setCategoryTitle(event.target.value)} maxLength={GRADEBOOK_WORKFLOW_CONFIG.category.maximumTitleLength} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium" htmlFor="grade-category-weight">{GRADEBOOK_WORKFLOW_CONFIG.copy.categoryWeightLabel}</label><Input id="grade-category-weight" inputMode="numeric" value={categoryWeight} onChange={(event) => setCategoryWeight(event.target.value)} /></div>
                </div>
                <Button type="button" variant="outline" onClick={() => void submitCategory()} disabled={createCategoryMutation.isPending}>{GRADEBOOK_WORKFLOW_CONFIG.copy.addCategory}</Button>
                {categoriesQuery.isError ? <p className="text-sm text-destructive">{GRADEBOOK_WORKFLOW_CONFIG.copy.categoryErrorDescription}</p> : categories.length === 0 ? <p className="text-sm text-muted-foreground">{GRADEBOOK_WORKFLOW_CONFIG.copy.categoryEmpty}</p> : <div className="flex flex-wrap gap-2">{categories.map((category) => <Badge key={category.id} variant="secondary">{category.title} · {category.weight}%</Badge>)}</div>}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 p-4 sm:p-6">
              <div className="space-y-1"><CardTitle className="flex items-center gap-2"><Users className="h-(--icon-size-button) w-(--icon-size-button)" aria-hidden="true" /> Recorded assessments</CardTitle>{weightedPercentage !== null && weightedPercentage !== undefined ? <p className="text-sm text-muted-foreground">{GRADEBOOK_WORKFLOW_CONFIG.copy.weightedAverage}: {weightedPercentage}%</p> : null}</div>
              <Badge variant="secondary">{grades.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
              {gradesQuery.isError ? <p className="text-destructive">Recorded assessments could not be loaded. Please refresh and try again.</p> : gradesQuery.isLoading ? <p className="text-muted-foreground">Loading recorded assessments…</p> : grades.length === 0 ? <p className="text-muted-foreground">No assessments have been recorded for this class yet.</p> : grades.map((grade) => (
                <article key={grade.id} className="space-y-3 border-l-2 border-primary pl-4">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"><div><p className="text-foreground">{grade.title}</p><p className="text-sm text-muted-foreground">{grade.student?.name ?? "Student"}{grade.category ? ` · ${grade.category.title}` : ""}</p></div><div className="flex flex-wrap gap-2"><Badge variant="secondary">{grade.points} / {grade.maxPoints} {GRADEBOOK_WORKFLOW_CONFIG.copy.scoreLabel.toLowerCase()}</Badge><Badge variant={grade.isReleased ?? true ? "default" : "outline"}>{grade.isReleased ?? true ? GRADEBOOK_WORKFLOW_CONFIG.copy.released : GRADEBOOK_WORKFLOW_CONFIG.copy.withheld}</Badge></div></div>
                  {grade.feedback ? <p className="text-sm text-muted-foreground">Feedback: {grade.feedback}</p> : null}
                  <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={() => void toggleRelease(grade)} disabled={releaseMutation.isPending}>{GRADEBOOK_WORKFLOW_CONFIG.copy.updateRelease}</Button><Button type="button" size="sm" variant="ghost" onClick={() => setAuditEntryId(grade.id)}><History className="h-(--icon-size-button) w-(--icon-size-button)" aria-hidden="true" />{GRADEBOOK_WORKFLOW_CONFIG.copy.auditTitle}</Button></div>
                  {auditEntryId === grade.id ? <section className="space-y-2" aria-live="polite"><p className="text-sm font-medium">{GRADEBOOK_WORKFLOW_CONFIG.copy.auditTitle}</p>{auditQuery.isLoading ? <p className="text-sm text-muted-foreground">{GRADEBOOK_WORKFLOW_CONFIG.copy.auditLoading}</p> : auditQuery.isError ? <p className="text-sm text-destructive">{GRADEBOOK_WORKFLOW_CONFIG.copy.auditError}</p> : auditRows.length === 0 ? <p className="text-sm text-muted-foreground">{GRADEBOOK_WORKFLOW_CONFIG.copy.auditEmpty}</p> : <ul className="space-y-1 text-sm text-muted-foreground">{auditRows.map((audit) => <li key={audit.id}>{audit.actor.name} · {audit.action} · {new Date(audit.createdAt).toLocaleString()}</li>)}</ul>}</section> : null}
                </article>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </ListView>
  );
};

export default GradeAssessmentsPage;
