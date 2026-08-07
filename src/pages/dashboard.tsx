import { useGetIdentity, useLink, useCustom } from "@refinedev/core";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  Building2,
  GraduationCap,
  Layers,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { User } from "@/types";
import { UserRole } from "@/types";
import TeacherDashboard from "@/pages/teacher-dashboard";

const roleColors = ["#f97316", "#0ea5e9", "#22c55e", "#a855f7"];

const AdminDashboard = () => {
  const Link = useLink();

  // Fetch from your existing stats.ts backend routes concurrently
  const { data: overviewRes, isLoading: loadingOverview } = useCustom({
    url: "stats/overview",
    method: "get",
  }) as any;
  
  const { data: chartsRes, isLoading: loadingCharts } = useCustom({
    url: "stats/charts",
    method: "get",
  }) as any;
  
  const { data: latestRes, isLoading: loadingLatest } = useCustom({
    url: "stats/latest",
    method: "get",
  }) as any;

  const isLoading = loadingOverview || loadingCharts || loadingLatest;

  // Extract the inner data objects based on your backend response structure
  const overview = overviewRes?.data as any;
  const charts = chartsRes?.data as any;
  const latest = latestRes?.data as any;

  if (isLoading || !overview || !charts || !latest) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading dashboard statistics...</p>
      </div>
    );
  }

  const kpis = [
    { label: "Total Users", value: overview.users, icon: Users, accent: "text-blue-600" },
    { label: "Teachers", value: overview.teachers, icon: GraduationCap, accent: "text-emerald-600" },
    { label: "Admins", value: overview.admins, icon: ShieldCheck, accent: "text-amber-600" },
    { label: "Subjects", value: overview.subjects, icon: BookOpen, accent: "text-purple-600" },
    { label: "Departments", value: overview.departments, icon: Building2, accent: "text-cyan-600" },
    { label: "Classes", value: overview.classes, icon: Layers, accent: "text-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted-foreground">A quick snapshot of the latest activity and key metrics.</p>
      </div>

      {/* KPI CARDS */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-lg border border-border bg-muted/20 p-4 hover:border-primary/40 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">{kpi.label}</p>
                  <kpi.icon className={`h-4 w-4 ${kpi.accent}`} />
                </div>
                <div className="mt-2 text-2xl font-semibold">{kpi.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="total"
                    nameKey="role"
                    data={charts.usersByRole}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {charts.usersByRole.map((entry: any, index: number) => (
                      <Cell key={`${entry.role}-${index}`} fill={roleColors[index % roleColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2">
              {charts.usersByRole.map((entry: any, index: number) => (
                <span
                  key={entry.role}
                  className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: roleColors[index % roleColors.length] }}
                  />
                  {entry.role} ({entry.total})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RECENT ADDITIONS SUMMARY */}
        <div className="grid gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>New Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{latest.latestClasses.length}</div>
              <p className="text-sm text-muted-foreground">Recently added</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>New Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{latest.latestTeachers.length}</div>
              <p className="text-sm text-muted-foreground">Recently added</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BAR CHARTS */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Subjects per Department</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.subjectsByDepartment}>
                  <XAxis dataKey="departmentName" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="totalSubjects" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Classes per Subject</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.classesBySubject}>
                  <XAxis dataKey="subjectName" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="totalClasses" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* RECENT LISTS */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Newest Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latest.latestClasses.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent classes.</p>
            )}
            {latest.latestClasses.map((item: any, index: number) => (
              <Link
                key={item.id}
                to={`/classes/show/${item.id}`}
                className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.subject?.name ?? "No subject"} • {item.teacher?.name ?? "No teacher"}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">New</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Newest Teachers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latest.latestTeachers.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent teachers.</p>
            )}
            {latest.latestTeachers.map((teacher: any, index: number) => (
              <Link
                key={teacher.id}
                to={`/users/show/${teacher.id}`}
                className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{teacher.name}</p>
                    <p className="text-xs text-muted-foreground">{teacher.email}</p>
                  </div>
                </div>
                <Badge variant="secondary">New</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator className="mt-6" />
    </div>
  );
};

const Dashboard = () => {
  const { data: currentUser, isLoading } = useGetIdentity<User>();
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading dashboard...</p>;
  }
  if (currentUser?.role === UserRole.TEACHER) {
    return <TeacherDashboard teacher={currentUser} />;
  }
  return <AdminDashboard />;
};

export default Dashboard;