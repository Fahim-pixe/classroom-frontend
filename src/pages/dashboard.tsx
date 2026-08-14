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
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DeferredAdminDashboardAnalytics } from "@/components/dashboard/deferred-admin-dashboard-analytics";
import type { Assignment, User } from "@/types";
import { UserRole } from "@/types";
import { API_ENDPOINTS, ROUTES } from "@/constants";
import { getRoutePrefetchedData } from "@/lib/route-data-preload";

const TeacherDashboard = lazy(() => import("@/pages/teacher-dashboard"));

const emptyOverview = { users: 0, teachers: 0, admins: 0, subjects: 0, departments: 0, classes: 0 };
const emptyCharts = { usersByRole: [] as Array<{ role?: string; total?: number | string }> };
const emptyLatest = { latestClasses: [], latestTeachers: [] };

type AdminDashboardProps = { currentUser?: User };
type RoleRow = { name: string; value: number };

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
    <CardContent className="p-4 sm:p-6">
      <Ellipsis className="absolute right-4 top-4 h-4 w-4 text-muted-foreground sm:right-5 sm:top-5 sm:h-5 sm:w-5" />
      <p className="text-sm font-medium text-foreground sm:text-base">{label}</p>
      <p className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:mt-8 sm:text-4xl">{value}</p>

      {trend ? (
        <div className={`mt-4 flex items-center gap-1 text-xs font-medium sm:mt-5 sm:gap-2 sm:text-sm ${positive ? "text-emerald-500" : "text-red-500"}`}>
          {positive ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
          <span>{trend}</span>
          <span className="font-normal text-muted-foreground">{trendLabel}</span>
        </div>
      ) : (
        <div className="mt-4 h-4 sm:mt-5 sm:h-5" />
      )}
      <Icon className="absolute bottom-4 right-4 h-4 w-4 text-primary/30 sm:bottom-5 sm:right-5 sm:h-5 sm:w-5" />
    </CardContent>
  </Card>
);

const QuickAction = ({ title, description, icon: Icon, to }: { title: string; description: string; icon: typeof Users; to: string }) => {
  const Link = useLink();
  return (
    <Link to={to} className="group flex min-h-24 items-center gap-3 rounded-2xl border border-border bg-card px-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:min-h-28 sm:gap-5 sm:px-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 sm:h-14 sm:w-14">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-semibold text-foreground sm:text-lg">{title}</span>
        <span className="mt-1 block text-xs text-muted-foreground sm:text-sm">{description}</span>
      </span>
    </Link>
  );
};

