import {
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  FolderOpen,
  GraduationCap,
  Home,
  Megaphone,
  School,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export const APP_CONFIG = {
  NAME: "Norvyx University",
  SUPPORT_EMAIL: "support@norvyx.edu",
};

export const USER_ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
};

export const ROLE_OPTIONS = [
  {
    value: USER_ROLES.STUDENT,
    label: "Student",
    icon: GraduationCap,
  },
  {
    value: USER_ROLES.TEACHER,
    label: "Teacher",
    icon: School,
  },
];

export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
export const BASE_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  DASHBOARD_STATS: "/stats/dashboard",
  MY_WEEK: "/calendar/my-week",
  ACADEMIC_RECORDS: {
    LIST: "/gradebook",
    CLASSES: "/gradebook/classes",
    SUMMARY: "/gradebook/summary",
  },
  ATTENDANCE: {
    LIST: "/attendance",
    SESSIONS: "/attendance/sessions",
    CLASSES: "/attendance/classes",
    SUMMARY: "/attendance/summary",
    CLASS_USERS: (classId: string | number) => `/classes/${classId}/users`,
  },
  RESOURCE_UPLOAD_SIGNATURE: "/resources/upload-signature",
};

export const ROLE_PERMISSION_GROUPS = [
  { label: "Academic", permissions: ["View departments", "Manage subjects", "Manage classes", "View academic calendar"] },
  { label: "Faculty", permissions: ["View faculty"] },
  { label: "Teaching", permissions: ["Manage assignments", "Manage attendance", "Manage assessments", "Manage resources"] },
  { label: "Students", permissions: ["View student directory", "Manage enrollments", "View academic records"] },
  { label: "Communication", permissions: ["Publish announcements"] },
  { label: "Administration", permissions: ["Manage users", "Manage roles and permissions", "Manage settings"] },
] as const;

export const ROLE_PERMISSION_MATRIX = {
  admin: { label: "Administrator", grantedGroups: ROLE_PERMISSION_GROUPS.map((group) => group.label) },
  teacher: { label: "Teacher", grantedGroups: ["Academic", "Faculty", "Teaching", "Students", "Communication"] },
  student: { label: "Student", grantedGroups: ["Academic", "Teaching", "Communication"] },
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  SUBJECTS: {
    LIST: "/subjects",
    CREATE: "/subjects/create",
    EDIT: "/subjects/edit/:id",
    SHOW: "/subjects/show/:id",
  },
  CLASSES: {
    LIST: "/classes",
    CREATE: "/classes/create",
    EDIT: "/classes/edit/:id",
    SHOW: "/classes/show/:id",
  },
  DEPARTMENTS: {
    LIST: "/departments",
    CREATE: "/departments/create",
    EDIT: "/departments/edit/:id",
    SHOW: "/departments/show/:id",
  },
  USERS: {
    LIST: "/users",
    SHOW: "/users/show/:id",
  },
  ENROLLMENTS: {
    CREATE: "/enrollments/create",
    JOIN: "/enrollments/join",
    CONFIRM: "/enrollments/confirm",
  },
  ASSIGNMENTS: {
    LIST: "/assignments",
    CREATE: "/assignments/create",
    SHOW: "/assignments/show/:id",
    LEARNING: "/learning/assignments",
  },
  RESOURCES: {
    LIST: "/resources",
    FAVORITES: "/resources/favorites",
  },
  ATTENDANCE: {
    LIST: "/attendance",
    CREATE: "/attendance/create",
  },
  ACADEMIC_RECORDS: "/academic-records",
  AVAILABILITY: "/availability",
  STUDENTS: "/students",
  ANNOUNCEMENTS: "/announcements",
  ADMIN_USERS: "/admin/users",
  ROLES_PERMISSIONS: "/roles-permissions",
  SETTINGS: "/settings",
  MY_WEEK: "/my-week",
} as const;

