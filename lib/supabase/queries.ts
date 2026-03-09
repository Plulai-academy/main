// lib/supabase/queries.ts
// All database interactions go through here
import { createClient } from './client'
import type { AgeGroup, TrackType } from './database.types'

// ── AUTH ─────────────────────────────────────────────────────

export const signUp = async (email: string, password: string, displayName: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export const signInWithGoogle = async () => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  return { data, error }
}

export const signOut = async () => {
  const supabase = createClient()
  return supabase.auth.signOut()
}

export const getUser = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ── PROFILE ──────────────────────────────────────────────────

export const getProfile = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

// Sanitize a string: strip HTML tags, trim, limit length
function sanitizeText(s: string | undefined, maxLen: number): string | undefined {
  if (!s) return s
  return s.replace(/<[^>]*>/g, '').trim().slice(0, maxLen)
}

// Validate email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const upsertProfile = async (userId: string, profile: {
  display_name?: string
  avatar?: string
  age?: number
  age_group?: AgeGroup
  interests?: string[]
  dream_project?: string
  onboarding_done?: boolean
  country?: string
  language?: string
  parent_email?: string
}) => {
  const supabase = createClient()

  // ── Sanitize all user inputs before writing to DB ─────────────
  const sanitized: typeof profile = {
    ...profile,
    display_name:  sanitizeText(profile.display_name, 50),
    dream_project: sanitizeText(profile.dream_project, 500),
    // Validate avatar is a single emoji (rough check)
    avatar:        profile.avatar?.slice(0, 10),
    // Clamp age to valid range
    age:           profile.age !== undefined
      ? Math.max(4, Math.min(18, Math.round(profile.age)))
      : undefined,
    // Validate parent email
    parent_email:  profile.parent_email
      ? (isValidEmail(profile.parent_email) ? profile.parent_email.toLowerCase().trim() : undefined)
      : profile.parent_email,
    // Whitelist age groups
    age_group:     ['mini', 'junior', 'pro', 'expert'].includes(profile.age_group ?? '')
      ? profile.age_group : undefined,
    // Whitelist country codes
    country:       profile.country?.slice(0, 10),
    // Limit interests array
    interests:     profile.interests?.slice(0, 10).map(i => sanitizeText(i, 50) ?? ''),
    // Whitelist language values
    language:      ['en', 'ar', 'fr'].includes(profile.language ?? '') ? profile.language : undefined,
  }

  // Map 'language' input field -> 'preferred_language' DB column
  const { language: lang, ...sanitizedRest } = sanitized
  const dbPayload = {
    ...sanitizedRest,
    ...(lang !== undefined ? { preferred_language: lang } : {}),
    updated_at: new Date().toISOString(),
  }

  // Always UPDATE — the auth trigger (handle_new_user) guarantees a profile row
  // exists for every user before they can reach onboarding or settings.
  // Never upsert here — it would try to INSERT without email and hit NOT NULL.
  const { data, error } = await supabase
    .from('profiles')
    .update(dbPayload)
    .eq('id', userId)
    .select()
  return { data: data?.[0] ?? null, error }
}

// ── USER PROGRESS ─────────────────────────────────────────────

export const getUserProgress = async (userId: string) => {
  const supabase = createClient()

  // Try to fetch first
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Row exists — return it
  if (data) return { data, error: null }

  // Row missing (new user or backfill needed) — create it now
  const { data: created, error: createError } = await supabase
    .from('user_progress')
    .upsert({ user_id: userId, xp: 0, level: 1, streak: 0 }, { onConflict: 'user_id' })
    .select()
    .single()

  return { data: created, error: createError }
}