const AdminDashboard = ({ currentUser }: AdminDashboardProps) => {
  const Link = useLink();
  const queryClient = useQueryClient();
  const prefetchedDashboard = getRoutePrefetchedData<{ data: Record<string, unknown> }>(queryClient, ROUTES.HOME);

  const { data: dashboardRes, isLoading, isError: hasError } = useCustom({
    url: API_ENDPOINTS.DASHBOARD_STATS,
    method: "get",
    queryOptions: { retry: 1, initialData: prefetchedDashboard },
  }) as unknown as CustomQueryResponse<DashboardApiResponse>;

  const dashboard = dashboardRes?.data ?? dashboardRes ?? {};
  const metrics = dashboard.metrics ?? {};
  const overview = { ...emptyOverview, users: metrics.totalStudents ?? 0, teachers: metrics.faculty ?? 0, classes: metrics.activeClasses ?? 0, subjects: metrics.subjects ?? 0 };
  const charts = { ...emptyCharts, usersByRole: Array.isArray(dashboard.studentDistribution) ? dashboard.studentDistribution.map((entry: { departmentName?: string; students?: number | string }) => ({ role: entry.departmentName, total: entry.students })) : [] };
  const latest = { ...emptyLatest, latestClasses: Array.isArray(dashboard.recentActivity) ? dashboard.recentActivity : [], latestTeachers: [] };
  const firstName = currentUser?.name?.split(" ")[0] || "there";

  if (isLoading) {
    return <DashboardSkeleton variant="admin" />;
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
      <section className="flex flex-col justify-between gap-4 pb-8 pt-2 sm:gap-6 sm:pb-10 md:flex-row md:items-start">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">Welcome back, {firstName}</h1>
          <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">Track, manage and monitor your classes, students and academic activities.</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 md:w-auto">
          <Button variant="outline" className="h-11 w-full rounded-xl border-border bg-card px-3 text-sm shadow-sm sm:h-12 sm:px-5 sm:text-base" asChild>
            <Link to={ROUTES.SUBJECTS.LIST}><FileUp className="mr-2 h-5 w-5" /> Import</Link>
          </Button>
          <Button className="h-11 w-full rounded-xl px-3 text-sm shadow-sm sm:h-12 sm:px-5 sm:text-base" asChild>
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

      <section className="grid grid-cols-2 gap-3 py-6 sm:gap-5 sm:py-8 xl:grid-cols-4">
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

      <DeferredAdminDashboardAnalytics donutData={donutData} monthlyData={monthlyData} />

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
  const queryClient = useQueryClient();
  const prefetchedDashboard = getRoutePrefetchedData<{ data: Record<string, unknown> }>(queryClient, ROUTES.HOME);

  const { data: dashboardRes, isLoading, isError } = useCustom({
    url: API_ENDPOINTS.DASHBOARD_STATS,
    method: "get",
    queryOptions: { retry: 1, initialData: prefetchedDashboard },
  }) as unknown as CustomQueryResponse<DashboardApiResponse>;

  const dashboard = dashboardRes?.data ?? dashboardRes ?? {};
  const metrics = dashboard.metrics ?? {};
  const schedule = Array.isArray(dashboard.todaySchedule) ? dashboard.todaySchedule : [];
  const assignments = Array.isArray(dashboard.upcomingAssignments) ? dashboard.upcomingAssignments : [];
  const announcements = Array.isArray(dashboard.recentAnnouncements) ? dashboard.recentAnnouncements : [];
  const firstName = currentUser?.name?.split(" ")[0] || "there";

  if (isLoading) return <DashboardSkeleton variant="student" />;

  return (
    <div className="min-h-full space-y-6 bg-background px-1 pb-10 text-foreground sm:space-y-8 sm:px-2">
      <section className="flex flex-col justify-between gap-4 pt-2 sm:gap-6 md:flex-row md:items-start">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">Good morning, {firstName}</h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">Your academic command center for classes, deadlines, and announcements.</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 md:w-auto">
          <Button variant="outline" className="h-11 w-full rounded-xl px-3 text-sm shadow-sm sm:h-12 sm:px-5 sm:text-base" asChild>
            <Link to={ROUTES.MY_WEEK}>My week</Link>
          </Button>
          <Button className="h-11 w-full rounded-xl px-3 text-sm shadow-sm sm:h-12 sm:px-5 sm:text-base" asChild>
            <Link to={ROUTES.CLASSES.LIST}><Plus className="mr-2 h-5 w-5" /> Join class</Link>
          </Button>
        </div>
      </section>

      {isError && <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">Some personal dashboard data could not be loaded.</div>}

      <section className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
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
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50 sm:p-4">
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase sm:h-12 sm:w-12">
                          <span>{day ? day.slice(0, 3) : "—"}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground sm:text-base">{item.subjectName || item.name}</p>
                          <p className="truncate text-xs text-muted-foreground sm:text-sm">{item.name}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0 px-2 py-1 text-xs font-medium sm:px-3 sm:text-sm">
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
                        <p className="min-w-0 truncate text-sm font-semibold text-foreground">{item.title}</p>
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
                  <div key={item.id} className="space-y-2 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words font-semibold text-foreground">{item.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
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
    return <DashboardSkeleton variant="student" />;
  }
  if (currentUser?.role === UserRole.TEACHER) {
    return (
      <Suspense fallback={<DashboardSkeleton variant="student" />}>
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