export type NavigationRole =
  (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type NavigationItemConfig = {
  id: string;
  label: string;
  route: string;
  icon: LucideIcon;
  roles: readonly NavigationRole[];
  activeRoutes?: readonly string[];
};

export type NavigationGroupConfig = {
  id: string;
  label: string;
  roles: readonly NavigationRole[];
  items: readonly NavigationItemConfig[];
};

const STAFF_ROLES = [USER_ROLES.ADMIN, USER_ROLES.TEACHER] as const;
const ALL_NAVIGATION_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.STUDENT,
] as const;

export const NAVIGATION_CONFIG = {
  defaultRole: USER_ROLES.STUDENT,
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    route: ROUTES.HOME,
    icon: Home,
    roles: ALL_NAVIGATION_ROLES,
  },
  groups: [
    {
      id: "academic",
      label: "Academic",
      roles: STAFF_ROLES,
      items: [
        { id: "departments", label: "Departments", route: ROUTES.DEPARTMENTS.LIST, icon: Building2, roles: [USER_ROLES.ADMIN] },
        { id: "subjects", label: "Subjects", route: ROUTES.SUBJECTS.LIST, icon: BookOpen, roles: STAFF_ROLES },
        { id: "classes", label: "Classes", route: ROUTES.CLASSES.LIST, icon: GraduationCap, roles: STAFF_ROLES },
        { id: "academic-calendar", label: "Academic Calendar", route: ROUTES.MY_WEEK, icon: CalendarDays, roles: STAFF_ROLES },
      ],
    },
    {
      id: "faculty",
      label: "Faculty",
      roles: STAFF_ROLES,
      items: [
        { id: "faculty-members", label: "Faculty Members", route: ROUTES.USERS.LIST, icon: Users, roles: STAFF_ROLES },
      ],
    },
    {
      id: "teaching",
      label: "Teaching",
      roles: STAFF_ROLES,
      items: [
        { id: "assignments", label: "Assignments", route: ROUTES.ASSIGNMENTS.LIST, icon: ClipboardCheck, roles: STAFF_ROLES, activeRoutes: [ROUTES.ASSIGNMENTS.LIST, ROUTES.ASSIGNMENTS.LEARNING] },
        { id: "attendance", label: "Attendance", route: ROUTES.ATTENDANCE.LIST, icon: CalendarDays, roles: STAFF_ROLES },
        { id: "grades-assessments", label: "Grades & Assessments", route: ROUTES.ACADEMIC_RECORDS, icon: FileText, roles: STAFF_ROLES },
        { id: "resources", label: "Resources & Materials", route: ROUTES.RESOURCES.LIST, icon: FolderOpen, roles: STAFF_ROLES },
      ],
    },
    {
      id: "students",
      label: "Students",
      roles: STAFF_ROLES,
      items: [
        { id: "student-directory", label: "Student Directory", route: ROUTES.STUDENTS, icon: UserRound, roles: STAFF_ROLES },
        { id: "enrollments", label: "Enrollments", route: ROUTES.ENROLLMENTS.CREATE, icon: ClipboardCheck, roles: [USER_ROLES.ADMIN] },
        { id: "academic-records", label: "Academic Records", route: ROUTES.ACADEMIC_RECORDS, icon: FileText, roles: [USER_ROLES.ADMIN] },
      ],
    },
    {
      id: "communication",
      label: "Communication",
      roles: ALL_NAVIGATION_ROLES,
      items: [
        { id: "announcements", label: "Announcements", route: ROUTES.ANNOUNCEMENTS, icon: Megaphone, roles: ALL_NAVIGATION_ROLES },
      ],
    },
    {
      id: "administration",
      label: "Administration",
      roles: [USER_ROLES.ADMIN],
      items: [
        { id: "users", label: "Users", route: ROUTES.ADMIN_USERS, icon: Users, roles: [USER_ROLES.ADMIN] },
        { id: "roles-permissions", label: "Roles & Permissions", route: ROUTES.ROLES_PERMISSIONS, icon: ShieldCheck, roles: [USER_ROLES.ADMIN] },
        { id: "settings", label: "Settings", route: ROUTES.SETTINGS, icon: Settings, roles: [USER_ROLES.ADMIN] },
      ],
    },
    {
      id: "my-academics",
      label: "My Academics",
      roles: [USER_ROLES.STUDENT],
      items: [
        { id: "my-classes", label: "My Classes", route: ROUTES.CLASSES.LIST, icon: GraduationCap, roles: [USER_ROLES.STUDENT] },
        { id: "my-assignments", label: "Assignments", route: ROUTES.ASSIGNMENTS.LEARNING, icon: ClipboardCheck, roles: [USER_ROLES.STUDENT], activeRoutes: [ROUTES.ASSIGNMENTS.LIST, ROUTES.ASSIGNMENTS.LEARNING] },
        { id: "my-attendance", label: "Attendance", route: ROUTES.ATTENDANCE.LIST, icon: CalendarDays, roles: [USER_ROLES.STUDENT] },
        { id: "my-grades", label: "Grades", route: ROUTES.ACADEMIC_RECORDS, icon: FileText, roles: [USER_ROLES.STUDENT] },
        { id: "my-calendar", label: "Academic Calendar", route: ROUTES.MY_WEEK, icon: CalendarDays, roles: [USER_ROLES.STUDENT] },
      ],
    },
    {
      id: "learning",
      label: "Learning",
      roles: [USER_ROLES.STUDENT],
      items: [
        { id: "my-resources", label: "Resources & Materials", route: ROUTES.RESOURCES.LIST, icon: FolderOpen, roles: [USER_ROLES.STUDENT] },
      ],
    },
    {
      id: "my-account",
      label: "My Account",
      roles: ALL_NAVIGATION_ROLES,
      items: [
        { id: "profile", label: "Profile", route: ROUTES.PROFILE, icon: UserRound, roles: ALL_NAVIGATION_ROLES },
      ],
    },
  ],
} as const satisfies {
  defaultRole: NavigationRole;
  dashboard: NavigationItemConfig;
  groups: readonly NavigationGroupConfig[];
};

