import { GraduationCap, School } from "lucide-react";

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
  RESOURCE_UPLOAD_SIGNATURE: "/resources/upload-signature",
};

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
