import { useMemo, useState } from "react";
import { useGetIdentity, useLink, useList } from "@refinedev/core";
import { BookOpen, CalendarDays, GraduationCap, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ClassDetails, User } from "@/types";

type TeacherDashboardProps = {
  teacher: User;
};

const formatDate = (value?: string) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const TeacherDashboard = ({ teacher }: TeacherDashboardProps) => {
  const Link = useLink();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const { query: classesQuery } = useList<ClassDetails>({
    resource: "classes",
    filters: [
      {
        field: "teacherId",
        operator: "eq",
        value: teacher.id,
      },
    ],
    pagination: {
      pageSize: 100,
    },
    queryOptions: {
      enabled: Boolean(teacher.id),
    },
  });

  const assignedClasses = classesQuery.data?.data ?? [];
  const selectedClass = useMemo(
    () =>
      assignedClasses.find((classItem) => classItem.id === selectedClassId) ??
      assignedClasses[0],
    [assignedClasses, selectedClassId]
  );

  const { query: studentsQuery } = useList<User>({
    resource: selectedClass
      ? `classes/${selectedClass.id}/users`
      : "classes/0/users",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "student",
      },
    ],
    pagination: {
      pageSize: 100,
    },
    queryOptions: {
      enabled: Boolean(selectedClass),
    },
  });

  const enrolledStudents = studentsQuery.data?.data ?? [];
  const activeClasses = assignedClasses.filter(
    (classItem) => classItem.status === "active"
  ).length;
  const subjectNames = Array.from(
    new Set(
      assignedClasses
        .map((classItem) => classItem.subject?.name)
        .filter((name): name is string => Boolean(name))
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your assigned classes and keep track of enrolled students.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={GraduationCap}
          label="Assigned classes"
          value={assignedClasses.length}
        />
        <MetricCard
          icon={BookOpen}
          label="Assigned subjects"
          value={subjectNames.length}
        />
        <MetricCard
          icon={CalendarDays}
          label="Active classes"
          value={activeClasses}
        />
        <MetricCard
          icon={UsersRound}
          label="Selected roster"
          value={enrolledStudents.length}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned subjects and classes</CardTitle>
        </CardHeader>
        <CardContent>
          {classesQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading assigned classes…</p>
          )}
          {!classesQuery.isLoading && assignedClasses.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="font-medium">No classes assigned yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Classes assigned to your teacher account will appear here.
              </p>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assignedClasses.map((classItem) => {
              const isSelected = selectedClass?.id === classItem.id;
              return (
                <div
                  key={classItem.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{classItem.name}</p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {classItem.subject?.name ?? "Subject not assigned"}
                      </p>
                    </div>
                    <Badge variant={classItem.status === "active" ? "default" : "secondary"}>
                      {classItem.status}
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Capacity: {classItem.capacity || "Not specified"}</p>
                    <p>
                      Schedule: {classItem.schedules?.[0]
                        ? `${classItem.schedules[0].day}, ${classItem.schedules[0].startTime}–${classItem.schedules[0].endTime}`
                        : "Not scheduled"}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setSelectedClassId(classItem.id)}
                    >
                      View students
                    </Button>
                    <Link
                      to={`/classes/show/${classItem.id}`}
                      className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Class details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Enrolled students</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedClass
                ? `${selectedClass.name} · ${selectedClass.subject?.name ?? "Subject not assigned"}`
                : "Select a class to view its roster."}
            </p>
          </div>
          {selectedClass && <Badge variant="secondary">{enrolledStudents.length} students</Badge>}
        </CardHeader>
        <CardContent>
          {!selectedClass && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Select “View students” on an assigned class to open its roster.
            </div>
          )}
          {selectedClass && studentsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading enrolled students…</p>
          )}
          {selectedClass && !studentsQuery.isLoading && enrolledStudents.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="font-medium">No students enrolled</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Students who enroll in this class will appear here.
              </p>
            </div>
          )}
          {selectedClass && enrolledStudents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Student</th>
                    <th className="px-3 py-3 font-semibold">Email</th>
                    <th className="px-3 py-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map((student) => (
                    <tr key={student.id} className="border-b last:border-0">
                      <td className="px-3 py-3 font-medium">{student.name || "Unnamed student"}</td>
                      <td className="px-3 py-3 text-muted-foreground">{student.email}</td>
                      <td className="px-3 py-3 text-muted-foreground">{formatDate(student.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
}) => (
  <Card>
    <CardContent className="flex items-center justify-between p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold">{value}</p>
      </div>
      <Icon className="h-6 w-6 text-primary" />
    </CardContent>
  </Card>
);

export default TeacherDashboard;
