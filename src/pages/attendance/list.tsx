import { useGetIdentity, useList } from "@refinedev/core";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, CheckCircle2, Clock, UserX, FileQuestion } from "lucide-react";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AttendanceSession, ClassDetails, User } from "@/types";

const statusConfig = {
  present: { label: "Present", icon: CheckCircle2, colorClass: "text-primary bg-primary/10 border-primary/20" },
  absent: { label: "Absent", icon: UserX, colorClass: "text-destructive bg-destructive/10 border-destructive/20" },
  late: { label: "Late", icon: Clock, colorClass: "text-muted-foreground bg-muted border-border" },
  excused: { label: "Excused", icon: FileQuestion, colorClass: "text-secondary-foreground bg-secondary border-border" },
};

const AttendanceList = () => {
  const { data: user } = useGetIdentity<User>();
  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  const { query: classesQuery } = useList<ClassDetails>({
    resource: "classes",
    pagination: { mode: "off" }
  });
  const classes = classesQuery.data?.data || [];

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const activeClassId = selectedClassId || (classes.length > 0 ? String(classes[0].id) : "");

  const { query: attendanceQuery } = useList<AttendanceSession>({
    resource: "attendance",
    filters: [{ field: "classId", operator: "eq", value: activeClassId }],
    pagination: { mode: "off" },
    queryOptions: { enabled: !!activeClassId }
  });

  const sessions = attendanceQuery.data?.data || [];

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Attendance Records</h1>
      <div className="intro-row">
        <p className="text-muted-foreground">View past attendance sessions and track participation.</p>
        <div className="actions-row">
          <Select value={activeClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-70">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={String(cls.id)}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isTeacherOrAdmin && <CreateButton resource="attendance" />}
        </div>
      </div>

      {!activeClassId ? (
        <div className="p-10 border border-dashed border-border rounded-xl text-center mt-6 bg-muted/20">
          <p className="text-muted-foreground">Select a class to view attendance records.</p>
        </div>
      ) : attendanceQuery.isLoading ? (
        <div className="p-10 text-center text-muted-foreground animate-pulse mt-6">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="p-10 border border-dashed border-border rounded-xl text-center mt-6 bg-muted/20">
          <p className="text-muted-foreground">No attendance sessions have been recorded for this class yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-6">
          {sessions.map((session) => {
            const myRecord = !isTeacherOrAdmin ? session.records.find(r => r.studentId === user?.id) : null;
            const myStatus = myRecord?.status || "absent";
            const StatusIcon = statusConfig[myStatus].icon;

            return (
              <Card key={session.id} className="shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="pb-3 flex flex-row justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">
                      {format(new Date(session.sessionDate), "MMM do, yyyy")}
                    </CardTitle>
                  </div>
                  {!isTeacherOrAdmin && myRecord && (
                    <Badge variant="outline" className={statusConfig[myStatus].colorClass}>
                      <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                      {statusConfig[myStatus].label}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {isTeacherOrAdmin ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Present</span>
                        <span className="font-medium text-foreground">{session.records.filter(r => r.status === "present").length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Absent</span>
                        <span className="font-medium text-foreground">{session.records.filter(r => r.status === "absent").length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Late / Excused</span>
                        <span className="font-medium text-foreground">
                          {session.records.filter(r => r.status === "late" || r.status === "excused").length}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      {myRecord?.note ? `Note: ${myRecord.note}` : "No specific notes for your record."}
                    </p>
                  )}
                  {session.notes && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Session Notes:</p>
                      <p className="text-sm text-foreground">{session.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </ListView>
  );
};

export default AttendanceList;
