import { useMemo, useState } from "react";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, FileQuestion, UserX, Users } from "lucide-react";

import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { AttendanceListSkeleton } from "@/components/attendance/attendance-list-skeleton";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS, ATTENDANCE_STATUS, ATTENDANCE_WORKFLOW_CONFIG, ROUTES } from "@/constants";
import { getRoutePrefetchedData } from "@/lib/route-data-preload";
import type { AttendanceCorrection, AttendanceRecord, AttendanceSession, User } from "@/types";
import { useMutationFeedback } from "@/hooks/use-mutation-feedback";

type AttendanceClass = {
  id: number;
  name: string;
  subjectCode: string;
  subjectName: string;
};

type AttendanceMetrics = {
  sessionCount: number;
  recordCount: number;
  qualifyingCount: number;
  attendancePercent: number | null;
  riskThresholdPercent: number;
  atRisk: boolean;
  atRiskStudentCount?: number;
};

type StudentProgress = {
  id: string;
  name: string;
  qualifyingCount: number;
  recordCount: number;
  attendancePercent: number | null;
  atRisk: boolean;
};

type AttendanceSummary = {
  class: AttendanceClass;
  metrics: AttendanceMetrics;
  studentProgress: StudentProgress[];
};

type AttendanceClassesPayload = { data?: AttendanceClass[] };
type AttendanceSummaryPayload = AttendanceSummary & { data?: AttendanceSummary };
type AttendanceListPayload = { data?: AttendanceSession[] };
type AttendanceCorrectionsPayload = { data?: AttendanceCorrection[] };
type AttendanceMark = AttendanceRecord["status"];
type CorrectionDraft = { requestedStatus: AttendanceMark; reason: string };

type CustomQueryResponse<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch?: () => Promise<unknown>;
};

type PrefetchedAttendanceData = {
  classes?: { data: AttendanceClassesPayload };
  summary?: { data: AttendanceSummaryPayload };
  sessions?: { data: AttendanceListPayload };
};

const statusIcons = {
  present: CheckCircle2,
  absent: UserX,
  late: Clock,
  excused: FileQuestion,
} as const;

