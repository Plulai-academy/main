// Data-access layer for the school admin dashboard.
//
// Uses your browser Supabase client. Companion to lib/supabase/server.ts —
// if you don't have lib/supabase/client.ts yet, create it (see README).
import { createClient } from '@/lib/supabase/client';
import type { Assignment, AssignmentSubmissionRow } from '@/types/teacher';
import type { ClassCompletionStat, SchoolAssignmentStats, EngagementDay } from '@/types/schoolAdmin';

import type {
  School,
  SchoolOverview,
  SchoolStaffMember,
  StaffInvite,
  SchoolClass,
  SchoolStudent,
} from '@/types/schoolAdmin';

const supabase = createClient();

export async function getSchoolName(schoolId: string): Promise<string> {
  const { data, error } = await supabase.from('schools').select('name').eq('id', schoolId).single();
  if (error) throw error;
  return data.name;
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export async function getSchoolOverview(schoolId: string): Promise<SchoolOverview> {
  const [{ data: school, error: schoolErr }, staffCount, classCount, studentCount, activeCount, inviteCount] =
    await Promise.all([
      supabase.from('schools').select('*').eq('id', schoolId).single(),
      supabase.from('school_staff').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
      supabase.from('classes').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
      supabase
        .from('profiles')
        .select('id, user_progress!inner(last_active_date)', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .gte('user_progress.last_active_date', sevenDaysAgo()),
      supabase
        .from('staff_invites')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .is('accepted_at', null),
    ]);

  if (schoolErr || !school) {
    throw schoolErr ?? new Error('School not found');
  }

  return {
    school: school as School,
    seatsUsed: studentCount.count ?? 0,
    staffCount: staffCount.count ?? 0,
    classCount: classCount.count ?? 0,
    studentCount: studentCount.count ?? 0,
    activeLast7Days: activeCount.count ?? 0,
    pendingInvites: inviteCount.count ?? 0,
  };
}

function sevenDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------

export async function getSchoolStaff(schoolId: string): Promise<SchoolStaffMember[]> {
  const { data, error } = await supabase
    .from('school_staff')
    .select('id, role, created_at, profile_id, profiles!inner(display_name, email, avatar)')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    role: row.role,
    createdAt: row.created_at,
    profileId: row.profile_id,
    displayName: row.profiles.display_name,
    email: row.profiles.email,
    avatar: row.profiles.avatar,
  }));
}

export async function getPendingInvites(schoolId: string): Promise<StaffInvite[]> {
  const { data, error } = await supabase
    .from('staff_invites')
    .select('id, email, role, token, expires_at, created_at')
    .eq('school_id', schoolId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    token: row.token,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }));
}

export async function inviteStaffMember(params: {
  schoolId: string;
  email: string;
  role: 'school_admin' | 'teacher';
  invitedBy: string; // profile id of the current admin
}): Promise<StaffInvite> {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await supabase
    .from('staff_invites')
    .insert({
      school_id: params.schoolId,
      email: params.email,
      role: params.role,
      token,
      invited_by: params.invitedBy,
      expires_at: expiresAt.toISOString(),
    })
    .select('id, email, role, token, expires_at, created_at')
    .single();

  if (error) throw error;

  // Fire the invite email. Don't block the UI on delivery — log failures
  // instead of throwing, so a Resend hiccup doesn't break the invite flow.
  fetch('/api/school-admin/send-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviteId: data.id }),
  }).catch((err) => console.error('Failed to trigger invite email', err));

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    token: data.token,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
  };
}
export async function revokeInvite(inviteId: string): Promise<void> {
  const { error } = await supabase.from('staff_invites').delete().eq('id', inviteId);
  if (error) throw error;
}

