export type StaffRole = 'school_admin' | 'teacher';

export interface SchoolAdminSession {
  schoolId: string;
  staffId: string;
  userId: string;
}

export interface School {
  id: string;
  name: string;
  country: string | null;
  license_seats: number;
  license_start: string | null; // date
  license_end: string | null; // date
  status: string;
  created_at: string;
}

export interface SchoolOverview {
  school: School;
  seatsUsed: number;
  staffCount: number;
  classCount: number;
  studentCount: number;
  activeLast7Days: number;
  pendingInvites: number;
}

export interface SchoolStaffMember {
  id: string; // school_staff.id
  role: string;
  createdAt: string;
  profileId: string;
  displayName: string;
  email: string;
  avatar: string | null;
}

export interface StaffInvite {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  trackId: string | null;
  trackName: string | null;
  academicYear: string | null;
  teacherId: string | null;
  teacherName: string | null;
  isActive: boolean;
  enrolledCount: number;
  createdAt: string;
  joinCode: ClassJoinCode | null;
}

export interface ClassJoinCode {
  id: string;
  code: string;
  isActive: boolean;
  useCount: number;
  maxUses: number | null;
  expiresAt: string | null;
}

export interface SchoolStudent {
  profileId: string;
  enrollmentId?: string; // present when returned from getClassRoster; absent from getSchoolStudents
  displayName: string;
  email: string;
  avatar: string | null;
  age: number;
  ageGroup: string;
  classNames: string[];
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}
export interface ClassCompletionStat {
  classId: string;
  className: string;
  enrolledCount: number;
  completionPct: number;
}

export interface SchoolAssignmentStats {
  totalPossible: number;
  totalCompleted: number;
  completionPct: number;
  ungradedCount: number;
  byClass: ClassCompletionStat[];
}

export interface EngagementDay {
  date: string; // YYYY-MM-DD
  activeCount: number;
}