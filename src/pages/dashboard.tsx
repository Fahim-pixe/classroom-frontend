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
import { lazy, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Assignment, User } from "@/types";
import { UserRole } from "@/types";
import { API_ENDPOINTS, ROUTES } from "@/constants";

const TeacherDashboard = lazy(() => import("@/pages/teacher-dashboard"));
const DeferredAdminDashboardAnalytics = lazy(() =>
  import("@/components/dashboard/admin-dashboard-analytics").then(({ AdminDashboardAnalytics: Analytics }) => ({ default: Analytics })),
);

const emptyOverview = { users: 0, teachers: 0, admins: 0, subjects: 0, departments: 0, classes: 0 };
const emptyCharts = { usersByRole: [] as Array<{ role?: string; total?: number | string }> };
const emptyLatest = { latestClasses: [], latestTeachers: [] };

type AdminDashboardProps = { currentUser?: User };
type RoleRow = { name: string; value: number };

type DashboardRouteFallbackProps = {
  label: string;
};

const DashboardRouteFallback = ({ label }: DashboardRouteFallbackProps) => (
  <div className="flex min-h-96 items-center justify-center" role="status" aria-live="polite">
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

const DashboardAnalyticsFallback = () => (
  <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.55fr)]" aria-busy="true">
    <Card className="overflow-hidden shadow-sm"><CardContent className="h-80 animate-pulse p-8"><div className="h-full rounded-xl bg-muted" /></CardContent></Card>
    <Card className="overflow-hidden shadow-sm"><CardContent className="h-80 animate-pulse p-8"><div className="h-full rounded-xl bg-muted" /></CardContent></Card>
  </section>
);

type DashboardPayload = {
  role?: string;
  metrics?: {
    totalStudents?: number;
    faculty?: number;
    activeClasses?: number;
    subjects?: number;
    myClasses?: number;
    attendance?: number;
    assignments?: number;
    upcoming?: number;
    comparisons?: {
      totalStudents?: string;
      faculty?: string;
      activeClasses?: string;
      subjects?: string;
    };
  };
  studentDistribution?: Array<{ departmentName?: string; students?: number | string }>;
  recentActivity?: Array<{ type?: string; title?: string; description?: string; createdAt?: string }>;
  enrollmentTrend?: EnrollmentTrendEntry[];
  todaySchedule?: ScheduleItem[];
  upcomingAssignments?: Assignment[];
  recentAnnouncements?: AnnouncementItem[];
};

type DashboardApiResponse = DashboardPayload & { data?: DashboardPayload };

type EnrollmentTrendEntry = {
  month?: string;
  totalStudents?: number;
  newEnrollments?: number;
};

type ScheduleItem = {
  id: number;
  name: string;
  subjectName?: string;
  schedules?: Array<{ startTime?: string; day?: string }>;
};

type AnnouncementItem = {
  id: number;
  title: string;
  createdAt: string;
  className?: string;
};

