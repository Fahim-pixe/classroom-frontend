import { useCustom, useGetIdentity, useLink } from "@refinedev/core";
import {
  ArrowDownRight,
  ArrowUpRight,
  Ellipsis,
  FileUp,
  GraduationCap,
  Layers3,
  PenLine,
  Plus,
  UserRoundPlus,
  Users,
} from "lucide-react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types";
import { UserRole } from "@/types";
import { BACKEND_BASE_URL } from "@/constants";
import TeacherDashboard from "@/pages/teacher-dashboard";

const purplePalette = ["#7c3aed", "#9467e8", "#ae8bea", "#cbb6f4", "#e8ddfb"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const emptyOverview = {
  users: 0,
  teachers: 0,
  admins: 0,
  subjects: 0,
  departments: 0,
  classes: 0,
};

const emptyCharts = {
  usersByRole: [] as Array<{ role?: string; total?: number | string }>,
};

const emptyLatest = {
  latestClasses: [],
  latestTeachers: [],
};

type AdminDashboardProps = {
  currentUser?: User;
};

type RoleRow = {
  name: string;
  value: number;
};

const toNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const StatCard = ({
  label,
  value,
  trend,
  trendLabel,
  positive = true,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  trend: string;
  trendLabel: string;
  positive?: boolean;
  icon: typeof Users;
}) => (
  <Card className="rounded-2xl border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
    <CardContent className="relative p-6">
      <Ellipsis className="absolute right-5 top-5 h-5 w-5 text-slate-400" />
      <p className="text-base font-medium text-slate-800">{label}</p>
      <p className="mt-8 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
      <div className={`mt-5 flex items-center gap-2 text-sm font-medium ${positive ? "text-emerald-500" : "text-red-500"}`}>
        {positive ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
        <span>{trend}</span>
        <span className="font-normal text-slate-500">{trendLabel}</span>
      </div>
      <Icon className="absolute bottom-5 right-5 h-5 w-5 text-violet-500/70" />
    </CardContent>
  </Card>
);

const QuickAction = ({
  title,
  description,
  icon: Icon,
  to,
}: {
  title: string;
  description: string;
  icon: typeof Users;
  to: string;
}) => {
  const Link = useLink();
  return (
    <Link
      to={to}
      className="group flex min-h-[112px] items-center gap-5 rounded-2xl border border-slate-200 bg-white px-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-100">
        <Icon className="h-6 w-6" />
      </span>
      <span>
        <span className="block text-lg font-semibold text-slate-900">{title}</span>
        <span className="mt-1 block text-sm text-slate-500">{description}</span>
      </span>
    </Link>
  );
};

const AdminDashboard = ({ currentUser }: AdminDashboardProps) => {
  const Link = useLink();
  const { data: dashboardRes, isLoading, isError: hasError } = useCustom({
    url: `${BACKEND_BASE_URL}/stats/dashboard`,
    method: "get",
    queryOptions: { retry: 1 },
  }) as any;
  const dashboard = dashboardRes?.data ?? {};
  const metrics = dashboard.metrics ?? {};
  const overview = { ...emptyOverview, users: metrics.totalStudents ?? 0, teachers: metrics.faculty ?? 0, classes: metrics.activeClasses ?? 0, subjects: metrics.subjects ?? 0 };
  const charts = { ...emptyCharts, usersByRole: Array.isArray(dashboard.studentDistribution) ? dashboard.studentDistribution.map((entry: any) => ({ role: entry.departmentName, total: entry.students })) : [] };
  const latest = { ...emptyLatest, latestClasses: Array.isArray(dashboard.recentActivity) ? dashboard.recentActivity : [], latestTeachers: [] };
  const firstName = currentUser?.name?.split(" ")[0] || "there";

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <p className="animate-pulse text-sm text-slate-500">Loading dashboard statistics...</p>
      </div>
    );
  }

  const roleRows: RoleRow[] = Array.isArray(charts.usersByRole)
    ? (charts.usersByRole as Array<{ role?: string; total?: number | string }>).map((entry) => ({
        name: String(entry.role || "Other").replace(/^./, (letter: string) => letter.toUpperCase()),
        value: toNumber(entry.total),
      }))
    : [];
  const donutData = roleRows.length > 0 && roleRows.some((entry) => entry.value > 0)
    ? roleRows.filter((entry) => entry.value > 0)
    : [
        { name: "Students", value: Math.max(toNumber(overview.users) - toNumber(overview.teachers) - toNumber(overview.admins), 1) },
        { name: "Teachers", value: Math.max(toNumber(overview.teachers), 1) },
        { name: "Admins", value: Math.max(toNumber(overview.admins), 1) },
      ];

  const monthlyData = Array.isArray(dashboard.enrollmentTrend)
    ? dashboard.enrollmentTrend.map((entry: any) => ({ month: entry.month, current: toNumber(entry.totalStudents ?? entry.newEnrollments), average: toNumber(entry.newEnrollments) }))
    : [];

  return (
    <div className="min-h-full bg-[#fcfcfd] px-1 pb-10 text-slate-900 sm:px-2">
      <section className="flex flex-col justify-between gap-6 pb-10 pt-2 md:flex-row md:items-start">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Welcome back, {firstName}</h1>
          <p className="mt-4 text-lg text-slate-500">Track, manage and monitor your classes, students and academic activities.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 rounded-xl border-slate-200 bg-white px-5 text-base shadow-sm" asChild>
            <Link to="/subjects">
              <FileUp className="mr-2 h-5 w-5" /> Import
            </Link>
          </Button>
          <Button className="h-12 rounded-xl bg-violet-600 px-5 text-base shadow-sm hover:bg-violet-700" asChild>
            <Link to="/classes/create">
              <Plus className="mr-2 h-5 w-5" /> Add
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-b border-slate-200 pb-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Quick actions</h2>
          <Ellipsis className="h-5 w-5 text-slate-400" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <QuickAction title="Add Subject" description="Create and configure academic content for your classroom." icon={UserRoundPlus} to="/subjects/create" />
          <QuickAction title="Add Class" description="Create and configure academic content for your classroom." icon={UserRoundPlus} to="/classes/create" />
          <QuickAction title="Join Class" description="Join an existing class using its class code or invitation." icon={PenLine} to="/classes" />
        </div>
      </section>

      <section className="grid gap-5 py-8 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={toNumber(overview.users)} trend="40%" trendLabel="vs last month" icon={Users} />
        <StatCard label="Faculty" value={toNumber(overview.teachers)} trend="10%" trendLabel="vs last month" positive={false} icon={GraduationCap} />
        <StatCard label="Classes" value={toNumber(overview.classes)} trend="20%" trendLabel="vs last month" icon={Layers3} />
        <StatCard label="Subjects" value={toNumber(overview.subjects)} trend="20%" trendLabel="vs last month" icon={PenLine} />
      </section>

      {hasError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Some statistics could not be refreshed. The dashboard is showing available values.
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.55fr)]">
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 px-8 pb-0 pt-8">
            <div>
              <CardTitle className="text-xl">Student distribution</CardTitle>
              <p className="mt-2 text-sm text-slate-500">Where students are distributed academically.</p>
            </div>
            <Ellipsis className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="px-8 pb-6 pt-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={102} paddingAngle={2} strokeWidth={0}>
                    {donutData.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={purplePalette[index % purplePalette.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, "Users"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-5">
              {donutData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: purplePalette[index % purplePalette.length] }} />
                  <span>{entry.name}</span>
                  <Badge variant="secondary" className="ml-auto bg-slate-100 font-medium">{entry.value}</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-6 h-11 w-full rounded-xl border-slate-200 bg-white text-slate-700" asChild>
              <Link to="/users">View full report</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 px-8 pb-0 pt-8">
            <div>
              <CardTitle className="text-xl">Student enrollment trend</CardTitle>
              <p className="mt-2 text-sm text-slate-500">Track how student enrollment has changed throughout the academic year.</p>
            </div>
            <Ellipsis className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-4">
            <div className="mb-3 flex justify-end gap-5 text-sm text-slate-500">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-600" /> Total students</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-300" /> New enrollments</span>
            </div>
            <div className="h-80 min-h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 12, right: 8, left: -20, bottom: 4 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="current" stroke="#7c3aed" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="average" stroke="#c4b5fd" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-6 rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
        <CardContent>
          {latest.latestClasses.length === 0 ? (
            <p className="text-sm text-slate-500">No recent activity is available yet.</p>
          ) : (
            <div className="space-y-4">
              {latest.latestClasses.slice(0, 6).map((item: any, index: number) => (
                <div key={`${item.type}-${item.createdAt}-${index}`} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div><p className="font-medium text-slate-800">{item.title}</p><p className="text-sm text-slate-500">{item.description}</p></div>
                  <span className="whitespace-nowrap text-xs text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StudentDashboard = ({ currentUser }: AdminDashboardProps) => {
  const Link = useLink();
  const { data: dashboardRes, isLoading, isError } = useCustom({ url: `${BACKEND_BASE_URL}/stats/dashboard`, method: "get", queryOptions: { retry: 1 } }) as any;
  const dashboard = dashboardRes?.data ?? {};
  const metrics = dashboard.metrics ?? {};
  const schedule = Array.isArray(dashboard.todaySchedule) ? dashboard.todaySchedule : [];
  const assignments = Array.isArray(dashboard.upcomingAssignments) ? dashboard.upcomingAssignments : [];
  const announcements = Array.isArray(dashboard.recentAnnouncements) ? dashboard.recentAnnouncements : [];
  const firstName = currentUser?.name?.split(" ")[0] || "there";
  if (isLoading) return <div className="flex min-h-96 items-center justify-center"><p className="animate-pulse text-sm text-slate-500">Loading your dashboard...</p></div>;
  return (
    <div className="min-h-full bg-[#fcfcfd] px-1 pb-10 text-slate-900 sm:px-2">
      <section className="flex flex-col justify-between gap-6 pb-10 pt-2 md:flex-row md:items-start"><div><h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Welcome back, {firstName}</h1><p className="mt-4 text-lg text-slate-500">Stay on top of your classes, assignments and academic progress.</p></div><Button className="h-12 rounded-xl bg-violet-600 px-5 text-base shadow-sm hover:bg-violet-700" asChild><Link to="/classes"><Plus className="mr-2 h-5 w-5" /> Join class</Link></Button></section>
      {isError && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Some personal dashboard data could not be loaded.</div>}
      <section className="grid gap-5 py-2 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="My classes" value={toNumber(metrics.myClasses)} trend="" trendLabel="active classes" icon={Layers3} /><StatCard label="Attendance" value={metrics.attendance == null ? "—" : `${metrics.attendance}%`} trend="" trendLabel="current rate" icon={Users} /><StatCard label="Assignments" value={toNumber(metrics.assignments)} trend="" trendLabel="upcoming" icon={PenLine} /><StatCard label="Upcoming" value={toNumber(metrics.upcoming)} trend="" trendLabel="due soon" icon={GraduationCap} /></section>
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_1fr]"><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle>Today&apos;s classes</CardTitle></CardHeader><CardContent>{schedule.length === 0 ? <p className="text-sm text-slate-500">No classes scheduled today.</p> : <div className="space-y-3">{schedule.map((item: any) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><div><p className="font-medium">{item.subjectName || item.name}</p><p className="text-sm text-slate-500">{item.name}</p></div><span className="text-sm text-slate-500">{item.schedules?.[0]?.startTime || "Scheduled"}</span></div>)}</div>}</CardContent></Card><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle>Upcoming assignments</CardTitle></CardHeader><CardContent>{assignments.length === 0 ? <p className="text-sm text-slate-500">No upcoming assignments.</p> : <div className="space-y-3">{assignments.map((item: any) => <div key={item.id} className="border-b border-slate-100 pb-3 last:border-0"><p className="font-medium">{item.title}</p><p className="text-sm text-slate-500">{item.className} · {item.dueAt ? new Date(item.dueAt).toLocaleDateString() : "No due date"}</p></div>)}</div>}</CardContent></Card></section>
      <Card className="mt-6 rounded-2xl border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle>Recent announcements</CardTitle></CardHeader><CardContent>{announcements.length === 0 ? <p className="text-sm text-slate-500">No recent announcements.</p> : <div className="space-y-3">{announcements.map((item: any) => <div key={item.id} className="border-b border-slate-100 pb-3 last:border-0"><p className="font-medium">{item.title}</p><p className="text-sm text-slate-500">{item.className} · {new Date(item.createdAt).toLocaleDateString()}</p></div>)}</div>}</CardContent></Card>
    </div>
  );
};

const Dashboard = () => {
  const { data: currentUser, isLoading } = useGetIdentity<User>();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  }

  if (currentUser?.role === UserRole.TEACHER) {
    return <TeacherDashboard teacher={currentUser} />;
  }
  if (currentUser?.role === UserRole.STUDENT) {
    return <StudentDashboard currentUser={currentUser} />;
  }
  return <AdminDashboard currentUser={currentUser} />;
};

export default Dashboard;