export async function removeStaffMember(schoolStaffId: string): Promise<void> {
  const { error } = await supabase.from('school_staff').delete().eq('id', schoolStaffId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------
export async function getSchoolClasses(schoolId: string, includeInactive = false): Promise<SchoolClass[]> {
  let query = supabase
    .from('classes')
    .select(
      `id, name, track_id, academic_year, teacher_id, created_at, is_active,
       tracks(name),
       teacher:school_staff!teacher_id(profile:profiles(display_name)),
       class_enrollments(id, status),
       class_join_codes(id, code, is_active, use_count, max_uses, expires_at, created_at)`
    )
    .eq('school_id', schoolId);

  if (!includeInactive) query = query.eq('is_active', true);

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const activeCodes = (row.class_join_codes ?? [])
      .filter((c: any) => c.is_active)
      .sort((a: any, b: any) => (a.created_at < b.created_at ? 1 : -1));
    const code = activeCodes[0];

    return {
      id: row.id,
      name: row.name,
      trackId: row.track_id,
      trackName: row.tracks?.name ?? null,
      academicYear: row.academic_year,
      teacherId: row.teacher_id,
      teacherName: row.teacher?.profile?.display_name ?? null,
      isActive: row.is_active,
      enrolledCount: (row.class_enrollments ?? []).filter((e: any) => e.status === 'active').length,
      createdAt: row.created_at,
      joinCode: code
        ? {
            id: code.id,
            code: code.code,
            isActive: code.is_active,
            useCount: code.use_count,
            maxUses: code.max_uses,
            expiresAt: code.expires_at,
          }
        : null,
    };
  });
}
export async function createClass(params: {
  schoolId: string;
  name: string;
  trackId: string | null;
  teacherId: string | null;
  academicYear: string | null;
}): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('classes')
    .insert({
      school_id: params.schoolId,
      name: params.name,
      track_id: params.trackId,
      teacher_id: params.teacherId,
      academic_year: params.academicYear,
    })
    .select('id')
    .single();

  if (error) throw error;
  return { id: data.id };
}

function randomJoinCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
  let out = '';
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function createJoinCode(params: {
  classId: string;
  createdBy: string;
  maxUses?: number | null;
  expiresInDays?: number | null;
}): Promise<{ code: string }> {
  const expiresAt = params.expiresInDays
    ? new Date(Date.now() + params.expiresInDays * 86400_000).toISOString()
    : null;

  const { data, error } = await supabase
    .from('class_join_codes')
    .insert({
      class_id: params.classId,
      code: randomJoinCode(),
      created_by: params.createdBy,
      max_uses: params.maxUses ?? null,
      expires_at: expiresAt,
      use_count: 0,
      is_active: true,
    })
    .select('code')
    .single();

  if (error) throw error;
  return { code: data.code };
}