// Utility type to bypass broken React Query interface resolutions
type CustomQueryResponse<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
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
  trend?: string;
  trendLabel?: string;
  positive?: boolean;
  icon: typeof Users;
}) => (
  <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
    <CardContent className="p-6">
      <Ellipsis className="absolute right-5 top-5 h-5 w-5 text-muted-foreground" />
      <p className="text-base font-medium text-foreground">{label}</p>
      <p className="mt-8 text-4xl font-semibold tracking-tight text-foreground">{value}</p>

      {trend ? (
        <div className={`mt-5 flex items-center gap-2 text-sm font-medium ${positive ? "text-emerald-500" : "text-red-500"}`}>
          {positive ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
          <span>{trend}</span>
          <span className="font-normal text-muted-foreground">{trendLabel}</span>
        </div>
      ) : (
        <div className="mt-5 h-5" />
      )}
      <Icon className="absolute bottom-5 right-5 h-5 w-5 text-primary/30" />
    </CardContent>
  </Card>
);

const QuickAction = ({ title, description, icon: Icon, to }: { title: string; description: string; icon: typeof Users; to: string }) => {
  const Link = useLink();
  return (
    <Link to={to} className="group flex min-h-28 items-center gap-5 rounded-2xl border border-border bg-card px-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
        <Icon className="h-6 w-6" />
      </span>
      <span>
        <span className="block text-lg font-semibold text-foreground">{title}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
      </span>
    </Link>
  );
};

const AdminDashboard = ({ currentUser }: AdminDashboardProps) => {
  const Link = useLink();

  const { data: dashboardRes, isLoading, isError: hasError } = useCustom({
    url: API_ENDPOINTS.DASHBOARD_STATS,
    method: "get",
    queryOptions: { retry: 1 },
  }) as unknown as CustomQueryResponse<DashboardApiResponse>;

  const dashboard = dashboardRes?.data ?? dashboardRes ?? {};
  const metrics = dashboard.metrics ?? {};
  const overview = { ...emptyOverview, users: metrics.totalStudents ?? 0, teachers: metrics.faculty ?? 0, classes: metrics.activeClasses ?? 0, subjects: metrics.subjects ?? 0 };
  const charts = { ...emptyCharts, usersByRole: Array.isArray(dashboard.studentDistribution) ? dashboard.studentDistribution.map((entry: { departmentName?: string; students?: number | string }) => ({ role: entry.departmentName, total: entry.students })) : [] };
  const latest = { ...emptyLatest, latestClasses: Array.isArray(dashboard.recentActivity) ? dashboard.recentActivity : [], latestTeachers: [] };
  const firstName = currentUser?.name?.split(" ")[0] || "there";

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <p className="animate-pulse text-sm text-muted-foreground">Loading dashboard statistics...</p>
      </div>
    );
  }

  const roleRows: RoleRow[] = Array.isArray(charts.usersByRole)
    ? charts.usersByRole.map((entry) => ({ name: String(entry.role || "Other").replace(/^./, (letter: string) => letter.toUpperCase()), value: toNumber(entry.total) }))
    : [];

  const donutData = roleRows.filter((entry) => entry.value > 0);

  const monthlyData = Array.isArray(dashboard.enrollmentTrend)
    ? dashboard.enrollmentTrend.map((entry: EnrollmentTrendEntry) => ({ month: entry.month, current: toNumber(entry.totalStudents ?? entry.newEnrollments), average: toNumber(entry.newEnrollments) }))
    : [];

  return (
    <div className="min-h-full bg-background px-1 pb-10 text-foreground sm:px-2">
      <section className="flex flex-col justify-between gap-6 pb-10 pt-2 md:flex-row md:items-start">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Welcome back, {firstName}</h1>
          <p className="mt-4 text-lg text-muted-foreground">Track, manage and monitor your classes, students and academic activities.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 rounded-xl border-border bg-card px-5 text-base shadow-sm" asChild>
            <Link to={ROUTES.SUBJECTS.LIST}><FileUp className="mr-2 h-5 w-5" /> Import</Link>
          </Button>
          <Button className="h-12 rounded-xl px-5 text-base shadow-sm" asChild>
            <Link to={ROUTES.CLASSES.CREATE}><Plus className="mr-2 h-5 w-5" /> Add</Link>
          </Button>
        </div>
      </section>

      <section className="border-b border-border pb-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Quick actions</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <QuickAction title="Add Subject" description="Create and configure academic content for your classroom." icon={UserRoundPlus} to={ROUTES.SUBJECTS.CREATE} />
          <QuickAction title="Add Class" description="Create and configure academic content for your classroom." icon={UserRoundPlus} to={ROUTES.CLASSES.CREATE} />
          <QuickAction title="Join Class" description="Join an existing class using its class code or invitation." icon={PenLine} to={ROUTES.CLASSES.LIST} />
        </div>
      </section>

      <section className="grid gap-5 py-8 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={toNumber(overview.users)} trend={metrics.comparisons?.totalStudents} trendLabel="vs last month" icon={Users} />
        <StatCard label="Faculty" value={toNumber(overview.teachers)} trend={metrics.comparisons?.faculty} trendLabel="vs last month" positive={false} icon={GraduationCap} />
        <StatCard label="Classes" value={toNumber(overview.classes)} trend={metrics.comparisons?.activeClasses} trendLabel="vs last month" icon={Layers3} />
        <StatCard label="Subjects" value={toNumber(overview.subjects)} trend={metrics.comparisons?.subjects} trendLabel="vs last month" icon={PenLine} />
      </section>

      {hasError && (
        <div className="mb-6 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Some statistics could not be refreshed. The dashboard is showing available values.
        </div>
      )}

      <Suspense fallback={<DashboardAnalyticsFallback />}>
        <DeferredAdminDashboardAnalytics donutData={donutData} monthlyData={monthlyData} />
      </Suspense>

      <Card className="mt-6 shadow-sm">
        <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
        <CardContent>
          {latest.latestClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity is available yet.</p>
          ) : (
            <div className="space-y-4">
              {latest.latestClasses.slice(0, 6).map((item: { type?: string; title?: string; description?: string; createdAt?: string }, index: number) => (
                <div key={`${item.type}-${item.createdAt}-${index}`} className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div><p className="font-medium text-foreground">{item.title}</p><p className="text-sm text-muted-foreground">{item.description}</p></div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</span>
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

  const { data: dashboardRes, isLoading, isError } = useCustom({
    url: API_ENDPOINTS.DASHBOARD_STATS,
    method: "get",
    queryOptions: { retry: 1 },
  }) as unknown as CustomQueryResponse<DashboardApiResponse>;

  const dashboard = dashboardRes?.data ?? dashboardRes ?? {};
  const metrics = dashboard.metrics ?? {};
  const schedule = Array.isArray(dashboard.todaySchedule) ? dashboard.todaySchedule : [];
  const assignments = Array.isArray(dashboard.upcomingAssignments) ? dashboard.upcomingAssignments : [];
  const announcements = Array.isArray(dashboard.recentAnnouncements) ? dashboard.recentAnnouncements : [];
  const firstName = currentUser?.name?.split(" ")[0] || "there";

  if (isLoading) return <div className="flex min-h-96 items-center justify-center"><p className="animate-pulse text-sm text-muted-foreground">Loading your student command center...</p></div>;

  return (
    <div className="min-h-full bg-background px-1 pb-10 text-foreground sm:px-2 space-y-8">
      <section className="flex flex-col justify-between gap-6 pt-2 md:flex-row md:items-start">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Good morning, {firstName} 👋</h1>
          <p className="mt-2 text-lg text-muted-foreground">Your academic command center for classes, deadlines, and announcements.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="h-12 rounded-xl px-5 text-base shadow-sm" asChild>
            <Link to={ROUTES.MY_WEEK}>My week</Link>
          </Button>
          <Button className="h-12 rounded-xl px-5 text-base shadow-sm" asChild>
            <Link to={ROUTES.CLASSES.LIST}><Plus className="mr-2 h-5 w-5" /> Join class</Link>
          </Button>
        </div>
      </section>

      {isError && <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">Some personal dashboard data could not be loaded.</div>}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Classes" value={toNumber(metrics.myClasses)} icon={Layers3} />
        <StatCard label="Attendance Rate" value={metrics.attendance == null ? "—" : `${metrics.attendance}%`} icon={Users} />
        <StatCard label="Pending Work" value={toNumber(metrics.assignments)} icon={PenLine} />
        <StatCard label="Due Soon" value={toNumber(metrics.upcoming)} icon={GraduationCap} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <CardTitle className="text-xl">Today&apos;s schedule</CardTitle>
            <Badge variant="outline" className="text-xs">Current day</Badge>
          </CardHeader>
          <CardContent className="pt-6">
            {schedule.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                No classes scheduled for today. Enjoy your free time!
              </div>
            ) : (
              <div className="space-y-4">
                {schedule.map((item: ScheduleItem) => {
                  const startTime = item.schedules?.[0]?.startTime;
                  const day = item.schedules?.[0]?.day;
                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase">
                          <span>{day ? day.slice(0, 3) : "—"}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-base">{item.subjectName || item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.name}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-medium text-sm px-3 py-1">
                        {startTime || "Time pending"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-xl">Smart Deadline Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {assignments.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                All caught up! No upcoming assignment deadlines.
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((item: Assignment) => {
                  const dueDate = item.dueAt ? new Date(item.dueAt) : null;
                  const isSoon = !!(dueDate && dueDate.getTime() - Date.now() < 86400000 * 2);

                  return (
                    <div key={item.id} className="relative pl-6 border-l-2 border-primary/40 space-y-1 pb-4 last:pb-0">
                      <div className="absolute -left-1.75 top-1 h-3 w-3 rounded-full bg-primary" />
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-foreground text-sm">{item.title}</p>
                        {item.submission?.submittedAt ? (
                          <Badge variant="secondary">Submitted</Badge>
                        ) : isSoon ? (
                          <Badge variant="destructive">Due soon</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.className}</p>
                      <p className="text-xs font-medium text-primary mt-1">
                        {dueDate ? `Due: ${dueDate.toLocaleString()}` : "No strict due date"}
                      </p>
                      <Link to={ROUTES.ASSIGNMENTS.SHOW.replace(":id", String(item.id))} className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline">
                        Open assignment
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-xl">Recent Announcements &amp; What&apos;s New</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent announcements from your departments or classes.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {announcements.map((item: AnnouncementItem) => (
                <div key={item.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.className}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Dashboard = () => {
  const { data: currentUser, isLoading } = useGetIdentity<User>();
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading dashboard...</p>;
  }
  if (currentUser?.role === UserRole.TEACHER) {
    return (
      <Suspense fallback={<DashboardRouteFallback label="Loading your teaching workspace…" />}>
        <TeacherDashboard teacher={currentUser} />
      </Suspense>
    );
  }
  if (currentUser?.role === UserRole.STUDENT) {
    return <StudentDashboard currentUser={currentUser} />;
  }
  return <AdminDashboard currentUser={currentUser} />;
};

export default Dashboard;
