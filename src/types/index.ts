export type Subject = {
  id: number;
  name: string;
  code: string;
  description: string;
  department: string;
  createdAt?: string;
};

export type ListResponse<T = unknown> = {
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateResponse<T = unknown> = {
  data?: T;
};

export type GetOneResponse<T = unknown> = {
  data?: T;
};

export interface UploadWidgetValue {
  url: string;
  assetId?: string;
  publicId?: string;
}

export interface UploadWidgetProps {
  value?: UploadWidgetValue | null;
  onChange?: (value: UploadWidgetValue | null) => void;
  disabled?: boolean;
}

export interface StorageUploadValue {
  assetId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
}

export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin",
}

export type User = {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string;
  imageCldPubId?: string;
  department?: string;
};

export type Schedule = {
  day: string;
  startTime: string;
  endTime: string;
};

export type Department = {
  id: number;
  name: string;
  description: string;
};

export type ClassDetails = {
  id: number;
  name: string;
  description: string;
  status: "active" | "inactive";
  capacity: number;
  courseCode: string;
  courseName: string;
  bannerUrl?: string;
  bannerCldPubId?: string;
  subject?: Subject;
  teacher?: User;
  department?: Department;
  schedules: Schedule[];
  inviteCode?: string;
};

export type SignUpPayload = {
  email: string;
  name: string;
  password: string;
  image?: string;
  imageCldPubId?: string;
  role: UserRole;
};

export type AssignmentRubricCriterion = {
  id: string;
  title: string;
  description?: string;
  maxPoints: number;
};

export type SubmissionRubricScore = {
  criterionId: string;
  points: number;
  feedback?: string;
};

export type Assignment = {
  id: number;
  classId: number;
  authorId?: string;
  title: string;
  description: string;
  dueAt?: string | null;
  maxPoints: number;
  rubric?: AssignmentRubricCriterion[];
  allowResubmissions?: boolean;
  resubmissionDeadline?: string | null;
  attachmentUrl?: string | null;
  attachmentAssetId?: string | null;
  attachmentName?: string | null;
  attachmentMimeType?: string | null;
  attachmentSizeBytes?: number | null;
  createdAt?: string;
  updatedAt?: string;
  className?: string;
  submission?: {
    id: number;
    content: string;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
    attachmentMimeType?: string | null;
    attachmentSizeBytes?: number | null;
    submittedAt?: string | null;
    grade?: number | null;
    feedback?: string | null;
    rubricScores?: SubmissionRubricScore[];
  } | null;
};

export type Submission = {
  id: number;
  assignmentId: number;
  studentId: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentAssetId?: string | null;
  attachmentName?: string | null;
  attachmentMimeType?: string | null;
  attachmentSizeBytes?: number | null;
  submittedAt: string;
  grade?: number | null;
  feedback?: string | null;
  rubricScores?: SubmissionRubricScore[];
  student: User;
};

export type AttendanceRecord = {
  id: number;
  sessionId: number;
  studentId: string;
  status: "present" | "absent" | "late" | "excused";
  note?: string | null;
  student?: User;
};

export type AttendanceCorrection = {
  id: number;
  attendanceRecordId: number;
  studentId: string;
  studentName?: string;
  requestedStatus: AttendanceRecord["status"];
  currentStatus: AttendanceRecord["status"];
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewerId?: string | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  sessionId: number;
  sessionDate: string;
  classId: number;
};

export type AttendanceSession = {
  id: number;
  classId: number;
  sessionDate: string;
  notes?: string | null;
  teacherId: string;
  createdAt: string;
  records: AttendanceRecord[];
  summary?: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
};

export type GradebookEntry = {
  id: number;
  classId: number;
  teacherId: string;
  studentId: string;
  title: string;
  points: number;
  maxPoints: number;
  feedback?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  className?: string;
};
