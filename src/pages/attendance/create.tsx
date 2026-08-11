import { useState, useEffect, useMemo } from "react";
import { useList, useCreate, useBack, useCustom, useNotification } from "@refinedev/core";
import { format } from "date-fns";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { API_ENDPOINTS } from "@/constants";
import type { User } from "@/types";

type AttendanceMark = "present" | "absent" | "late" | "excused";
type AttendanceClass = { id: number; name: string; subjectCode: string };
type AttendanceClassesPayload = { data?: AttendanceClass[] };
type CustomQueryResponse<T> = { data: T | undefined };

const AttendanceCreate = () => {
  const back = useBack();
  const { open: notify } = useNotification();

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [sessionDate, setSessionDate] = useState<string>(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [rosterMarks, setRosterMarks] = useState<Record<string, AttendanceMark>>({});

  const { data: classesResponse } = useCustom({
    url: API_ENDPOINTS.ATTENDANCE.CLASSES,
    method: "get",
    queryOptions: { retry: 1 },
  }) as unknown as CustomQueryResponse<AttendanceClassesPayload>;
  const classesPayload = classesResponse?.data as AttendanceClassesPayload | AttendanceClass[] | undefined;
  const classes = Array.isArray(classesPayload) ? classesPayload : classesPayload?.data ?? [];

  const { query: rosterQuery } = useList<User>({
    resource: selectedClassId ? API_ENDPOINTS.ATTENDANCE.CLASS_USERS(selectedClassId) : "",
    filters: [{ field: "role", operator: "eq", value: "student" }],
    pagination: { mode: "off" },
    queryOptions: { enabled: !!selectedClassId }
  });
  const students = useMemo(() => rosterQuery.data?.data || [], [rosterQuery.data?.data]);

  const { mutate: createAttendance, mutation } = useCreate();
  const isPending = mutation.isPending;

  // Automatically mark everyone present when a new roster loads
  useEffect(() => {
    if (students.length > 0) {
      const defaultMarks: Record<string, AttendanceMark> = {};
      students.forEach(student => defaultMarks[student.id] = "present");
      setRosterMarks(defaultMarks);
    } else {
      setRosterMarks({});
    }
  }, [students]);

  const handleMarkChange = (studentId: string, mark: AttendanceMark) => {
    setRosterMarks(prev => ({ ...prev, [studentId]: mark }));
  };

  const handleSubmit = () => {
    if (!selectedClassId) return notify?.({ type: "error", message: "Please select a class." });
    if (students.length === 0) return notify?.({ type: "error", message: "No students in this class to mark." });

    const records = students.map(student => ({
      studentId: student.id,
      status: rosterMarks[student.id] || "absent",
      note: ""
    }));

    createAttendance({
      resource: API_ENDPOINTS.ATTENDANCE.SESSIONS,
      values: {
        classId: Number(selectedClassId),
        sessionDate: new Date(sessionDate).toISOString(),
        notes: sessionNotes,
        records
      }
    }, {
      onSuccess: () => {
        notify?.({ type: "success", message: "Attendance session saved successfully!" });
        back();
      }
    });
  };

  const getInitials = (name = "") => name.substring(0, 2).toUpperCase();

  return (
    <CreateView className="class-view">
      <Breadcrumb />
      <h1 className="page-title">Take Attendance</h1>
      <div className="intro-row">
        <p className="text-muted-foreground">Record a new attendance session for your class.</p>
        <Button onClick={() => back()} variant="outline">Go Back</Button>
      </div>
      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader><CardTitle>Session Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Class</label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={String(cls.id)}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Session Date & Time</label>
                <Input type="datetime-local" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">General Notes</label>
                <Textarea placeholder="Optional session notes..." value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm h-fit">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Class Roster</CardTitle>
            <span className="text-sm text-muted-foreground">{students.length} students</span>
          </CardHeader>
          <CardContent>
            {!selectedClassId ? (
              <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg bg-muted/20">
                Select a class to load the roster.
              </div>
            ) : rosterQuery.isLoading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">Loading roster...</div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg bg-muted/20">
                This class currently has no enrolled students.
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {student.image && <AvatarImage src={student.image} />}
                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex bg-muted rounded-md p-1">
                      {(["present", "absent", "late", "excused"] as AttendanceMark[]).map((mark) => (
                        <button
                          key={mark}
                          onClick={() => handleMarkChange(student.id, mark)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-sm capitalize transition-colors ${
                            rosterMarks[student.id] === mark
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {mark}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="pt-6">
                  <Button onClick={handleSubmit} disabled={isPending} size="lg" className="w-full">
                    {isPending ? "Saving Session..." : "Save Attendance Session"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CreateView>
  );
};

export default AttendanceCreate;
