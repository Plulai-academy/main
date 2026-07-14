export interface AdminSession {
  userId: string;
}

export interface AdminSchoolRow {
  id: string;
  name: string;
  country: string | null;
  status: string;
  licenseSeats: number;
  licenseStart: string | null;
  licenseEnd: string | null;
  createdAt: string;
  staffCount: number;
  studentCount: number;
}
export interface AdminUserRow {
  id: string;
  displayName: string;
  email: string;
  accountType: string;
  schoolId: string | null;
  schoolName: string | null;
  subscription: string | null;
  xp: number;
  lastActiveDate: string | null;
  createdAt: string;
}
export interface AdminTrack {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminSkillNode {
  id: string;
  trackId: string;
  title: string;
  emoji: string;
  description: string;
  xpReward: number;
  sortOrder: number;
  requiredNodes: string[];
  ageGroups: string[];
  isActive: boolean;
}

export interface AdminLesson {
  id: string;
  skillNodeId: string;
  title: string;
  emoji: string;
  description: string;
  lessonType: string;
  xpReward: number;
  durationMins: number;
  sortOrder: number;
  ageGroups: string[];
  contentJson: string; // stringified for the editor
  isActive: boolean;
}