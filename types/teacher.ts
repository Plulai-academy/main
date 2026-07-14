export interface TeacherSession {
  schoolId: string;
  staffId: string;
  userId: string;
  role: 'teacher' | 'school_admin';
}
export interface Assignment {
  id: string;
  classId: string;
  sourceType: 'lesson' | 'skill_node' | 'custom';
  lessonId: string | null;
  skillNodeId: string | null;
  title: string;
  emoji: string | null;
  instructions: string | null;
  dueDate: string | null;
  createdAt: string;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
}

export interface AssignmentSubmissionRow {
  studentId: string;
  displayName: string;
  email: string;
  submissionId: string | null;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  submissionContent: string | null;
  projectUrl: string | null;
  videoUrl: string | null;
  grade: string | null;
  feedback: string | null;
  submittedAt: string | null;
}