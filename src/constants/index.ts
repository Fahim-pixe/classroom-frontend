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

export const API_RESPONSE_POLICY = {
  credentials: "include" as RequestCredentials,
  jsonContentType: "application/json",
  unexpectedResponseMessage: "The server returned an unexpected response. Please refresh and try again.",
  fallbackErrorMessage: "The request could not be completed. Please refresh and try again.",
} as const;

export const API_ENDPOINTS = {
  DASHBOARD_STATS: "/stats/dashboard",
  CLASSES: {
    LIST: "classes",
  },
  ASSIGNMENTS: {
    LIST: "assignments",
  },
  MY_WEEK: "/calendar/my-week",
  ACADEMIC_RECORDS: {
    LIST: "/gradebook",
    CLASSES: "/gradebook/classes",
    SUMMARY: "/gradebook/summary",
    CATEGORIES: "/gradebook/categories",
    EXPORT: "/gradebook/export",
    RELEASE: (entryId: string | number) => `/gradebook/${entryId}/release`,
    AUDIT: (entryId: string | number) => `/gradebook/${entryId}/audit`,
    CLASS_USERS: (classId: string | number) => `/classes/${classId}/users`,
  },
  ATTENDANCE: {
    LIST: "/attendance",
    SESSIONS: "/attendance/sessions",
    CLASSES: "/attendance/classes",
    SUMMARY: "/attendance/summary",
    CORRECTIONS: "/attendance/corrections",
    CORRECTION_BY_ID: (correctionId: number) => `/attendance/corrections/${correctionId}`,
    CLASS_USERS: (classId: string | number) => `/classes/${classId}/users`,
  },
  RESOURCE_UPLOAD_SIGNATURE: "/resources/upload-signature",
  RESOURCES: {
    VERSION: (resourceId: number) => `/resources/${resourceId}/version`,
    ARCHIVE: (resourceId: number) => `/resources/${resourceId}/archive`,
    RESTORE: (resourceId: number) => `/resources/${resourceId}/restore`,
  },
  CLASS_LIFECYCLE: {
    ARCHIVE: (classId: number) => `/classes/${classId}/archive`,
    RESTORE: (classId: number) => `/classes/${classId}/restore`,
    ROTATE_INVITE: (classId: number) => `/classes/${classId}/invite-code`,
    DUPLICATE: (classId: number) => `/classes/${classId}/duplicate`,
  },
  MONITORING: {
    WEB_VITALS: "/monitoring/web-vitals",
  },
  STORAGE: {
    UPLOAD_INTENTS: "/storage/upload-intents",
    CONFIRM_UPLOAD_INTENT: (intentId: string) => `/storage/upload-intents/${intentId}/confirm`,
    CANCEL_UPLOAD_INTENT: (intentId: string) => `/storage/upload-intents/${intentId}/cancel`,
    ACCESS_ASSET: (assetId: string, mode: "preview" | "download" = "preview") => `/storage/assets/${assetId}/access?mode=${mode}`,
    REDIRECT_ASSET: (assetId: string) => `/storage/assets/${assetId}/redirect`,
  },
};

export const GRADEBOOK_WORKFLOW_CONFIG = {
  category: {
    maximumTitleLength: 120,
    minimumWeight: 1,
    maximumWeight: 100,
  },
  entry: {
    maximumTitleLength: 200,
    maximumFeedbackLength: 5_000,
  },
  copy: {
    categoryTitle: "Grade categories",
    categoryDescription: "Use weighted categories to make academic records easier to interpret.",
    categoryNameLabel: "Category name",
    categoryWeightLabel: "Weight",
    addCategory: "Add category",
    categoryPending: "Adding grade category…",
    categorySuccess: "Grade category added",
    categoryError: "Unable to add grade category",
    categoryErrorDescription: "Please review the category and try again.",
    categoryEmpty: "No grade categories have been created for this class.",
    categorySelectLabel: "Category",
    categorySelectPlaceholder: "No category",
    releaseLabel: "Release to student",
    released: "Released",
    withheld: "Withheld",
    updateRelease: "Update release state",
    releasePending: "Updating release state…",
    releaseSuccess: "Grade release state updated",
    releaseError: "Unable to update grade release state",
    releaseErrorDescription: "Please try again.",
    auditTitle: "Grade audit history",
    auditLoading: "Loading audit history…",
    auditEmpty: "No audit records are available for this assessment.",
    auditError: "Audit history could not be loaded. Please try again.",
    export: "Export CSV",
    exportPending: "Preparing export…",
    exportSuccess: "Gradebook export downloaded",
    exportError: "Unable to export gradebook",
    exportErrorDescription: "Please try again.",
    weightedAverage: "Weighted average",
    scoreLabel: "Score",
  },
} as const;

