import {
  Refine,
  Authenticated,
} from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { lazy, Suspense, type PropsWithChildren } from "react";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";

// Providers
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";

// Layout & Components
import { ErrorComponent } from "./components/refine-ui/layout/error-component";
import { Layout } from "./components/refine-ui/layout/layout";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { OFFLINE_RESILIENCE_CONFIG, PERFORMANCE_CONFIG, ROUTES } from "./constants";
import { PageLoadingFallback } from "./components/refine-ui/layout/page-loading-fallback";
import "./App.css";

// Icons
import { BookOpen, GraduationCap, Home, Building2, Users, ClipboardList, UserRound, ShieldCheck, Settings, FolderOpen, Megaphone, FileText, CalendarCheck, CalendarDays } from "lucide-react";

// Pages are loaded on demand to keep the initial authenticated bundle focused on the active route.
const Login = lazy(() => import("./pages/login").then(({ Login: Page }) => ({ default: Page })));
const Register = lazy(() => import("./pages/register").then(({ Register: Page }) => ({ default: Page })));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Profile = lazy(() => import("@/pages/profile"));
const SubjectsList = lazy(() => import("./pages/subjects/list"));
const SubjectsCreate = lazy(() => import("./pages/subjects/create"));
const SubjectsEdit = lazy(() => import("./pages/subjects/edit"));
const SubjectsShow = lazy(() => import("./pages/subjects/show"));
const ClassesList = lazy(() => import("./pages/classes/list"));
const ClassesCreate = lazy(() => import("./pages/classes/create"));
const ClassesEdit = lazy(() => import("./pages/classes/edit"));
const ClassesShow = lazy(() => import("./pages/classes/show"));
const DepartmentsList = lazy(() => import("./pages/departments/list"));
const DepartmentsCreate = lazy(() => import("./pages/departments/create"));
const DepartmentsEdit = lazy(() => import("./pages/departments/edit"));
const DepartmentShow = lazy(() => import("./pages/departments/show"));
const FacultyList = lazy(() => import("./pages/faculty/list"));
const FacultyShow = lazy(() => import("./pages/faculty/show"));
const EnrollmentsCreate = lazy(() => import("./pages/enrollments/create"));
const EnrollmentsJoin = lazy(() => import("./pages/enrollments/join"));
const EnrollmentConfirm = lazy(() => import("./pages/enrollments/confirm"));
const Resources = lazy(() => import("./pages/resources"));
const AnnouncementsPage = lazy(() => import("./pages/announcements"));
const StudentsPage = lazy(() => import("./pages/students"));
const AvailabilityPage = lazy(() => import("./pages/availability"));
const AdminUsersPage = lazy(() => import("./pages/admin-users"));
const RolesPermissionsPage = lazy(() => import("./pages/roles-permissions"));
const SettingsPage = lazy(() => import("./pages/settings"));
const CalendarPage = lazy(() => import("./pages/calendar"));
const AssignmentsList = lazy(() => import("./pages/assignments/list"));
const AssignmentsCreate = lazy(() => import("./pages/assignments/create"));
const AssignmentsShow = lazy(() => import("./pages/assignments/show"));
const AttendanceList = lazy(() => import("./pages/attendance/list"));
const AttendanceCreate = lazy(() => import("./pages/attendance/create"));
const GradebookPage = lazy(() => import("./pages/gradebook"));
const GradeAssessmentsPage = lazy(() => import("./pages/gradebook/manage"));
const SavedResourcesPage = lazy(() => import("./pages/resources/favorites"));

const DevelopmentTools = import.meta.env.DEV
  ? lazy(() =>
      import("@refinedev/devtools").then(({ DevtoolsPanel, DevtoolsProvider }) => ({
        default: ({ children }: PropsWithChildren) => (
          <DevtoolsProvider>
            {children}
            <DevtoolsPanel />
          </DevtoolsProvider>
        ),
      })),
    )
  : null;