const AttendanceList = () => {
  const { data: currentUser } = useGetIdentity<User>();
  const queryClient = useQueryClient();
  const prefetchedAttendance = getRoutePrefetchedData<PrefetchedAttendanceData>(queryClient, ROUTES.ATTENDANCE.LIST);
  const isStaff = currentUser?.role === "teacher" || currentUser?.role === "admin";
  const { data: classesResponse, isLoading: classesLoading, isError: classesError } = useCustom({
    url: API_ENDPOINTS.ATTENDANCE.CLASSES,
    method: "get",
    queryOptions: { retry: 1, initialData: prefetchedAttendance?.classes },
  }) as unknown as CustomQueryResponse<AttendanceClassesPayload>;

  const availableClasses = useMemo(() => {
    const payload = classesResponse?.data as AttendanceClassesPayload | AttendanceClass[] | undefined;
    return Array.isArray(payload) ? payload : payload?.data ?? [];
  }, [classesResponse?.data]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [correctionDrafts, setCorrectionDrafts] = useState<Record<number, CorrectionDraft>>({});
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});
  const { execute } = useMutationFeedback();
  const { mutateAsync: submitCorrection, mutation: correctionMutation } = useCustomMutation();
  const { mutateAsync: reviewCorrection, mutation: reviewMutation } = useCustomMutation();
  const activeClassId = selectedClassId || (availableClasses[0] ? String(availableClasses[0].id) : "");
  const prefetchedClassId = availableClasses[0] ? String(availableClasses[0].id) : "";
  const usePrefetchedClassData = Boolean(activeClassId && activeClassId === prefetchedClassId);

  const { data: summaryResponse, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = useCustom({
    url: API_ENDPOINTS.ATTENDANCE.SUMMARY,
    method: "get",
    config: { query: { classId: activeClassId } },
    queryOptions: {
      enabled: Boolean(activeClassId),
      retry: 1,
      initialData: usePrefetchedClassData ? prefetchedAttendance?.summary : undefined,
    },
  }) as unknown as CustomQueryResponse<AttendanceSummaryPayload>;

  const { data: sessionsResponse, isLoading: sessionsLoading, isError: sessionsError, refetch: refetchSessions } = useCustom({
    url: API_ENDPOINTS.ATTENDANCE.LIST,
    method: "get",
    config: { query: { classId: activeClassId } },
    queryOptions: {
      enabled: Boolean(activeClassId),
      retry: 1,
      initialData: usePrefetchedClassData ? prefetchedAttendance?.sessions : undefined,
    },
  }) as unknown as CustomQueryResponse<AttendanceListPayload>;

  const { data: correctionsResponse, isLoading: correctionsLoading, isError: correctionsError, refetch: refetchCorrections } = useCustom({
    url: API_ENDPOINTS.ATTENDANCE.CORRECTIONS,
    method: "get",
    config: { query: { classId: activeClassId } },
    queryOptions: { enabled: Boolean(activeClassId), retry: 1 },
  }) as unknown as CustomQueryResponse<AttendanceCorrectionsPayload>;

  const summaryPayload = summaryResponse?.data as AttendanceSummaryPayload | AttendanceSummary | undefined;
  const summary = summaryPayload && "data" in summaryPayload ? summaryPayload.data : summaryPayload;
  const sessionsPayload = sessionsResponse?.data as AttendanceListPayload | AttendanceSession[] | undefined;
  const sessions = Array.isArray(sessionsPayload) ? sessionsPayload : sessionsPayload?.data ?? [];
  const correctionsPayload = correctionsResponse?.data as AttendanceCorrectionsPayload | AttendanceCorrection[] | undefined;
  const corrections = Array.isArray(correctionsPayload) ? correctionsPayload : correctionsPayload?.data ?? [];
  const correctionsByRecordId = useMemo(
    () => new Map(corrections.map((correction) => [correction.attendanceRecordId, correction])),
    [corrections],
  );
  const pendingCorrections = useMemo(
    () => corrections.filter((correction) => correction.status === "pending"),
    [corrections],
  );
  const selectedClass = summary?.class ?? availableClasses.find((item) => String(item.id) === activeClassId);
  const attendanceLabel = summary?.metrics.attendancePercent === null || summary?.metrics.attendancePercent === undefined
    ? "Not available"
    : `${summary.metrics.attendancePercent}%`;
  const refreshAttendanceData = async () => {
    await Promise.all([refetchSummary?.(), refetchSessions?.(), refetchCorrections?.()]);
  };
  const getCorrectionDraft = (recordId: number): CorrectionDraft => correctionDrafts[recordId] ?? { requestedStatus: "present", reason: "" };
  const updateCorrectionDraft = (recordId: number, update: Partial<CorrectionDraft>) => {
    setCorrectionDrafts((current) => ({ ...current, [recordId]: { ...getCorrectionDraft(recordId), ...update } }));
  };
  const handleCorrectionRequest = async (recordId: number) => {
    const draft = getCorrectionDraft(recordId);
    if (!draft.reason.trim()) return;
    try {
      await execute({
        action: () => submitCorrection({
          url: API_ENDPOINTS.ATTENDANCE.CORRECTIONS,
          method: "post",
          values: { attendanceRecordId: recordId, requestedStatus: draft.requestedStatus, reason: draft.reason.trim() },
        }),
        labels: {
          pending: ATTENDANCE_WORKFLOW_CONFIG.correction.copy.requestPending,
          success: ATTENDANCE_WORKFLOW_CONFIG.correction.copy.requestSuccess,
          successDescription: ATTENDANCE_WORKFLOW_CONFIG.correction.copy.requestSuccessDescription,
          error: ATTENDANCE_WORKFLOW_CONFIG.correction.copy.requestError,
          errorDescription: ATTENDANCE_WORKFLOW_CONFIG.correction.copy.requestErrorDescription,
        },
        onSuccess: async () => {
          setCorrectionDrafts((current) => {
            const next = { ...current };
            delete next[recordId];
            return next;
          });
          await refreshAttendanceData();
        },
      });
    } catch {
      // The shared mutation feedback surface already provides an accessible retry action.
    }
  };
  const handleCorrectionReview = async (correction: AttendanceCorrection, decision: "approved" | "rejected") => {
    try {
      await execute({
        action: () => reviewCorrection({
          url: API_ENDPOINTS.ATTENDANCE.CORRECTION_BY_ID(correction.id),
          method: "patch",
          values: { decision, reviewNote: reviewNotes[correction.id]?.trim() || undefined },
        }),
        labels: {
          pending: ATTENDANCE_WORKFLOW_CONFIG.correction.copy.reviewPending,
          success: ATTENDANCE_WORKFLOW_CONFIG.correction.copy.reviewSuccess,
          successDescription: ATTENDANCE_WORKFLOW_CONFIG.correction.copy.reviewSuccessDescription,
          error: ATTENDANCE_WORKFLOW_CONFIG.correction.copy.reviewError,
          errorDescription: ATTENDANCE_WORKFLOW_CONFIG.correction.copy.reviewErrorDescription,
        },
        onSuccess: async () => {
          setReviewNotes((current) => {
            const next = { ...current };
            delete next[correction.id];
            return next;
          });
          await refreshAttendanceData();
        },
      });
    } catch {
      // The shared mutation feedback surface already provides an accessible retry action.
    }
  };

  return (
    <ListView>
      <Breadcrumb />
      <section className="space-y-2">
        <h1 className="page-title">Progress & Attendance</h1>
        <p className="text-muted-foreground">
          {isStaff
            ? "Monitor class participation and review attendance risk indicators from recorded sessions."
            : "Review your attendance progress and each published session record."}
        </p>
      </section>

      <section className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <p className="text-muted-foreground">Class attendance</p>
          {selectedClass ? <p className="text-foreground">{selectedClass.subjectCode} · {selectedClass.name}</p> : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={activeClassId} onValueChange={setSelectedClassId} disabled={classesLoading || availableClasses.length === 0}>
            <SelectTrigger className="min-h-11 w-full sm:w-72" aria-label="Select an attendance class">
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
          {isStaff ? <CreateButton resource="attendance" className="min-h-11 w-full sm:w-auto" /> : null}
        </div>
      </section>

      {classesLoading ? (
        <div className="mt-6"><AttendanceListSkeleton showStudentProgress={isStaff} /></div>
      ) : classesError ? (
        <Card className="mt-6"><CardContent className="p-6 text-destructive">Attendance classes could not be loaded. Please refresh and try again.</CardContent></Card>
      ) : availableClasses.length === 0 ? (
        <Card className="mt-6"><CardContent className="p-6 text-muted-foreground">No attendance records are available for your account yet.</CardContent></Card>
      ) : (
        summaryLoading || sessionsLoading ? (
          <div className="mt-6"><AttendanceListSkeleton showStudentProgress={isStaff} /></div>
        ) : (
          <>
          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{isStaff ? "Class attendance" : "My attendance"}</CardTitle>
                <CheckCircle2 aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)] text-primary" />
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-foreground">{attendanceLabel}</p>
                <Progress value={summary?.metrics.attendancePercent ?? 0} aria-label="Attendance percentage" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Recorded sessions</CardTitle>
                <CalendarDays aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)] text-primary" />
              </CardHeader>
              <CardContent><p className="text-foreground">{summary?.metrics.sessionCount ?? 0}</p></CardContent>
            </Card>
            <Card className="col-span-2 sm:col-span-1">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{isStaff ? "Risk indicators" : "Attendance status"}</CardTitle>
                <AlertTriangle aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)] text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  {isStaff
                    ? `${summary?.metrics.atRiskStudentCount ?? 0} students`
                    : summary?.metrics.atRisk
                      ? "Needs attention"
                      : "On track"}
                </p>
              </CardContent>
            </Card>
          </section>

          {isStaff && summary?.studentProgress.length ? (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Student attendance progress</CardTitle>
                <p className="text-muted-foreground">Students below the configured attendance threshold are marked for review.</p>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                {summary.studentProgress.map((student) => (
                  <article key={student.id} className="border-l-2 border-primary pl-3 sm:pl-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-foreground">{student.name}</p>
                        <p className="text-muted-foreground">{student.qualifyingCount} qualifying records from {student.recordCount} recorded sessions</p>
                      </div>
                      <Badge variant={student.atRisk ? "destructive" : "secondary"}>
                        {student.attendancePercent === null ? "Not available" : `${student.attendancePercent}%`}
                      </Badge>
                    </div>
                    <Progress className="mt-3" value={student.attendancePercent ?? 0} aria-label={`${student.name} attendance percentage`} />
                  </article>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {isStaff ? (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{ATTENDANCE_WORKFLOW_CONFIG.correction.copy.staffTitle}</CardTitle>
                <p className="text-muted-foreground">{ATTENDANCE_WORKFLOW_CONFIG.correction.copy.staffDescription}</p>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                {correctionsLoading ? (
                  <p className="text-muted-foreground" role="status">{ATTENDANCE_WORKFLOW_CONFIG.correction.copy.loading}</p>
                ) : correctionsError ? (
                  <p className="text-destructive">{ATTENDANCE_WORKFLOW_CONFIG.correction.copy.loadError}</p>
                ) : pendingCorrections.length === 0 ? (
                  <p className="text-muted-foreground">{ATTENDANCE_WORKFLOW_CONFIG.correction.copy.noPending}</p>
                ) : (
                  pendingCorrections.map((correction) => (
                    <article key={correction.id} className="space-y-3 border-l-2 border-primary p-3 sm:p-4">
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                        <div>
                          <p className="text-foreground">{correction.studentName}</p>
                          <p className="text-muted-foreground">
                            {format(new Date(correction.sessionDate), "MMM do, yyyy")} · {ATTENDANCE_STATUS[correction.currentStatus].label} to {ATTENDANCE_STATUS[correction.requestedStatus].label}
                          </p>
                        </div>
                        <Badge variant="outline">{ATTENDANCE_WORKFLOW_CONFIG.correction.copy.pendingReview}</Badge>
                      </div>
                      <p className="text-muted-foreground">{correction.reason}</p>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor={`attendance-review-note-${correction.id}`}>
                          {ATTENDANCE_WORKFLOW_CONFIG.correction.copy.reviewNoteLabel}
                        </label>
                        <Textarea
                          id={`attendance-review-note-${correction.id}`}
                          value={reviewNotes[correction.id] ?? ""}
                          maxLength={ATTENDANCE_WORKFLOW_CONFIG.correction.maximumReviewNoteLength}
                          onChange={(event) => setReviewNotes((current) => ({ ...current, [correction.id]: event.target.value }))}
                        />
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          className="w-full sm:w-auto"
                          disabled={reviewMutation.isPending}
                          onClick={() => void handleCorrectionReview(correction, ATTENDANCE_WORKFLOW_CONFIG.correction.reviewDecisions.approved)}
                        >
                          {ATTENDANCE_WORKFLOW_CONFIG.correction.copy.approve}
                        </Button>
                        <Button
                          className="w-full sm:w-auto"
                          variant="outline"
                          disabled={reviewMutation.isPending}
                          onClick={() => void handleCorrectionReview(correction, ATTENDANCE_WORKFLOW_CONFIG.correction.reviewDecisions.rejected)}
                        >
                          {ATTENDANCE_WORKFLOW_CONFIG.correction.copy.reject}
                        </Button>
                      </div>
                    </article>
                  ))
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Attendance sessions</CardTitle>
              {selectedClass ? <p className="text-muted-foreground">{selectedClass.subjectName}</p> : null}
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              {summaryError || sessionsError ? (
                <p className="text-destructive">Attendance records could not be loaded. Please refresh and try again.</p>
              ) : sessions.length === 0 ? (
                <p className="text-muted-foreground">No attendance sessions have been recorded for this class yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {sessions.map((session) => {
                    const myRecord = !isStaff ? session.records[0] : null;
                    const correction = myRecord ? correctionsByRecordId.get(myRecord.id) : undefined;
                    const correctionDraft = myRecord ? getCorrectionDraft(myRecord.id) : undefined;
                    const status = myRecord?.status;
                    const StatusIcon = status ? statusIcons[status] : null;
                    return (
                      <article key={session.id} className="border-l-2 border-primary p-3 sm:p-4">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div className="flex items-center gap-2 text-foreground">
                            <CalendarDays aria-hidden="true" className="h-[var(--icon-size-inline)] w-[var(--icon-size-inline)]" />
                            <p>{format(new Date(session.sessionDate), "MMM do, yyyy")}</p>
                          </div>
                          {status && StatusIcon ? (
                            <Badge variant="outline" className={ATTENDANCE_STATUS[status].badgeClass}>
                              <StatusIcon aria-hidden="true" className="mr-1 h-[var(--icon-size-inline)] w-[var(--icon-size-inline)]" />
                              {ATTENDANCE_STATUS[status].label}
                            </Badge>
                          ) : null}
                        </div>
                        {isStaff && session.summary ? (
                          <p className="mt-3 text-muted-foreground">
                            {session.summary.present} present · {session.summary.absent} absent · {session.summary.late + session.summary.excused} late or excused
                          </p>
                        ) : null}
                        {!isStaff && myRecord?.note ? <p className="mt-3 text-muted-foreground">Note: {myRecord.note}</p> : null}
                        {!isStaff && myRecord && correction ? (
                          <p className="mt-3 text-muted-foreground" role="status">
                            {correction.status === "pending"
                              ? ATTENDANCE_WORKFLOW_CONFIG.correction.copy.alreadyPending
                              : `${ATTENDANCE_WORKFLOW_CONFIG.correction.copy.reviewedStatePrefix} ${correction.status}.`}
                            {correction.reviewNote ? ` ${correction.reviewNote}` : ""}
                          </p>
                        ) : null}
                        {!isStaff && myRecord && !correction ? (
                          <div className="mt-4 space-y-3 border-t pt-4">
                            <div>
                              <p className="text-foreground">{ATTENDANCE_WORKFLOW_CONFIG.correction.copy.requestTitle}</p>
                              <p className="text-muted-foreground">{ATTENDANCE_WORKFLOW_CONFIG.correction.copy.requestDescription}</p>
                            </div>
                            <Select
                              value={correctionDraft?.requestedStatus}
                              onValueChange={(value) => updateCorrectionDraft(myRecord.id, { requestedStatus: value as AttendanceMark })}
                            >
                              <SelectTrigger aria-label={ATTENDANCE_WORKFLOW_CONFIG.correction.copy.requestedStatusLabel}>
                                <SelectValue placeholder={ATTENDANCE_WORKFLOW_CONFIG.correction.copy.requestedStatusLabel} />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ATTENDANCE_STATUS).map(([value, definition]) => (
                                  <SelectItem key={value} value={value}>{definition.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="space-y-2">
                              <label className="text-sm font-medium" htmlFor={`attendance-correction-reason-${myRecord.id}`}>
                                {ATTENDANCE_WORKFLOW_CONFIG.correction.copy.reasonLabel}
                              </label>
                              <Textarea
                                id={`attendance-correction-reason-${myRecord.id}`}
                                value={correctionDraft?.reason ?? ""}
                                maxLength={ATTENDANCE_WORKFLOW_CONFIG.correction.maximumReasonLength}
                                onChange={(event) => updateCorrectionDraft(myRecord.id, { reason: event.target.value })}
                              />
                            </div>
                            <Button
                              className="w-full"
                              disabled={correctionMutation.isPending || !correctionDraft?.reason.trim()}
                              onClick={() => void handleCorrectionRequest(myRecord.id)}
                            >
                              {ATTENDANCE_WORKFLOW_CONFIG.correction.copy.submitRequest}
                            </Button>
                          </div>
                        ) : null}
                        {session.notes ? <p className="mt-3 text-muted-foreground">Session note: {session.notes}</p> : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          </>
        )
      )}
    </ListView>
  );
};

export default AttendanceList;