export const addXP = async (userId: string, amount: number, reason: string, sourceId?: string) => {
  const supabase = createClient()

  // Get current progress
  const { data: current } = await getUserProgress(userId)
  if (!current) return { error: new Error('No progress record') }

  const newXP = current.xp + amount
  const newLevel = Math.floor(newXP / 100) + 1
  const leveledUp = newLevel > current.level

  // Update progress
  const { error: progressError } = await supabase
    .from('user_progress')
    .update({ xp: newXP, level: newLevel, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (progressError) return { error: progressError }

  // Log XP transaction
  await supabase.from('xp_transactions').insert({
    user_id: userId,
    amount,
    reason,
    source_id: sourceId || null,
  })

  return { data: { newXP, newLevel, leveledUp }, error: null }
}

export const updateStreak = async (userId: string) => {
  const supabase = createClient()
  const { data: current } = await getUserProgress(userId)
  if (!current) return

  const today     = new Date().toISOString().split('T')[0]
  const lastActive = current.last_active_date

  if (lastActive === today) return // already updated today

  const yesterday   = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const twoDaysAgo  = new Date(Date.now() - 172800000).toISOString().split('T')[0]

  let newStreak   = current.streak
  let freezeUsed  = false
  let freezeTokens = (current as any).freeze_tokens ?? 0

  if (lastActive === yesterday) {
    // Normal — consecutive day
    newStreak = current.streak + 1
  } else if (lastActive === twoDaysAgo && freezeTokens > 0) {
    // Missed yesterday — auto-use a freeze token to protect streak
    newStreak    = current.streak + 1
    freezeTokens = freezeTokens - 1
    freezeUsed   = true
    // Log the freeze use
    await supabase.from('freeze_uses').insert({
      user_id:          userId,
      used_date:        yesterday,
      protected_streak: current.streak,
    })
  } else {
    // Streak broken and no freeze available (or missed 2+ days)
    newStreak    = 1
    freezeTokens = freezeTokens // unchanged
  }

  const longestStreak = Math.max(newStreak, current.longest_streak)

  await supabase
    .from('user_progress')
    .update({
      streak:          newStreak,
      longest_streak:  longestStreak,
      last_active_date: today,
      freeze_tokens:   freezeTokens,
      updated_at:      new Date().toISOString(),
    })
    .eq('user_id', userId)

  return { newStreak, freezeUsed, freezeTokensLeft: freezeTokens }
}

// ── STREAK FREEZE SHOP ────────────────────────────────────────

export const getShopItems = async () => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shop_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return { data, error }
}

export const purchaseShopItem = async (userId: string, itemId: string) => {
  const supabase = createClient()

  // Get item details and current XP in parallel
  const [itemRes, progressRes] = await Promise.all([
    supabase.from('shop_items').select('*').eq('id', itemId).single(),
    getUserProgress(userId),
  ])

  const item    = itemRes.data
  const progress = progressRes.data
  if (!item || !progress) return { error: 'Item or user not found' }
  if (progress.xp < item.xp_cost) return { error: 'Not enough XP' }

  // Deduct XP
  const newXP = progress.xp - item.xp_cost
  const newLevel = Math.floor(newXP / 100) + 1

  // Apply item effect
  const updates: Record<string, any> = { updated_at: new Date().toISOString() }
  if (item.item_type === 'freeze') {
    updates.freeze_tokens = Math.min(((progress as any).freeze_tokens ?? 0) + item.quantity, 10)
  }

  // Run all updates
  await Promise.all([
    supabase.from('user_progress').update({ xp: newXP, level: newLevel, ...updates }).eq('user_id', userId),
    supabase.from('xp_transactions').insert({ user_id: userId, amount: -item.xp_cost, reason: `shop_purchase`, source_id: itemId }),
    supabase.from('shop_transactions').insert({ user_id: userId, item_id: itemId, xp_spent: item.xp_cost }),
  ])

  return { success: true, newXP, newFreezeTokens: updates.freeze_tokens }
}

export const getFreezeTokens = async (userId: string): Promise<number> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_progress')
    .select('freeze_tokens')
    .eq('user_id', userId)
    .single()
  return (data as any)?.freeze_tokens ?? 0
}

export const getFreezeHistory = async (userId: string) => {
  const supabase = createClient()
  const { data } = await supabase
    .from('freeze_uses')
    .select('used_date, protected_streak, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)
  return data ?? []
}

// ── CURRICULUM ────────────────────────────────────────────────

export const getTracks = async () => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return { data, error }
}

export const getSkillNodes = async (ageGroup?: AgeGroup, trackId?: TrackType) => {
  const supabase = createClient()
  let query = supabase
    .from('skill_nodes')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (trackId) query = query.eq('track_id', trackId)
  // Filter by age group using contains
  if (ageGroup) query = query.contains('age_groups', [ageGroup])

  const { data, error } = await query
  return { data, error }
}

export const getLessonsForSkill = async (skillNodeId: string, ageGroup?: AgeGroup) => {
  const supabase = createClient()
  let query = supabase
    .from('lessons')
    .select('*')
    .eq('skill_node_id', skillNodeId)
    .eq('is_active', true)
    .order('sort_order')

  if (ageGroup) query = query.contains('age_groups', [ageGroup])

  const { data, error } = await query
  return { data, error }
}