export const CONTEXTUAL_NAVIGATION = {
  FACULTY_AVAILABILITY: {
    label: "Teaching availability",
    description: "Review your scheduled teaching commitments and available timetable gaps.",
  },
} as const;

export const ATTENDANCE_STATUS = {
  present: { label: "Present", badgeClass: "text-primary bg-primary/10 border-primary/20" },
  absent: { label: "Absent", badgeClass: "text-destructive bg-destructive/10 border-destructive/20" },
  late: { label: "Late", badgeClass: "text-muted-foreground bg-muted border-border" },
  excused: { label: "Excused", badgeClass: "text-secondary-foreground bg-secondary border-border" },
} as const;

export const PERFORMANCE_CONFIG = {
  routeLoadingLabel: "Loading page content",
  resourceSearchDebounceMs: 300,
  resourcePageSize: 24,
  queryStaleTimeMs: 15_000,
  queryGarbageCollectionTimeMs: 300_000,
  cloudinaryWidgetLoadingLabel: "Preparing secure upload",
  cloudinaryWidgetErrorLabel: "Upload service is temporarily unavailable",
} as const;

export const CLOUDINARY_WIDGET_CONFIG = {
  scriptElementId: "cloudinary-upload-widget-script",
  scriptUrl: "https://upload-widget.cloudinary.com/latest/global/all.js",
  uploadFolder: "uploads",
  maxFileSizeBytes: 10_000_000,
} as const;

export const UI_TOKENS = {
  motion: {
    fast: "var(--motion-duration-fast)",
    standard: "var(--motion-duration-standard)",
  },
  icon: {
    inline: "var(--icon-size-inline)",
    button: "var(--icon-size-button)",
    navigation: "var(--icon-size-navigation)",
  },
} as const;

export const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Economics",
  "Business Administration",
  "Engineering",
  "Psychology",
  "Sociology",
  "Political Science",
  "Philosophy",
  "Education",
  "Fine Arts",
  "Music",
  "Physical Education",
  "Law",
] as const;

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
  value: dept,
  label: dept,
}));

export const MAX_FILE_SIZE = 3 * 1024 * 1024;
export const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

export const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;
export const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY;
export const REFRESH_TOKEN_URL = `${BASE_URL}/refresh-token`;
export const CLOUDINARY_UPLOAD_URL = import.meta.env.VITE_CLOUDINARY_UPLOAD_URL;
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
