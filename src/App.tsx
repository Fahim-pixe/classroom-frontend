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
import "./App.css";

// Icons
import { BookOpen, GraduationCap, Home, Building2, Users, ClipboardList } from "lucide-react";

// Auth Pages
import { Login } from "./pages/login";
import { Register } from "./pages/register";
// import { ForgotPassword } from "./pages/forgot-password"; // Uncomment if you add this file back

// Dashboard
import Dashboard from "@/pages/dashboard";

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
                {
                  name: "dashboard",
                  list: "/",
                  meta: { label: "Home", icon: <Home /> }
                },
                {
                  name: "subjects",
                  list: "/subjects",
                  create: "/subjects/create",
                  edit: "/subjects/edit/:id", // <-- ADD THIS
                  show: "/subjects/show/:id",
                  meta: { label: "Subjects", icon: <BookOpen />},
                },
                {
                  name: "classes",
                  list: "/classes",
                  create: "/classes/create",
                  edit: "/classes/edit/:id", // <-- ADD THIS
                  show: "/classes/show/:id",
                  meta: { label: "Classes", icon: <GraduationCap />}
                },
                {
                  name: "departments",
                  list: "/departments",
                  create: "/departments/create",
                  edit: "/departments/edit/:id", // <-- ADD THIS
                  show: "/departments/show/:id",
                  meta: { label: "Departments", icon: <Building2 />}
                },
                {
                  name: "users",
                  list: "/users",
                  show: "/users/show/:id",
                  meta: { label: "Faculty", icon: <Users />}
                },
                {
                  name: "enrollments",
                  list: "/enrollments/create",
                  meta: { label: "Enroll", icon: <ClipboardList />}
                }
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
                  <Route path="/" element={<Dashboard />} />
                  
                  <Route path="subjects">
                    <Route index element={<SubjectsList />} />
                    <Route path="create" element={<SubjectsCreate />} />
                    <Route path="edit/:id" element={<SubjectsEdit />} /> {/* <-- ADD THIS */}
                    <Route path="show/:id" element={<SubjectsShow />} />
                  </Route>

                  <Route path="classes">
                    <Route index element={<ClassesList />} />
                    <Route path="create" element={<ClassesCreate />} />
                    <Route path="edit/:id" element={<ClassesEdit />} /> {/* <-- ADD THIS */}
                    <Route path="show/:id" element={<ClassesShow />} />
                  </Route>

                  <Route path="departments">
                    <Route index element={<DepartmentsList />} />
                    <Route path="create" element={<DepartmentsCreate />} />
                    <Route path="edit/:id" element={<DepartmentsEdit />} /> {/* <-- ADD THIS */}
                    <Route path="show/:id" element={<DepartmentShow />} />
                  </Route>

                  <Route path="users">
                    <Route index element={<FacultyList />} />
                    <Route path="show/:id" element={<FacultyShow />} />
                  </Route>

                  <Route path="enrollments">
                    <Route path="create" element={<EnrollmentsCreate />} />

                    <Route path="join" element={<EnrollmentsJoin />} />
                    <Route path="confirm" element={<EnrollmentConfirm />} />
                  </Route>
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