function ToolingBoundary({ children }: PropsWithChildren) {
  if (!DevelopmentTools) {
    return children;
  }

  return <Suspense fallback={children}><DevelopmentTools>{children}</DevelopmentTools></Suspense>;
}

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <ToolingBoundary>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider} // <-- Injected Auth Provider
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "oQXqvS-Zw4CAo-QWHyYk",
                reactQuery: {
                  clientConfig: {
                    defaultOptions: {
                      queries: {
                        staleTime: PERFORMANCE_CONFIG.queryStaleTimeMs,
                        gcTime: PERFORMANCE_CONFIG.queryGarbageCollectionTimeMs,
                        networkMode: OFFLINE_RESILIENCE_CONFIG.queryNetworkMode,
                        retry: OFFLINE_RESILIENCE_CONFIG.queryRetryCount,
                      },
                    },
                  },
                },
              }}
              resources={[
                { name: "dashboard", list: ROUTES.HOME, meta: { label: "Dashboard", icon: <Home /> } },
                { name: "academic", meta: { label: "Academic", group: true } },
                { name: "departments", list: ROUTES.DEPARTMENTS.LIST, create: ROUTES.DEPARTMENTS.CREATE, edit: ROUTES.DEPARTMENTS.EDIT, show: ROUTES.DEPARTMENTS.SHOW, meta: { label: "Departments", icon: <Building2 />, parent: "academic" } },
                { name: "subjects", list: ROUTES.SUBJECTS.LIST, create: ROUTES.SUBJECTS.CREATE, edit: ROUTES.SUBJECTS.EDIT, show: ROUTES.SUBJECTS.SHOW, meta: { label: "Subjects", icon: <BookOpen />, parent: "academic" } },
                { name: "classes", list: ROUTES.CLASSES.LIST, create: ROUTES.CLASSES.CREATE, edit: ROUTES.CLASSES.EDIT, show: ROUTES.CLASSES.SHOW, meta: { label: "Classes", icon: <GraduationCap />, parent: "academic" } },
                { name: "academic-calendar", list: ROUTES.CALENDAR, meta: { label: "Academic Calendar", icon: <CalendarDays />, parent: "academic" } },
                { name: "faculty", meta: { label: "Faculty", group: true } },
                { name: "faculty-members", list: ROUTES.USERS.LIST, show: ROUTES.USERS.SHOW, meta: { label: "Faculty Members", icon: <Users />, parent: "faculty" } },
                { name: "teaching", meta: { label: "Teaching", group: true } },
                { name: "assignments", list: ROUTES.ASSIGNMENTS.LIST, meta: { label: "Assignments", icon: <ClipboardList />, parent: "teaching" } },
                { name: "attendance", list: ROUTES.ATTENDANCE.LIST, meta: { label: "Attendance", icon: <CalendarCheck />, parent: "teaching" } },
                { name: "grades-assessments", list: ROUTES.GRADE_ASSESSMENTS, meta: { label: "Grades & Assessments", icon: <FileText />, parent: "teaching" } },
                { name: "academic-records", list: ROUTES.ACADEMIC_RECORDS, meta: { label: "Academic Records", icon: <FileText />, parent: "students" } },
                { name: "resources", list: ROUTES.RESOURCES.LIST, meta: { label: "Resources & Materials", icon: <FolderOpen />, parent: "teaching" } },
                { name: "students", meta: { label: "Students", group: true } },
                { name: "student-directory", list: ROUTES.STUDENTS, meta: { label: "Student Directory", icon: <UserRound />, parent: "students" } },
                { name: "enrollments", list: ROUTES.ENROLLMENTS.CREATE, meta: { label: "Enrollments", icon: <ClipboardList />, parent: "students" } },
                { name: "communication", meta: { label: "Communication", group: true } },
                { name: "announcements", list: ROUTES.ANNOUNCEMENTS, meta: { label: "Announcements", icon: <Megaphone />, parent: "communication" } },
                { name: "administration", meta: { label: "Administration", group: true } },
                { name: "admin-users", list: ROUTES.ADMIN_USERS, meta: { label: "Users", icon: <Users />, parent: "administration" } },
                { name: "roles-permissions", list: ROUTES.ROLES_PERMISSIONS, meta: { label: "Roles & Permissions", icon: <ShieldCheck />, parent: "administration" } },
                { name: "settings", list: ROUTES.SETTINGS, meta: { label: "Settings", icon: <Settings />, parent: "administration" } },
              ]}
            >
              <Suspense fallback={<PageLoadingFallback label={PERFORMANCE_CONFIG.routeLoadingLabel} />}>
                <Routes>
                {/* 1. PROTECTED ROUTES */}
                <Route
                  element={
                    <Authenticated
                      key="protected-layout"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <Layout>
                        <Outlet />
                      </Layout>
                    </Authenticated>
                  }
                >
                  <Route path={ROUTES.HOME} element={<Dashboard />} />
                  <Route path={ROUTES.PROFILE.slice(1)} element={<Profile />} />

                  <Route path={ROUTES.SUBJECTS.LIST.slice(1)}>
                    <Route index element={<SubjectsList />} />
                    <Route path="create" element={<SubjectsCreate />} />
                    <Route path="edit/:id" element={<SubjectsEdit />} /> {/* <-- ADD THIS */}
                    <Route path="show/:id" element={<SubjectsShow />} />
                  </Route>

                  <Route path={ROUTES.CLASSES.LIST.slice(1)}>
                    <Route index element={<ClassesList />} />
                    <Route path="create" element={<ClassesCreate />} />
                    <Route path="edit/:id" element={<ClassesEdit />} /> {/* <-- ADD THIS */}
                    <Route path="show/:id" element={<ClassesShow />} />
                  </Route>

                  <Route path={ROUTES.DEPARTMENTS.LIST.slice(1)}>
                    <Route index element={<DepartmentsList />} />
                    <Route path="create" element={<DepartmentsCreate />} />
                    <Route path="edit/:id" element={<DepartmentsEdit />} /> {/* <-- ADD THIS */}
                    <Route path="show/:id" element={<DepartmentShow />} />
                  </Route>

                  <Route path={ROUTES.USERS.LIST.slice(1)}>
                    <Route index element={<FacultyList />} />
                    <Route path="show/:id" element={<FacultyShow />} />
                  </Route>

                  <Route path="enrollments">
                    <Route path="create" element={<EnrollmentsCreate />} />
                    <Route path="join" element={<EnrollmentsJoin />} />
                    <Route path="confirm" element={<EnrollmentConfirm />} />
                  </Route>
                  <Route path={ROUTES.RESOURCES.LIST.slice(1)} element={<Resources />} />
                  <Route path={ROUTES.RESOURCES.FAVORITES.slice(1)} element={<SavedResourcesPage />} />
                  <Route path={ROUTES.AVAILABILITY.slice(1)} element={<AvailabilityPage />} />
                  <Route path={ROUTES.STUDENTS.slice(1)} element={<StudentsPage />} />
                  <Route path={ROUTES.GRADE_ASSESSMENTS.slice(1)} element={<GradeAssessmentsPage />} />
                  <Route path={ROUTES.ACADEMIC_RECORDS.slice(1)} element={<GradebookPage />} />
                  <Route path={ROUTES.ATTENDANCE.LIST.slice(1)}>
                    <Route index element={<AttendanceList />} />
                    <Route path="create" element={<AttendanceCreate />} />
                  </Route>
                  <Route path={ROUTES.ANNOUNCEMENTS.slice(1)} element={<AnnouncementsPage />} />
                  <Route path={ROUTES.ADMIN_USERS.slice(1)} element={<AdminUsersPage />} />
                  <Route path={ROUTES.ROLES_PERMISSIONS.slice(1)} element={<RolesPermissionsPage />} />
                  <Route path={ROUTES.SETTINGS.slice(1)} element={<SettingsPage />} />
                  <Route path={ROUTES.CALENDAR.slice(1)} element={<CalendarPage />} />
                  <Route path={ROUTES.MY_WEEK.slice(1)} element={<CalendarPage />} />
                  <Route path={ROUTES.ASSIGNMENTS.LIST.slice(1)}>
                    <Route path="" element={<AssignmentsList />} />
                    <Route path="create" element={<AssignmentsCreate />} />
                    <Route path="show/:id" element={<AssignmentsShow />} />
                  </Route>
                  <Route path={ROUTES.ASSIGNMENTS.LEARNING.slice(1)} element={<AssignmentsList />} />
                </Route>

                {/* 2. PUBLIC AUTH ROUTES */}
                <Route
                  element={
                    <Authenticated
                      key="auth-pages"
                      fallback={<Outlet />}
                    >
                      <NavigateToResource />
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
                </Route>

                {/* 3. FALLBACK/ERROR ROUTE */}
                <Route
                  element={
                    <Authenticated
                      key="catch-all"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <Layout>
                        <Outlet />
                      </Layout>
                    </Authenticated>
                  }
                >
                  <Route path="*" element={<ErrorComponent />} />
                </Route>
                </Routes>
              </Suspense>

              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </ToolingBoundary>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