export async function getTracks(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase.from('tracks').select('id, name').eq('is_active', true).order('sort_order');
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

export async function getSchoolStudents(schoolId: string, classId?: string): Promise<SchoolStudent[]> {
  let profileIds: string[] | null = null;

  if (classId) {
    const { data: enrollments, error: enrollErr } = await supabase
      .from('class_enrollments')
      .select('student_id')
      .eq('class_id', classId)
      .eq('status', 'active');
    if (enrollErr) throw enrollErr;
    const ids = (enrollments ?? []).map((e: any) => e.student_id);
    if (ids.length === 0) return [];
    profileIds = ids;
  }

  let query = supabase
    .from('profiles')
    .select(
      `id, display_name, email, avatar, age, age_group,
       user_progress(xp, level, streak, longest_streak, last_active_date),
       class_enrollments(status, classes(name))`
    )
    .eq('school_id', schoolId);

  if (profileIds) query = query.in('id', profileIds);

  const { data, error } = await query.order('display_name', { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const progress = Array.isArray(row.user_progress) ? row.user_progress[0] : row.user_progress;

    return {
      profileId: row.id,
      displayName: row.display_name,
      email: row.email,
      avatar: row.avatar,
      age: row.age,
      ageGroup: row.age_group,
      classNames: (row.class_enrollments ?? [])
        .filter((e: any) => e.status === 'active' && e.classes)
        .map((e: any) => e.classes.name),
      xp: progress?.xp ?? 0,
      level: progress?.level ?? 1,
      streak: progress?.streak ?? 0,
      longestStreak: progress?.longest_streak ?? 0,
      lastActiveDate: progress?.last_active_date ?? null,
    };
  });
}
export async function getClassRoster(classId: string): Promise<(SchoolStudent & { enrollmentId: string })[]> {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select(
      `id, status,
       student:profiles!student_id(id, display_name, email, avatar, age, age_group,
         user_progress(xp, level, streak, longest_streak, last_active_date))`
    )
    .eq('class_id', classId)
    .eq('status', 'active')
    .order('enrolled_at', { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((row: any) => row.student)
    .map((row: any) => ({
      enrollmentId: row.id,
      profileId: row.student.id,
      displayName: row.student.display_name,
      email: row.student.email,
      avatar: row.student.avatar,
      age: row.student.age,
      ageGroup: row.student.age_group,
      classNames: [],
      xp: row.student.user_progress?.xp ?? 0,
      level: row.student.user_progress?.level ?? 1,
      streak: row.student.user_progress?.streak ?? 0,
      longestStreak: row.student.user_progress?.longest_streak ?? 0,
      lastActiveDate: row.student.user_progress?.last_active_date ?? null,
    }));
}

// ---------------------------------------------------------------------------
// Class editing / soft-disable / join code revoke
// ---------------------------------------------------------------------------

export async function updateClass(params: {
  classId: string;
  name: string;
  trackId: string | null;
  teacherId: string | null;
  academicYear: string | null;
}): Promise<void> {
  const { error } = await supabase
    .from('classes')
    .update({
      name: params.name,
      track_id: params.trackId,
      teacher_id: params.teacherId,
      academic_year: params.academicYear,
    })
    .eq('id', params.classId);
  if (error) throw error;
}

export async function setClassActive(classId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('classes').update({ is_active: isActive }).eq('id', classId);
  if (error) throw error;
}

export async function revokeJoinCode(joinCodeId: string): Promise<void> {
  const { error } = await supabase.from('class_join_codes').update({ is_active: false }).eq('id', joinCodeId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Student enrollment management (add / revoke)
// ---------------------------------------------------------------------------

export async function searchAvailableStudents(
  schoolId: string,
  query: string
): Promise<{ id: string; displayName: string; email: string }[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('school_id', schoolId)
    .ilike('display_name', `%${query}%`)
    .limit(10);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ id: r.id, displayName: r.display_name, email: r.email }));
}

export async function addStudentToClass(classId: string, studentId: string): Promise<void> {
  const { error } = await supabase
    .from('class_enrollments')
    .upsert(
      { class_id: classId, student_id: studentId, status: 'active', enrolled_at: new Date().toISOString() },
      { onConflict: 'class_id,student_id' }
    );
  if (error) throw error;
}

export async function revokeStudentEnrollment(enrollmentId: string): Promise<void> {
  const { error } = await supabase.from('class_enrollments').update({ status: 'removed' }).eq('id', enrollmentId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Assignments
// ---------------------------------------------------------------------------

export async function getLessonsForTrack(trackId: string): Promise<{ id: string; title: string; emoji: string }[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, emoji, skill_nodes!inner(track_id)')
    .eq('skill_nodes.track_id', trackId)
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ id: r.id, title: r.title, emoji: r.emoji }));
}

export async function getSkillNodesForTrack(trackId: string): Promise<{ id: string; title: string; emoji: string }[]> {
  const { data, error } = await supabase
    .from('skill_nodes')
    .select('id, title, emoji')
    .eq('track_id', trackId)
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getClassAssignments(classId: string): Promise<Assignment[]> {
  const { data: assignments, error } = await supabase
    .from('assignments')
    .select(
      `id, class_id, source_type, lesson_id, skill_node_id, title, instructions, due_date, created_at,
       lessons(title, emoji),
       skill_nodes(title, emoji)`
    )
    .eq('class_id', classId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const ids = (assignments ?? []).map((a: any) => a.id);

  const counts: Record<string, { submitted: number; graded: number }> = {};
  if (ids.length) {
    const { data: subs, error: subErr } = await supabase
      .from('assignment_submissions')
      .select('assignment_id, status')
      .in('assignment_id', ids);
    if (subErr) throw subErr;
    for (const s of subs ?? []) {
      const bucket = counts[s.assignment_id] ?? { submitted: 0, graded: 0 };
      if (s.status === 'submitted') bucket.submitted++;
      if (s.status === 'graded') bucket.graded++;
      counts[s.assignment_id] = bucket;
    }
  }

  const { count: totalStudents } = await supabase
    .from('class_enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', classId)
    .eq('status', 'active');

  return (assignments ?? []).map((a: any) => ({
    id: a.id,
    classId: a.class_id,
    sourceType: a.source_type,
    lessonId: a.lesson_id,
    skillNodeId: a.skill_node_id,
    title: a.title ?? a.lessons?.title ?? a.skill_nodes?.title ?? 'Untitled',
    emoji: a.lessons?.emoji ?? a.skill_nodes?.emoji ?? null,
    instructions: a.instructions,
    dueDate: a.due_date,
    createdAt: a.created_at,
    totalStudents: totalStudents ?? 0,
    submittedCount: counts[a.id]?.submitted ?? 0,
    gradedCount: counts[a.id]?.graded ?? 0,
  }));
}

export async function createAssignment(params: {
  classId: string;
  assignedBy: string; // school_staff.id
  sourceType: 'lesson' | 'skill_node' | 'custom';
  lessonId?: string | null;
  skillNodeId?: string | null;
  title?: string | null;
  instructions?: string | null;
  dueDate?: string | null;
}): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('assignments')
    .insert({
      class_id: params.classId,
      assigned_by: params.assignedBy,
      source_type: params.sourceType,
      lesson_id: params.sourceType === 'lesson' ? params.lessonId : null,
      skill_node_id: params.sourceType === 'skill_node' ? params.skillNodeId : null,
      title: params.sourceType === 'custom' ? params.title : null,
      instructions: params.instructions || null,
      due_date: params.dueDate || null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return { id: data.id };
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
  const { error } = await supabase.from('assignments').delete().eq('id', assignmentId);
  if (error) throw error;
}

export async function getAssignmentSubmissions(classId: string, assignmentId: string): Promise<AssignmentSubmissionRow[]> {
  const roster = await getClassRoster(classId);

  const { data: subs, error } = await supabase
    .from('assignment_submissions')
    .select('id, student_id, status, submission_content, project_url, video_url, grade, feedback, submitted_at')
    .eq('assignment_id', assignmentId);
  if (error) throw error;

  const byStudent = new Map((subs ?? []).map((s: any) => [s.student_id, s]));

  return roster.map((r) => {
    const s = byStudent.get(r.profileId);
    return {
      studentId: r.profileId,
      displayName: r.displayName,
      email: r.email,
      submissionId: s?.id ?? null,
      status: (s?.status as any) ?? 'not_started',
      submissionContent: s?.submission_content ?? null,
      projectUrl: s?.project_url ?? null,
      videoUrl: s?.video_url ?? null,
      grade: s?.grade ?? null,
      feedback: s?.feedback ?? null,
      submittedAt: s?.submitted_at ?? null,
    };
  });
}

export async function gradeSubmission(params: {
  assignmentId: string;
  studentId: string;
  submissionId: string | null;
  grade: string;
  feedback: string;
}): Promise<void> {
  if (params.submissionId) {
    const { error } = await supabase
      .from('assignment_submissions')
      .update({
        grade: params.grade,
        feedback: params.feedback,
        status: 'graded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.submissionId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('assignment_submissions').insert({
      assignment_id: params.assignmentId,
      student_id: params.studentId,
      grade: params.grade,
      feedback: params.feedback,
      status: 'graded',
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }
}
// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

export async function getAtRiskStudents(schoolId: string, daysInactive = 14): Promise<SchoolStudent[]> {
  const all = await getSchoolStudents(schoolId);
  const cutoff = Date.now() - daysInactive * 86400_000;
  return all.filter((s) => !s.lastActiveDate || new Date(s.lastActiveDate).getTime() < cutoff);
}

export async function getSchoolAssignmentStats(schoolId: string): Promise<SchoolAssignmentStats> {
  const classes = await getSchoolClasses(schoolId);
  const classIds = classes.map((c) => c.id);

  if (classIds.length === 0) {
    return { totalPossible: 0, totalCompleted: 0, completionPct: 0, ungradedCount: 0, byClass: [] };
  }

  const { data: assignments, error: aErr } = await supabase
    .from('assignments')
    .select('id, class_id')
    .in('class_id', classIds);
  if (aErr) throw aErr;

  const assignmentIds = (assignments ?? []).map((a: any) => a.id);
  const assignmentsByClass = new Map<string, string[]>();
  for (const a of assignments ?? []) {
    const list = assignmentsByClass.get(a.class_id) ?? [];
    list.push(a.id);
    assignmentsByClass.set(a.class_id, list);
  }

  const submissionsByAssignment = new Map<string, { submitted: number; graded: number }>();
  let ungradedCount = 0;

  if (assignmentIds.length) {
    const { data: subs, error: sErr } = await supabase
      .from('assignment_submissions')
      .select('assignment_id, status')
      .in('assignment_id', assignmentIds);
    if (sErr) throw sErr;

    for (const s of subs ?? []) {
      const bucket = submissionsByAssignment.get(s.assignment_id) ?? { submitted: 0, graded: 0 };
      if (s.status === 'submitted') {
        bucket.submitted++;
        ungradedCount++;
      }
      if (s.status === 'graded') bucket.graded++;
      submissionsByAssignment.set(s.assignment_id, bucket);
    }
  }

  const byClass: ClassCompletionStat[] = classes.map((c) => {
    const ids = assignmentsByClass.get(c.id) ?? [];
    const possible = ids.length * c.enrolledCount;
    const completed = ids.reduce((sum, id) => {
      const b = submissionsByAssignment.get(id);
      return sum + (b ? b.submitted + b.graded : 0);
    }, 0);
    return {
      classId: c.id,
      className: c.name,
      enrolledCount: c.enrolledCount,
      completionPct: possible > 0 ? Math.round((completed / possible) * 100) : 0,
    };
  });

  const totalPossible = byClass.reduce(
    (sum, c) => sum + (assignmentsByClass.get(c.classId)?.length ?? 0) * c.enrolledCount,
    0
  );
  const totalCompleted = byClass.reduce((sum, c) => {
    const ids = assignmentsByClass.get(c.classId) ?? [];
    return (
      sum +
      ids.reduce((s2, id) => {
        const b = submissionsByAssignment.get(id);
        return s2 + (b ? b.submitted + b.graded : 0);
      }, 0)
    );
  }, 0);

  return {
    totalPossible,
    totalCompleted,
    completionPct: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
    ungradedCount,
    byClass: byClass.sort((a, b) => b.completionPct - a.completionPct),
  };
}

export async function getEngagementTrend(schoolId: string, days = 7): Promise<EngagementDay[]> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const { data: students, error: pErr } = await supabase.from('profiles').select('id').eq('school_id', schoolId);
  if (pErr) throw pErr;
  const studentIds = (students ?? []).map((p: any) => p.id);

  const result: EngagementDay[] = Array.from({ length: days }).map((_, i) => {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    return { date: d.toISOString().slice(0, 10), activeCount: 0 };
  });

  if (studentIds.length === 0) return result;

  const { data: txns, error: tErr } = await supabase
    .from('xp_transactions')
    .select('user_id, created_at')
    .in('user_id', studentIds)
    .gte('created_at', since.toISOString());
  if (tErr) throw tErr;

  const byDay = new Map<string, Set<string>>();
  for (const t of txns ?? []) {
    const day = new Date(t.created_at).toISOString().slice(0, 10);
    const set = byDay.get(day) ?? new Set<string>();
    set.add(t.user_id);
    byDay.set(day, set);
  }

  return result.map((r) => ({ ...r, activeCount: byDay.get(r.date)?.size ?? 0 }));
}
// ---------------------------------------------------------------------------
// Curriculum browsing (teacher-facing, read-only)
// ---------------------------------------------------------------------------

export async function getTracksForBrowse(): Promise<{ id: string; name: string; emoji: string; description: string }[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('id, name, emoji, description')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getSkillNodesForBrowse(trackId: string): Promise<{ id: string; title: string; emoji: string; description: string }[]> {
  const { data, error } = await supabase
    .from('skill_nodes')
    .select('id, title, emoji, description')
    .eq('track_id', trackId)
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getLessonsForBrowse(skillNodeId: string): Promise<{ id: string; title: string; emoji: string; lesson_type: string; xp_reward: number; duration_mins: number }[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, emoji, lesson_type, xp_reward, duration_mins')
    .eq('skill_node_id', skillNodeId)
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getLessonPreview(lessonId: string): Promise<{ title: string; emoji: string; description: string; content_json: any }> {
  const { data, error } = await supabase
    .from('lessons')
    .select('title, emoji, description, content_json')
    .eq('id', lessonId)
    .single();
  if (error) throw error;
  return data;
}