export const ATTENDANCE_WORKFLOW_CONFIG = {
  correction: {
    maximumReasonLength: 1_000,
    maximumReviewNoteLength: 1_000,
    reviewDecisions: {
      approved: "approved",
      rejected: "rejected",
    },
    copy: {
      requestTitle: "Request a correction",
      requestDescription: "Explain why this attendance record should be changed.",
      reasonLabel: "Reason for correction",
      requestedStatusLabel: "Requested status",
      submitRequest: "Submit correction request",
      requestPending: "Submitting correction request…",
      requestSuccess: "Correction request submitted",
      requestSuccessDescription: "Your instructor can now review this attendance record.",
      requestError: "Unable to request a correction",
      requestErrorDescription: "Please review the request and try again.",
      alreadyPending: "A correction request is awaiting review.",
      staffTitle: "Attendance correction requests",
      staffDescription: "Approve requests only after confirming the attendance record.",
      loading: "Loading correction requests…",
      loadError: "Attendance correction requests could not be loaded. Please refresh and try again.",
      pendingReview: "Pending review",
      reviewedStatePrefix: "Correction",
      reviewNoteLabel: "Review note",
      approve: "Approve correction",
      reject: "Reject correction",
      reviewPending: "Saving correction review…",
      reviewSuccess: "Correction review saved",
      reviewSuccessDescription: "Attendance information has been refreshed.",
      reviewError: "Unable to save correction review",
      reviewErrorDescription: "Please try again.",
      noPending: "No correction requests are awaiting review for this class.",
    },
  },
} as const;

export const RESOURCE_LIST_CONFIG = {
  queryParams: {
    favoritesOnly: "favoritesOnly",
    folder: "folder",
    tag: "tag",
    includeExpired: "includeExpired",
  },
} as const;

export const RESOURCE_LIFECYCLE_CONFIG = {
  metadata: {
    maximumFolderLength: 120,
    maximumTagCount: 10,
    maximumTagLength: 40,
  },
  copy: {
    folderPlaceholder: "Folder (optional)",
    tagsPlaceholder: "Tags, separated by commas",
    expiryLabel: "Available until (optional)",
    archive: "Archive material",
    restore: "Restore material",
    revise: "Save revision",
    revisionPending: "Saving material revision…",
    revisionSuccess: "Material revision saved",
    revisionError: "Unable to save material revision",
    errorDescription: "Please try again.",
    archivePending: "Archiving material…",
    archiveSuccess: "Material archived",
    archiveError: "Unable to archive material",
    restorePending: "Restoring material…",
    restoreSuccess: "Material restored",
    restoreError: "Unable to restore material",
    expired: "Expired",
    versionPrefix: "Version",
  },
} as const;

export const CLASS_LIFECYCLE_CONFIG = {
  copy: {
    archive: "Archive class",
    restore: "Restore class",
    duplicate: "Duplicate class",
    rotateInvite: "Rotate invite code",
    archivePending: "Archiving class…",
    archiveSuccess: "Class archived",
    archiveError: "Unable to archive class",
    errorDescription: "Please try again.",
    restorePending: "Restoring class…",
    restoreSuccess: "Class restored",
    restoreError: "Unable to restore class",
    duplicatePending: "Duplicating class…",
    duplicateSuccess: "Class duplicated as inactive",
    duplicateError: "Unable to duplicate class",
    rotatePending: "Rotating invitation code…",
    rotateSuccess: "Invitation code rotated",
    rotateError: "Unable to rotate invitation code",
  },
} as const;

