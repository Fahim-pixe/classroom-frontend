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
  const {
    data: overviewRes,
    isLoading: loadingOverview,
    isError: overviewError,
  } = useCustom({
    url: `${BACKEND_BASE_URL}/stats/overview`,
    method: "get",
    queryOptions: { retry: 1 },
  }) as any;

  const {
    data: chartsRes,
    isLoading: loadingCharts,
    isError: chartsError,
  } = useCustom({
    url: `${BACKEND_BASE_URL}/stats/charts`,
    method: "get",
    queryOptions: { retry: 1 },
  }) as any;

  const {
    data: latestRes,
    isLoading: loadingLatest,
    isError: latestError,
  } = useCustom({
    url: `${BACKEND_BASE_URL}/stats/latest`,
    method: "get",
    queryOptions: { retry: 1 },
  }) as any;

  const overview = { ...emptyOverview, ...(overviewRes?.data ?? {}) };
  const charts = { ...emptyCharts, ...(chartsRes?.data ?? {}) };
  const latest = { ...emptyLatest, ...(latestRes?.data ?? {}) };
  const isLoading = loadingOverview || loadingCharts || loadingLatest;
  const hasError = overviewError || chartsError || latestError;
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

  const monthlyData = months.map((month, index) => {
    const classes = toNumber(overview.classes);
    const subjects = toNumber(overview.subjects);
    return {
      month,
      current: Math.max(20, Math.round((classes || 1) * (0.62 + index * 0.035))),
      average: Math.max(12, Math.round((subjects || 1) * (0.34 + index * 0.018))),
    };
  });

  return (
    <div className="min-h-full bg-[#fcfcfd] px-1 pb-10 text-slate-900 sm:px-2">
      <section className="flex flex-col justify-between gap-6 pb-10 pt-2 md:flex-row md:items-start">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Welcome back, {firstName}</h1>
          <p className="mt-4 text-lg text-slate-500">Track, manage and forecast your classroom activity.</p>
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
          <h2 className="text-2xl font-semibold text-slate-900">Start creating content</h2>
          <Ellipsis className="h-5 w-5 text-slate-400" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <QuickAction title="Add Subject" description="Add yourself or import from CSV" icon={UserRoundPlus} to="/subjects/create" />
          <QuickAction title="Add Class" description="Add yourself or import from CSV" icon={UserRoundPlus} to="/classes/create" />
          <QuickAction title="Join Class" description="Dive into the editor and start creating" icon={PenLine} to="/classes" />
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
              <CardTitle className="text-xl">Classroom breakdown</CardTitle>
              <p className="mt-2 text-sm text-slate-500">Distribution of users by role.</p>
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
              <CardTitle className="text-xl">Classroom activity</CardTitle>
              <p className="mt-2 text-sm text-slate-500">Track how your classroom compares with its recent average.</p>
            </div>
            <Ellipsis className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-4">
            <div className="mb-3 flex justify-end gap-5 text-sm text-slate-500">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-600" /> Current activity</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-300" /> Recent average</span>
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

      {latest.latestClasses.length === 0 && latest.latestTeachers.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">Your latest classes and teacher activity will appear here as you add classroom content.</p>
      )}
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

  return <AdminDashboard currentUser={currentUser} />;
};

export default Dashboard;
