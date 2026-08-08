import {
  Refine,
  Authenticated,
} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
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
import { ROUTES } from "./constants";
import "./App.css";

// Icons
import { BookOpen, GraduationCap, Home, Building2, Users, ClipboardList, Clock3, UserRound, ShieldCheck, Settings, FolderOpen, Megaphone, ClipboardCheck, FileText, CalendarCheck } from "lucide-react";

// Auth Pages
import { Login } from "./pages/login";
import { Register } from "./pages/register";
// import { ForgotPassword } from "./pages/forgot-password"; // Uncomment if you add this file back

// Dashboard
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";

// Subjects
import SubjectsList from "./pages/subjects/list";
import SubjectsCreate from "./pages/subjects/create";
import SubjectsEdit from "./pages/subjects/edit";
import SubjectsShow from "./pages/subjects/show";

// Classes
import ClassesList from "./pages/classes/list";
import ClassesCreate from "./pages/classes/create";
import ClassesEdit from "./pages/classes/edit";
import ClassesShow from "./pages/classes/show";

// Departments
import DepartmentsList from "./pages/departments/list";
import DepartmentsCreate from "./pages/departments/create";
import DepartmentsEdit from "./pages/departments/edit";
import DepartmentShow from "./pages/departments/show";

// Faculty (Users)
import FacultyList from "./pages/faculty/list";
import FacultyShow from "./pages/faculty/show";

// Enrollments
import EnrollmentsCreate from "./pages/enrollments/create";
import EnrollmentsJoin from "./pages/enrollments/join";
import EnrollmentConfirm from "./pages/enrollments/confirm";
import ModulePlaceholder from "./pages/module-placeholder";
import Resources from "./pages/resources";

import AssignmentsList from "./pages/assignments/list";
import AssignmentsCreate from "./pages/assignments/create";
import AssignmentsShow from "./pages/assignments/show";

import AttendanceList from "./pages/attendance/list";
import AttendanceCreate from "./pages/attendance/create";

import GradebookPage from "./pages/gradebook";

import SavedResourcesPage from "./pages/resources/favorites";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider} // <-- Injected Auth Provider
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "oQXqvS-Zw4CAo-QWHyYk",
              }}
              resources={[
                { name: "dashboard", list: ROUTES.HOME, meta: { label: "Dashboard", icon: <Home /> } },
                { name: "academic", meta: { label: "Academic", group: true } },
                { name: "departments", list: ROUTES.DEPARTMENTS.LIST, create: ROUTES.DEPARTMENTS.CREATE, edit: ROUTES.DEPARTMENTS.EDIT, show: ROUTES.DEPARTMENTS.SHOW, meta: { label: "Departments", icon: <Building2 />, parent: "academic" } },
                { name: "subjects", list: ROUTES.SUBJECTS.LIST, create: ROUTES.SUBJECTS.CREATE, edit: ROUTES.SUBJECTS.EDIT, show: ROUTES.SUBJECTS.SHOW, meta: { label: "Subjects", icon: <BookOpen />, parent: "academic" } },
                { name: "classes", list: ROUTES.CLASSES.LIST, create: ROUTES.CLASSES.CREATE, edit: ROUTES.CLASSES.EDIT, show: ROUTES.CLASSES.SHOW, meta: { label: "Classes", icon: <GraduationCap />, parent: "academic" } },
                { name: "faculty", meta: { label: "Faculty", group: true } },
                { name: "faculty-members", list: ROUTES.USERS.LIST, show: ROUTES.USERS.SHOW, meta: { label: "Faculty Members", icon: <Users />, parent: "faculty" } },
                { name: "assignments", list: ROUTES.ASSIGNMENTS.LIST, meta: { label: "Assignments", icon: <ClipboardList />, parent: "faculty" } },
                { name: "availability", list: ROUTES.AVAILABILITY, meta: { label: "Availability", icon: <Clock3 />, parent: "faculty" } },
                { name: "students", meta: { label: "Students", group: true } },
                { name: "student-directory", list: ROUTES.STUDENTS, meta: { label: "Student Directory", icon: <UserRound />, parent: "students" } },
                { name: "enrollments", list: ROUTES.ENROLLMENTS.CREATE, meta: { label: "Enrollments", icon: <ClipboardList />, parent: "students" } },
                { name: "academic-records", list: ROUTES.ACADEMIC_RECORDS, meta: { label: "Academic Records", icon: <FileText />, parent: "students" } },
                { name: "learning", meta: { label: "Learning", group: true } },
                { name: "resources", list: ROUTES.RESOURCES.LIST, meta: { label: "Resources & Materials", icon: <FolderOpen />, parent: "learning" } },
                { name: "learning-assignments", list: ROUTES.ASSIGNMENTS.LEARNING, meta: { label: "Assignments", icon: <ClipboardCheck />, parent: "learning" } },
                { name: "attendance", list: ROUTES.ATTENDANCE.LIST, meta: { label: "Attendance", icon: <CalendarCheck />, parent: "learning" } },
                { name: "announcements", list: ROUTES.ANNOUNCEMENTS, meta: { label: "Announcements", icon: <Megaphone />, parent: "learning" } },
                { name: "administration", meta: { label: "Administration", group: true } },
                { name: "admin-users", list: ROUTES.ADMIN_USERS, meta: { label: "Users", icon: <Users />, parent: "administration" } },
                { name: "roles-permissions", list: ROUTES.ROLES_PERMISSIONS, meta: { label: "Roles & Permissions", icon: <ShieldCheck />, parent: "administration" } },
                { name: "settings", list: ROUTES.SETTINGS, meta: { label: "Settings", icon: <Settings />, parent: "administration" } },
              ]}
            >
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
                  <Route path={ROUTES.AVAILABILITY.slice(1)} element={<ModulePlaceholder title="Faculty Availability" description="Faculty availability and scheduling tools will appear here." />} />
                  <Route path={ROUTES.STUDENTS.slice(1)} element={<ModulePlaceholder title="Student Directory" description="The student directory will provide searchable student profiles and enrollment context." />} />
                  <Route path={ROUTES.ACADEMIC_RECORDS.slice(1)} element={<GradebookPage />} />
                  <Route path={ROUTES.ATTENDANCE.LIST.slice(1)}>
                    <Route index element={<AttendanceList />} />
                    <Route path="create" element={<AttendanceCreate />} />
                  </Route>
                  <Route path={ROUTES.ANNOUNCEMENTS.slice(1)} element={<ModulePlaceholder title="Announcements" description="Announcements will centralize updates for classes, faculty, and students." />} />
                  <Route path={ROUTES.ADMIN_USERS.slice(1)} element={<ModulePlaceholder title="Users" description="User administration is reserved for authorized administrators." />} />
                  <Route path={ROUTES.ROLES_PERMISSIONS.slice(1)} element={<ModulePlaceholder title="Roles & Permissions" description="Role and permission management is reserved for authorized administrators." />} />
                  <Route path={ROUTES.SETTINGS.slice(1)} element={<ModulePlaceholder title="Settings" description="Application settings will be available here for authorized administrators." />} />
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

              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
