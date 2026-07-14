import { createClient } from '@/lib/supabase/client';
import type { AdminSchoolRow, AdminUserRow, AdminTrack, AdminSkillNode, AdminLesson } from '@/types/admin';
const supabase = createClient();

export async function getAllSchools(): Promise<AdminSchoolRow[]> {
  const { data: schools, error } = await supabase
    .from('schools')
    .select('id, name, country, status, license_seats, license_start, license_end, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const schoolIds = (schools ?? []).map((s: any) => s.id);
  if (schoolIds.length === 0) return [];

  const { data: staffRows } = await supabase.from('school_staff').select('school_id').in('school_id', schoolIds);
  const { data: studentRows } = await supabase.from('profiles').select('school_id').in('school_id', schoolIds);

  const staffCounts = new Map<string, number>();
  for (const r of staffRows ?? []) staffCounts.set(r.school_id, (staffCounts.get(r.school_id) ?? 0) + 1);

  const studentCounts = new Map<string, number>();
  for (const r of studentRows ?? []) studentCounts.set(r.school_id, (studentCounts.get(r.school_id) ?? 0) + 1);

  return (schools ?? []).map((s: any) => ({
    id: s.id,
    name: s.name,
    country: s.country,
    status: s.status,
    licenseSeats: s.license_seats,
    licenseStart: s.license_start,
    licenseEnd: s.license_end,
    createdAt: s.created_at,
    staffCount: staffCounts.get(s.id) ?? 0,
    studentCount: studentCounts.get(s.id) ?? 0,
  }));
}

export async function createSchool(params: {
  name: string;
  country: string | null;
  licenseSeats: number;
  licenseStart: string | null;
  licenseEnd: string | null;
}): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('schools')
    .insert({
      name: params.name,
      country: params.country,
      license_seats: params.licenseSeats,
      license_start: params.licenseStart,
      license_end: params.licenseEnd,
      status: 'active',
    })
    .select('id')
    .single();
  if (error) throw error;
  return { id: data.id };
}

export async function updateSchool(
  schoolId: string,
  params: {
    name: string;
    country: string | null;
    status: string;
    licenseSeats: number;
    licenseStart: string | null;
    licenseEnd: string | null;
  }
): Promise<void> {
  const { error } = await supabase
    .from('schools')
    .update({
      name: params.name,
      country: params.country,
      status: params.status,
      license_seats: params.licenseSeats,
      license_start: params.licenseStart,
      license_end: params.licenseEnd,
    })
    .eq('id', schoolId);
  if (error) throw error;
}

export async function deleteSchool(schoolId: string): Promise<void> {
  const { error } = await supabase.from('schools').delete().eq('id', schoolId);
  if (error) throw error;
}

