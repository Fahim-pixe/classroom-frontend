import { ROUTES } from "@/constants";

type RoutePreloader = () => Promise<unknown>;

const routePreloaders: Record<string, RoutePreloader> = {
  [ROUTES.HOME]: () => import("@/pages/dashboard"),
  [ROUTES.PROFILE]: () => import("@/pages/profile"),
  [ROUTES.SUBJECTS.LIST]: () => import("@/pages/subjects/list"),
  [ROUTES.CLASSES.LIST]: () => import("@/pages/classes/list"),
  [ROUTES.DEPARTMENTS.LIST]: () => import("@/pages/departments/list"),
  [ROUTES.USERS.LIST]: () => import("@/pages/faculty/list"),
  [ROUTES.ENROLLMENTS.CREATE]: () => import("@/pages/enrollments/create"),
  [ROUTES.RESOURCES.LIST]: () => import("@/pages/resources"),
  [ROUTES.ATTENDANCE.LIST]: () => import("@/pages/attendance/list"),
  [ROUTES.GRADE_ASSESSMENTS]: () => import("@/pages/gradebook/manage"),
  [ROUTES.ACADEMIC_RECORDS]: () => import("@/pages/gradebook"),
  [ROUTES.STUDENTS]: () => import("@/pages/students"),
  [ROUTES.ANNOUNCEMENTS]: () => import("@/pages/announcements"),
  [ROUTES.ADMIN_USERS]: () => import("@/pages/admin-users"),
  [ROUTES.ROLES_PERMISSIONS]: () => import("@/pages/roles-permissions"),
  [ROUTES.SETTINGS]: () => import("@/pages/settings"),
  [ROUTES.MY_WEEK]: () => import("@/pages/my-week"),
  [ROUTES.ASSIGNMENTS.LIST]: () => import("@/pages/assignments/list"),
  [ROUTES.ASSIGNMENTS.LEARNING]: () => import("@/pages/assignments/list"),
};

const requestedRoutes = new Set<string>();

export function preloadRoute(route: string) {
  if (requestedRoutes.has(route)) {
    return;
  }

  const preload = routePreloaders[route];
  if (!preload) {
    return;
  }

  requestedRoutes.add(route);
  void preload().catch(() => {
    requestedRoutes.delete(route);
  });
}