// ── SKILL PROGRESS ────────────────────────────────────────────

export const getUserSkillProgress = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_skill_progress')
    .select('*')
    .eq('user_id', userId)
  return { data, error }
}

export const updateSkillProgress = async (userId: string, skillNodeId: string, progressPct: number) => {
  const supabase = createClient()
  const isComplete = progressPct >= 100
  const { data, error } = await supabase
    .from('user_skill_progress')
    .upsert({
      user_id: userId,
      skill_node_id: skillNodeId,
      progress_pct: Math.min(progressPct, 100),
      completed_at: isComplete ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,skill_node_id' })
    .select()
    .single()
  return { data, error }
}

// ── LESSON COMPLETIONS ────────────────────────────────────────

export const getUserLessonCompletions = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_lesson_completions')
    .select('*')
    .eq('user_id', userId)
  return { data, error }
}

export const completeLesson = async (userId: string, lessonId: string, scorePct = 100, timeMins = 5) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_lesson_completions')
    .upsert({ user_id: userId, lesson_id: lessonId, score_pct: scorePct, time_spent_mins: timeMins }, { onConflict: 'user_id,lesson_id' })
    .select()
    .single()
  return { data, error }
}

// ── BADGES ────────────────────────────────────────────────────

export const getAllBadges = async () => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('rarity')
  return { data, error }
}

export const getUserBadges = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badges(*)')
    .eq('user_id', userId)
  return { data, error }
}

export const awardBadge = async (userId: string, badgeId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_badges')
    .upsert({ user_id: userId, badge_id: badgeId }, { onConflict: 'user_id,badge_id' })
    .select()
    .single()
  return { data, error }
}

// Check and award badges based on progress
export const checkAndAwardBadges = async (userId: string) => {
  const supabase = createClient()
  const [progressRes, lessonsRes, badgesRes, existingBadgesRes] = await Promise.all([
    getUserProgress(userId),
    getUserLessonCompletions(userId),
    getAllBadges(),
    getUserBadges(userId),
  ])

  const progress = progressRes.data
  const lessons  = lessonsRes.data || []
  const badges   = badgesRes.data || []
  const existingBadgeIds = (existingBadgesRes.data || []).map((b: any) => b.badge_id)

  const newBadges: string[] = []

  const check = async (id: string, condition: boolean) => {
    if (condition && !existingBadgeIds.includes(id)) {
      await awardBadge(userId, id)
      newBadges.push(id)
    }
  }

  if (progress) {
    await check('first-lesson',  lessons.length >= 1)
    await check('streak-3',      progress.streak >= 3)
    await check('streak-7',      progress.streak >= 7)
    await check('streak-30',     progress.streak >= 30)
    await check('xp-100',        progress.xp >= 100)
    await check('xp-500',        progress.xp >= 500)
    await check('xp-1000',       progress.xp >= 1000)
    await check('lessons-5',     lessons.length >= 5)
    await check('lessons-10',    lessons.length >= 10)
    await check('lessons-25',    lessons.length >= 25)
  }

  return newBadges
}

// ── DAILY CHALLENGES ──────────────────────────────────────────

export const getTodaysChallenge = async (ageGroup: AgeGroup) => {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  // maybeSingle() returns null (not an error) when no row exists
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('age_group', ageGroup)
    .eq('active_date', today)
    .maybeSingle()
  return { data, error }
}

export const getUserChallengeCompletions = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_challenge_completions')
    .select('*')
    .eq('user_id', userId)
  return { data, error }
}

export const completeChallenge = async (userId: string, challengeId: string, challengeType: 'daily' | 'bonus' = 'daily') => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_challenge_completions')
    .upsert(
      { user_id: userId, challenge_id: challengeId, challenge_type: challengeType },
      { onConflict: 'user_id,challenge_id' }
    )
    .select()
    .single()
  return { data, error }
}

// ── CHAT ──────────────────────────────────────────────────────

export const createChatSession = async (userId: string, title = 'Chat Session', context?: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId, title, context: context || null })
    .select()
    .single()
  return { data, error }
}

export const saveChatMessage = async (sessionId: string, userId: string, role: 'user' | 'assistant', content: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ session_id: sessionId, user_id: userId, role, content })
    .select()
    .single()
  return { data, error }
}

export const getChatHistory = async (sessionId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  return { data, error }
}

export const getUserChatSessions = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(20)
  return { data, error }
}