export async function searchUsers(params: {
  query?: string;
  accountType?: string;
  subscription?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ users: AdminUserRow[]; total: number }> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from('profiles')
    .select(
      `id, display_name, email, account_type, school_id, subscription, created_at,
       schools(name),
       user_progress(xp, last_active_date)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (params.query?.trim()) {
    q = q.or(`display_name.ilike.%${params.query}%,email.ilike.%${params.query}%`);
  }
  if (params.accountType) {
    q = q.eq('account_type', params.accountType);
  }
  if (params.subscription) {
    q = q.eq('subscription', params.subscription);
  }

  const { data, error, count } = await q.range(from, to);
  if (error) throw error;

  const users = (data ?? []).map((row: any) => {
    const progress = Array.isArray(row.user_progress) ? row.user_progress[0] : row.user_progress;
    const school = Array.isArray(row.schools) ? row.schools[0] : row.schools;
    return {
      id: row.id,
      displayName: row.display_name,
      email: row.email,
      accountType: row.account_type,
      schoolId: row.school_id,
      schoolName: school?.name ?? null,
      subscription: row.subscription,
      xp: progress?.xp ?? 0,
      lastActiveDate: progress?.last_active_date ?? null,
      createdAt: row.created_at,
    };
  });

  return { users, total: count ?? 0 };
}

export async function updateUserAccount(
  userId: string,
  params: { displayName: string; subscription: string | null }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: params.displayName,
      subscription: params.subscription,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  if (error) throw error;
}

export async function deleteUserAccount(userId: string): Promise<void> {
  const res = await fetch('/api/admin/delete-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to delete user');
}

export async function sendPasswordRecovery(email: string): Promise<void> {
  const res = await fetch('/api/admin/send-recovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to send recovery email');
}
// ---------------------------------------------------------------------------
// Curriculum: Tracks
// ---------------------------------------------------------------------------

export async function getAllTracks(): Promise<AdminTrack[]> {
  const { data, error } = await supabase.from('tracks').select('*').order('sort_order');
  if (error) throw error;
  return (data ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    emoji: t.emoji,
    description: t.description,
    color: t.color,
    sortOrder: t.sort_order,
    isActive: t.is_active,
  }));
}

export async function upsertTrack(track: AdminTrack, isNew: boolean): Promise<void> {
  const payload = {
    id: track.id,
    name: track.name,
    emoji: track.emoji,
    description: track.description,
    color: track.color,
    sort_order: track.sortOrder,
    is_active: track.isActive,
  };
  const { error } = isNew
    ? await supabase.from('tracks').insert(payload)
    : await supabase.from('tracks').update(payload).eq('id', track.id);
  if (error) throw error;
}

export async function deleteTrack(trackId: string): Promise<void> {
  const { error } = await supabase.from('tracks').delete().eq('id', trackId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Curriculum: Skill nodes
// ---------------------------------------------------------------------------

export async function getSkillNodesByTrack(trackId: string): Promise<AdminSkillNode[]> {
  const { data, error } = await supabase
    .from('skill_nodes')
    .select('*')
    .eq('track_id', trackId)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []).map((s: any) => ({
    id: s.id,
    trackId: s.track_id,
    title: s.title,
    emoji: s.emoji,
    description: s.description,
    xpReward: s.xp_reward,
    sortOrder: s.sort_order,
    requiredNodes: s.required_nodes ?? [],
    ageGroups: s.age_groups ?? [],
    isActive: s.is_active,
  }));
}

export async function upsertSkillNode(node: AdminSkillNode, isNew: boolean): Promise<void> {
  const payload = {
    id: node.id,
    track_id: node.trackId,
    title: node.title,
    emoji: node.emoji,
    description: node.description,
    xp_reward: node.xpReward,
    sort_order: node.sortOrder,
    required_nodes: node.requiredNodes,
    age_groups: node.ageGroups,
    is_active: node.isActive,
  };
  const { error } = isNew
    ? await supabase.from('skill_nodes').insert(payload)
    : await supabase.from('skill_nodes').update(payload).eq('id', node.id);
  if (error) throw error;
}

export async function deleteSkillNode(nodeId: string): Promise<void> {
  const { error } = await supabase.from('skill_nodes').delete().eq('id', nodeId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Curriculum: Lessons
// ---------------------------------------------------------------------------

export async function getLessonsBySkillNode(skillNodeId: string): Promise<AdminLesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('skill_node_id', skillNodeId)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []).map((l: any) => ({
    id: l.id,
    skillNodeId: l.skill_node_id,
    title: l.title,
    emoji: l.emoji,
    description: l.description,
    lessonType: l.lesson_type,
    xpReward: l.xp_reward,
    durationMins: l.duration_mins,
    sortOrder: l.sort_order,
    ageGroups: l.age_groups ?? [],
    contentJson: JSON.stringify(l.content_json ?? {}, null, 2),
    isActive: l.is_active,
  }));
}

export async function upsertLesson(lesson: AdminLesson, isNew: boolean): Promise<{ error?: string }> {
  let parsedContent: any;
  try {
    parsedContent = JSON.parse(lesson.contentJson);
  } catch {
    return { error: 'Content JSON is not valid — check for a syntax error.' };
  }

  const payload = {
    id: lesson.id,
    skill_node_id: lesson.skillNodeId,
    title: lesson.title,
    emoji: lesson.emoji,
    description: lesson.description,
    lesson_type: lesson.lessonType,
    xp_reward: lesson.xpReward,
    duration_mins: lesson.durationMins,
    sort_order: lesson.sortOrder,
    age_groups: lesson.ageGroups,
    content_json: parsedContent,
    is_active: lesson.isActive,
    updated_at: new Date().toISOString(),
  };
  const { error } = isNew
    ? await supabase.from('lessons').insert(payload)
    : await supabase.from('lessons').update(payload).eq('id', lesson.id);
  if (error) return { error: error.message };
  return {};
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
  if (error) throw error;
}