export const STORAGE_CLIENT_CONFIG = {
  assetKinds: {
    avatar: "avatar",
    classBanner: "class_banner",
    resource: "resource",
    submissionAttachment: "submission_attachment",
  },
  avatarUpload: {
    maximumBytes: Number(import.meta.env.VITE_STORAGE_AVATAR_MAXIMUM_BYTES ?? 5 * 1024 * 1024),
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  classBannerUpload: {
    maximumBytes: Number(import.meta.env.VITE_STORAGE_CLASS_BANNER_MAXIMUM_BYTES ?? 10 * 1024 * 1024),
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  resourceUpload: {
    maximumBytes: Number(import.meta.env.VITE_STORAGE_RESOURCE_MAXIMUM_BYTES ?? 50 * 1024 * 1024),
    allowedMimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
  },
  submissionAttachmentUpload: {
    maximumBytes: Number(import.meta.env.VITE_STORAGE_SUBMISSION_ATTACHMENT_MAXIMUM_BYTES ?? 50 * 1024 * 1024),
    allowedMimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
  },
  delivery: {
    uploadProgressMinimumPercent: 0,
    uploadProgressMaximumPercent: 100,
  },
} as const;

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
  GRADE_ASSESSMENTS: "/grades-assessments",
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
  order: number;
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
      order: 10,
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
      order: 20,
      roles: STAFF_ROLES,
      items: [
        { id: "faculty-members", label: "Faculty Members", route: ROUTES.USERS.LIST, icon: Users, roles: STAFF_ROLES },
      ],
    },
    {
      id: "teaching",
      label: "Teaching",
      order: 30,
      roles: STAFF_ROLES,
      items: [
        { id: "assignments", label: "Assignments", route: ROUTES.ASSIGNMENTS.LIST, icon: ClipboardCheck, roles: STAFF_ROLES, activeRoutes: [ROUTES.ASSIGNMENTS.LIST, ROUTES.ASSIGNMENTS.LEARNING] },
        { id: "attendance", label: "Attendance", route: ROUTES.ATTENDANCE.LIST, icon: CalendarDays, roles: STAFF_ROLES },
        { id: "grades-assessments", label: "Grades & Assessments", route: ROUTES.GRADE_ASSESSMENTS, icon: FileText, roles: STAFF_ROLES },
        { id: "resources", label: "Resources & Materials", route: ROUTES.RESOURCES.LIST, icon: FolderOpen, roles: STAFF_ROLES },
      ],
    },
    {
      id: "students",
      label: "Students",
      order: 40,
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
      order: 50,
      roles: ALL_NAVIGATION_ROLES,
      items: [
        { id: "announcements", label: "Announcements", route: ROUTES.ANNOUNCEMENTS, icon: Megaphone, roles: ALL_NAVIGATION_ROLES },
      ],
    },
    {
      id: "administration",
      label: "Administration",
      order: 60,
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
      order: 10,
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
      order: 20,
      roles: [USER_ROLES.STUDENT],
      items: [
        { id: "my-resources", label: "Resources & Materials", route: ROUTES.RESOURCES.LIST, icon: FolderOpen, roles: [USER_ROLES.STUDENT] },
      ],
    },
    {
      id: "my-account",
      label: "My Account",
      order: 70,
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
  realUserMonitoring: {
    enabled: import.meta.env.VITE_ENABLE_REAL_USER_MONITORING !== "false",
    productionOnly: true,
    deferredLoadTimeoutMilliseconds: 3_000,
    maximumReportsPerMetric: 1,
  },
  routeDataPrefetch: {
    enabled: true,
    classesPageSize: 10,
    assignmentsPageSize: 10,
    assignments: true,
    attendance: true,
    gradeAssessments: true,
    academicRecords: true,
  },
} as const;

export const ASSIGNMENT_WORKFLOW_CONFIG = {
  rubric: {
    maximumCriteria: 12,
    initialCriterionPoints: 10,
  },
  labels: {
    rubricTitle: "Rubric",
    addCriterion: "Add criterion",
    removeCriterion: "Remove criterion",
    allowResubmissions: "Allow resubmissions",
    resubmissionDeadline: "Resubmission deadline",
  },
} as const;

export const UI_TOKENS = {
  motion: {
    fast: "var(--motion-duration-fast)",
    standard: "var(--motion-duration-standard)",
  },
  viewport: {
    mobileBreakpointPx: 768,
  },
  input: {
    serverSearchDebounceMilliseconds: 300,
  },
  icon: {
    inline: "var(--icon-size-inline)",
    button: "var(--icon-size-button)",
    navigation: "var(--icon-size-navigation)",
  },
} as const;

export const MUTATION_FEEDBACK_CONFIG = {
  retryLabel: "Retry",
} as const;

export const OFFLINE_RESILIENCE_CONFIG = {
  queryNetworkMode: "offlineFirst" as const,
  queryRetryCount: 1,
  draftStoragePrefix: "classroom-draft",
  draftMaximumAgeMilliseconds: 7 * 24 * 60 * 60 * 1000,
  copy: {
    offline: "You are offline. Your unsaved form changes are stored on this device.",
    stale: "You are offline. The content shown may not include recent changes.",
    draftRestored: "Recovered a saved draft from this device.",
  },
} as const;

export const DASHBOARD_ANALYTICS_DELIVERY_POLICY = {
  visibilityGatingEnabled: true,
  compactMobileSummaryEnabled: true,
  observerRootMargin: "240px 0px",
  observerThreshold: 0,
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