// ── LEADERBOARD ───────────────────────────────────────────────

export const getLeaderboard = async (country?: string, limit = 50) => {
  const supabase = createClient()
  let query = supabase
    .from('leaderboard')
    .select('*')
    .order('xp', { ascending: false })
    .limit(limit)

  if (country) query = query.eq('country', country)

  const { data, error } = await query
  return { data, error }
}

// ── FULL DASHBOARD DATA (single fetch) ───────────────────────

export const getDashboardData = async (userId: string, ageGroup: AgeGroup) => {
  const [profile, progress, skillProgress, lessonCompletions, userBadges, allBadges, todayChallenge, challengeCompletions] = await Promise.all([
    getProfile(userId),
    getUserProgress(userId),
    getUserSkillProgress(userId),
    getUserLessonCompletions(userId),
    getUserBadges(userId),
    getAllBadges(),
    getTodaysChallenge(ageGroup),
    getUserChallengeCompletions(userId),
  ])

  return {
    profile: profile.data,
    progress: progress.data,
    skillProgress: skillProgress.data || [],
    lessonCompletions: lessonCompletions.data || [],
    userBadges: userBadges.data || [],
    allBadges: allBadges.data || [],
    todayChallenge: todayChallenge.data,
    challengeCompletions: challengeCompletions.data || [],
  }
}

// ── SUBSCRIPTIONS ─────────────────────────────────────────────

export const getSubscriptionPlans = async () => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price_usd')
  return { data, error }
}

export const startFreeTrial = async (userId: string) => {
  const supabase = createClient()
  const trialEnds = new Date(Date.now() + 14 * 86400000).toISOString()
  const { data, error } = await supabase
    .from('profiles')
    .update({ trial_started_at: new Date().toISOString(), trial_ends_at: trialEnds, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export const checkUserAccess = async (userId: string): Promise<{ hasAccess: boolean; trialDaysLeft: number; isTrialing: boolean; isPaid: boolean }> => {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('trial_ends_at, subscription_ends_at, subscription').eq('id', userId).single()
  if (!data) return { hasAccess: false, trialDaysLeft: 0, isTrialing: false, isPaid: false }

  const now = Date.now()
  const trialEnd = data.trial_ends_at ? new Date(data.trial_ends_at).getTime() : 0
  const subEnd   = data.subscription_ends_at ? new Date(data.subscription_ends_at).getTime() : 0
  const isTrialing = trialEnd > now
  const isPaid     = subEnd > now || data.subscription === 'pro' || data.subscription === 'school'
  const trialDaysLeft = isTrialing ? Math.ceil((trialEnd - now) / 86400000) : 0

  return { hasAccess: isTrialing || isPaid, trialDaysLeft, isTrialing, isPaid }
}

export const updateUserLanguage = async (userId: string, language: 'en' | 'ar' | 'fr') => {
  const supabase = createClient()
  return supabase.from('profiles').update({ preferred_language: language, updated_at: new Date().toISOString() }).eq('id', userId)
}

// ── BONUS CHALLENGES (from DB) ────────────────────────────────

export const getBonusChallenges = async (ageGroup: AgeGroup) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bonus_challenges')
    .select('*')
    .eq('is_active', true)
    .contains('age_groups', [ageGroup])
    .order('sort_order')
  return { data, error }
}

// ── LEADERBOARD (enriched) ────────────────────────────────────

export const getLeaderboardByScope = async (scope: 'global' | 'country' | 'age_group', value?: string, limit = 50) => {
  const supabase = createClient()
  let query = supabase.from('leaderboard').select('*').order('xp', { ascending: false }).limit(limit)
  if (scope === 'country' && value)    query = query.eq('country', value)
  if (scope === 'age_group' && value)  query = query.eq('age_group', value)
  const { data, error } = await query
  return { data, error }
}

export const getUserLeaderboardRank = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.from('leaderboard').select('*').eq('id', userId).single()
  return { data, error }
}

// ── LESSON FEEDBACK ───────────────────────────────────────────

export const submitLessonFeedback = async (
  userId: string,
  lessonId: string,
  rating: number,
  feeling: string,
  comment?: string
) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lesson_feedback')
    .upsert(
      { user_id: userId, lesson_id: lessonId, rating, feeling, comment: comment || null },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single()
  return { data, error }
}

export const getLessonFeedback = async (userId: string, lessonId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lesson_feedback')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()
  return { data, error }
}
