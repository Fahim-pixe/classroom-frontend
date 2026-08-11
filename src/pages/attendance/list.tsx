import { useMemo, useState } from "react";
import { useCustom, useGetIdentity } from "@refinedev/core";
import { format } from "date-fns";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, FileQuestion, UserX, Users } from "lucide-react";

import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_ENDPOINTS, ATTENDANCE_STATUS } from "@/constants";
import type { AttendanceSession, User } from "@/types";

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

type CustomQueryResponse<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
};

const statusIcons = {
  present: CheckCircle2,
  absent: UserX,
  late: Clock,
  excused: FileQuestion,
} as const;

const AttendanceList = () => {
  const { data: currentUser } = useGetIdentity<User>();
  const isStaff = currentUser?.role === "teacher" || currentUser?.role === "admin";
  const { data: classesResponse, isLoading: classesLoading, isError: classesError } = useCustom({
    url: API_ENDPOINTS.ATTENDANCE.CLASSES,
    method: "get",
    queryOptions: { retry: 1 },
  }) as unknown as CustomQueryResponse<AttendanceClassesPayload>;

  const availableClasses = useMemo(() => {
    const payload = classesResponse?.data as AttendanceClassesPayload | AttendanceClass[] | undefined;
    return Array.isArray(payload) ? payload : payload?.data ?? [];
  }, [classesResponse?.data]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const activeClassId = selectedClassId || (availableClasses[0] ? String(availableClasses[0].id) : "");

  const { data: summaryResponse, isLoading: summaryLoading, isError: summaryError } = useCustom({
    url: API_ENDPOINTS.ATTENDANCE.SUMMARY,
    method: "get",
    config: { query: { classId: activeClassId } },
    queryOptions: { enabled: Boolean(activeClassId), retry: 1 },
  }) as unknown as CustomQueryResponse<AttendanceSummaryPayload>;

  const { data: sessionsResponse, isLoading: sessionsLoading, isError: sessionsError } = useCustom({
    url: API_ENDPOINTS.ATTENDANCE.LIST,
    method: "get",
    config: { query: { classId: activeClassId } },
    queryOptions: { enabled: Boolean(activeClassId), retry: 1 },
  }) as unknown as CustomQueryResponse<AttendanceListPayload>;

  const summaryPayload = summaryResponse?.data as AttendanceSummaryPayload | AttendanceSummary | undefined;
  const summary = summaryPayload && "data" in summaryPayload ? summaryPayload.data : summaryPayload;
  const sessionsPayload = sessionsResponse?.data as AttendanceListPayload | AttendanceSession[] | undefined;
  const sessions = Array.isArray(sessionsPayload) ? sessionsPayload : sessionsPayload?.data ?? [];
  const selectedClass = summary?.class ?? availableClasses.find((item) => String(item.id) === activeClassId);
  const attendanceLabel = summary?.metrics.attendancePercent === null || summary?.metrics.attendancePercent === undefined
    ? "Not available"
    : `${summary.metrics.attendancePercent}%`;

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
            <SelectTrigger aria-label="Select an attendance class">
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
          {isStaff ? <CreateButton resource="attendance" /> : null}
        </div>
      </section>

      {classesLoading ? (
        <Card className="mt-6"><CardContent className="p-6 text-muted-foreground">Loading available attendance classes…</CardContent></Card>
      ) : classesError ? (
        <Card className="mt-6"><CardContent className="p-6 text-destructive">Attendance classes could not be loaded. Please refresh and try again.</CardContent></Card>
      ) : availableClasses.length === 0 ? (
        <Card className="mt-6"><CardContent className="p-6 text-muted-foreground">No attendance records are available for your account yet.</CardContent></Card>
      ) : (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{isStaff ? "Class attendance" : "My attendance"}</CardTitle>
                <CheckCircle2 aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)] text-primary" />
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-foreground">{summaryLoading ? "Loading…" : attendanceLabel}</p>
                <Progress value={summary?.metrics.attendancePercent ?? 0} aria-label="Attendance percentage" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Recorded sessions</CardTitle>
                <CalendarDays aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)] text-primary" />
              </CardHeader>
              <CardContent><p className="text-foreground">{summaryLoading ? "Loading…" : summary?.metrics.sessionCount ?? 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{isStaff ? "Risk indicators" : "Attendance status"}</CardTitle>
                <AlertTriangle aria-hidden="true" className="h-[var(--icon-size-button)] w-[var(--icon-size-button)] text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  {summaryLoading
                    ? "Loading…"
                    : isStaff
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
              <CardContent className="space-y-4">
                {summary.studentProgress.map((student) => (
                  <article key={student.id} className="border-l-2 border-primary pl-4">
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

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Attendance sessions</CardTitle>
              {selectedClass ? <p className="text-muted-foreground">{selectedClass.subjectName}</p> : null}
            </CardHeader>
            <CardContent className="space-y-4">
              {summaryError || sessionsError ? (
                <p className="text-destructive">Attendance records could not be loaded. Please refresh and try again.</p>
              ) : summaryLoading || sessionsLoading ? (
                <p className="text-muted-foreground">Loading attendance sessions…</p>
              ) : sessions.length === 0 ? (
                <p className="text-muted-foreground">No attendance sessions have been recorded for this class yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {sessions.map((session) => {
                    const myRecord = !isStaff ? session.records[0] : null;
                    const status = myRecord?.status;
                    const StatusIcon = status ? statusIcons[status] : null;
                    return (
                      <article key={session.id} className="border-l-2 border-primary p-4">
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
                        {session.notes ? <p className="mt-3 text-muted-foreground">Session note: {session.notes}</p> : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </ListView>
  );
};

export default AttendanceList;
