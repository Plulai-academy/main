import { createClient } from '@/lib/supabase/client';
import type { AdminSchoolRow, AdminUserRow, AdminTrack, AdminSkillNode, AdminLesson, PlatformKPIs, FinanceOverview, PlanBreakdown, RevenueTrendPoint } from '@/types/admin';
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
  sortBy?: 'created_at' | 'last_active';
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
      `id, display_name, email, account_type, school_id, subscription, plan_id, created_at,
       schools(name),
       user_progress(xp, last_active_date)`,
      { count: 'exact' }
    );

  if (params.query?.trim()) {
    q = q.or(`display_name.ilike.%${params.query}%,email.ilike.%${params.query}%`);
  }
  if (params.accountType) {
    q = q.eq('account_type', params.accountType);
  }
  if (params.subscription) {
    q = q.eq('subscription', params.subscription);
  }

  // Sorting by last_active_date requires the joined table's column, which
  // PostgREST can order by directly using its dotted foreign-table syntax.
  if (params.sortBy === 'last_active') {
    q = q.order('last_active_date', { ascending: false, foreignTable: 'user_progress', nullsFirst: false });
  } else {
    q = q.order('created_at', { ascending: false });
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
      planId: row.plan_id,
      xp: progress?.xp ?? 0,
      lastActiveDate: progress?.last_active_date ?? null,
      createdAt: row.created_at,
    };
  });

  return { users, total: count ?? 0 };
}
export async function updateUserAccount(
  userId: string,
  params: { displayName: string; subscription: string | null; planId: string | null }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: params.displayName,
      subscription: params.subscription,
      plan_id: params.subscription === 'pro' ? params.planId : null,
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
export async function getPlatformKPIs(): Promise<PlatformKPIs> {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: dau },
    { count: wau },
    { count: totalUsers },
    { count: b2cUsers },
    { count: b2b2cUsers },
    { count: payingUsers },
    { data: schools },
    { data: payingProfiles },
    { data: plans },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('last_seen_at', dayAgo),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('last_seen_at', weekAgo),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'b2c'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'b2b2c'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('subscription', 'pro'),
    supabase.from('schools').select('id, name, status, license_end'),
    supabase.from('profiles').select('plan_id').eq('subscription', 'pro'),
    supabase.from('subscription_plans').select('id, price_usd, interval').eq('is_active', true),
  ]);

  const priceMap = new Map(
    (plans ?? []).map((p: any) => [p.id, { price: Number(p.price_usd), interval: p.interval }])
  );

  // Real MRR based on each paying user's actual plan_id. Yearly plans are
  // normalized to their monthly-equivalent value. Any row still missing a
  // plan_id (shouldn't happen after the backfill, but just in case) falls
  // back to the monthly price as a safe default rather than being excluded.
  const FALLBACK_MONTHLY_PRICE = priceMap.get('monthly')?.price ?? 79;

  const estimatedMRR = (payingProfiles ?? []).reduce((sum: number, p: any) => {
    const plan = priceMap.get(p.plan_id);
    if (!plan) return sum + FALLBACK_MONTHLY_PRICE;
    return sum + (plan.interval === 'year' ? plan.price / 12 : plan.price);
  }, 0);

  const activeSchools = (schools ?? []).filter((s: any) => s.status === 'active').length;

  const renewalsDueSoon = (schools ?? [])
    .filter((s: any) => s.license_end && s.license_end <= thirtyDaysOut && s.license_end >= now.toISOString())
    .map((s: any) => ({
      id: s.id,
      name: s.name,
      licenseEnd: s.license_end,
      daysLeft: Math.ceil((new Date(s.license_end).getTime() - now.getTime()) / 86400000),
    }))
    .sort((a: any, b: any) => a.daysLeft - b.daysLeft);

  return {
    dau: dau ?? 0,
    wau: wau ?? 0,
    totalUsers: totalUsers ?? 0,
    b2cUsers: b2cUsers ?? 0,
    b2b2cUsers: b2b2cUsers ?? 0,
    payingUsers: payingUsers ?? 0,
    estimatedMRR: Math.round(estimatedMRR),
    totalSchools: (schools ?? []).length,
    activeSchools,
    renewalsDueSoon,
  };
}

export async function getFinanceOverview(): Promise<FinanceOverview> {
  const [{ data: payingProfiles }, { data: plans }] = await Promise.all([
    supabase.from('profiles').select('plan_id, subscribed_at').eq('subscription', 'pro'),
    supabase.from('subscription_plans').select('id, name, price_usd, interval').eq('is_active', true),
  ]);

  const planMap = new Map((plans ?? []).map((p: any) => [p.id, { name: p.name, price: Number(p.price_usd), interval: p.interval }]));

  const countByPlan = new Map<string, number>();
  for (const p of payingProfiles ?? []) {
    const key = p.plan_id ?? 'monthly';
    countByPlan.set(key, (countByPlan.get(key) ?? 0) + 1);
  }

  const byPlan: PlanBreakdown[] = Array.from(countByPlan.entries()).map(([planId, count]) => {
    const plan = planMap.get(planId);
    const price = plan?.price ?? 79;
    const interval = plan?.interval ?? 'month';
    const monthlyEquivalent = interval === 'year' ? price / 12 : price;
    return {
      planId,
      planName: plan?.name ?? planId,
      interval,
      price,
      subscriberCount: count,
      monthlyRevenue: Math.round(monthlyEquivalent * count),
    };
  });

  const totalMRR = byPlan.reduce((sum, p) => sum + p.monthlyRevenue, 0);
  const totalPayingUsers = (payingProfiles ?? []).length;

  // New-subscriber trend, last 6 months, grouped by subscribed_at.
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  const trendCounts = new Map(months.map((m) => [m, 0]));
  for (const p of payingProfiles ?? []) {
    if (!p.subscribed_at) continue;
    const d = new Date(p.subscribed_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (trendCounts.has(key)) trendCounts.set(key, (trendCounts.get(key) ?? 0) + 1);
  }
  const trend: RevenueTrendPoint[] = months.map((m) => ({ month: m, newSubscribers: trendCounts.get(m) ?? 0 }));

  return { totalMRR, totalPayingUsers, byPlan, trend };
}