import { useGetIdentity, useList } from "@refinedev/core";
import { useState, useMemo } from "react";
import { Award, BookOpen, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import type { ClassDetails, GradebookEntry, User } from "@/types";

const GradebookPage = () => {
  const { data: currentUser } = useGetIdentity<User>();
  const isStudent = currentUser?.role === "student";

  // Fetch classes for filtering
  const { query: classesQuery } = useList<ClassDetails>({
    resource: "classes",
    pagination: { mode: "off" }
  });
  const classes = classesQuery.data?.data || [];

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const activeClassId = selectedClassId || (classes.length > 0 ? String(classes[0].id) : "");

  // Fetch gradebook entries matching the class
  const { query: gradebookQuery } = useList<GradebookEntry>({
    resource: "gradebook",
    filters: activeClassId ? [{ field: "classId", operator: "eq", value: activeClassId }] : [],
    pagination: { mode: "off" },
    queryOptions: { enabled: !!activeClassId }
  });

  const entries = useMemo(() => gradebookQuery.data?.data || [], [gradebookQuery.data?.data]);

  // Calculate Student Metrics dynamically from actual entries
  const stats = useMemo(() => {
    if (!entries.length) return { earned: 0, total: 0, percentage: 0 };
    const earned = entries.reduce((acc, curr) => acc + curr.points, 0);
    const total = entries.reduce((acc, curr) => acc + curr.maxPoints, 0);
    const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
    return { earned, total, percentage };
  }, [entries]);

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Academic Progress & Grades</h1>
      <div className="intro-row">
        <p className="text-muted-foreground">
          {isStudent ? "Track your semester GPA, subject performance, and assignment evaluations." : "Manage and review student grades across your classes."}
        </p>
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
        </div>
      </div>

      {isStudent && (
        <div className="grid gap-5 py-6 sm:grid-cols-3">
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Standing</p>
                <p className="text-3xl font-semibold text-foreground mt-2">{stats.percentage}%</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.earned} / {stats.total} total points</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Semester GPA (Est.)</p>
                <p className="text-3xl font-semibold text-foreground mt-2">3.72</p>
                <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +0.14 vs last term
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Credits Completed</p>
                <p className="text-3xl font-semibold text-foreground mt-2">84 / 120</p>
                <p className="text-xs text-muted-foreground mt-1">70% Degree Progress</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recorded Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            {!activeClassId ? (
              <div className="p-10 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                Please select a class to view academic records.
              </div>
            ) : gradebookQuery.isLoading ? (
              <div className="p-10 text-center text-muted-foreground animate-pulse">Loading gradebook entries...</div>
            ) : entries.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                No grades have been published for this class yet.
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
                    <div>
                      <p className="font-semibold text-foreground">{entry.title}</p>
                      {!isStudent && entry.student && (
                        <p className="text-xs text-muted-foreground mt-0.5">Student: {entry.student.name} ({entry.student.email})</p>
                      )}
                      {entry.feedback && (
                        <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2.5 rounded-md border border-border">
                          <span className="font-medium text-foreground">Instructor Feedback:</span> {entry.feedback}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-base px-3 py-1 font-semibold">
                        {entry.points} / {entry.maxPoints} pts
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ListView>
  );
};

export default GradebookPage;
