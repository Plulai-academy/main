// lib/supabase/queries.ts
// All database interactions go through here
import { createClient } from './client'
import type { AgeGroup, TrackType } from './database.types'

// ── AUTH ─────────────────────────────────────────────────────

export const signUp = async (
  email: string,
  password: string,
  displayName: string,
  phone?: string
) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        phone: phone?.trim() ?? null,
      },
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

function sanitizeText(s: string | undefined, maxLen: number): string | undefined {
  if (!s) return s
  return s.replace(/<[^>]*>/g, '').trim().slice(0, maxLen)
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function sanitizePhone(p?: string): string | undefined {
  if (!p) return undefined
  const cleaned = p.replace(/[^\d\s\+\-\(\)]/g, '').trim().slice(0, 20)
  return cleaned.length >= 6 ? cleaned : undefined
}

export const upsertProfile = async (userId: string, profile: {
  display_name?: string
  avatar?: string
  age?: number
  age_group?: AgeGroup
  interests?: string[]
  dream_project?: string
  goal_type?: string
  weekly_goal?: number
  onboarding_done?: boolean
  country?: string
  language?: string
  parent_email?: string
  phone?: string
}) => {
  const supabase = createClient()

  const sanitized: typeof profile = {
    ...profile,
    display_name:  sanitizeText(profile.display_name, 50),
    dream_project: sanitizeText(profile.dream_project, 500),
    goal_type:     sanitizeText(profile.goal_type, 40),
    weekly_goal:   profile.weekly_goal !== undefined
      ? Math.max(1, Math.min(7, Math.round(profile.weekly_goal)))
      : undefined,
    avatar:        profile.avatar?.slice(0, 10),
    age:           profile.age !== undefined
      ? Math.max(4, Math.min(18, Math.round(profile.age)))
      : undefined,
    parent_email:  profile.parent_email
      ? (isValidEmail(profile.parent_email) ? profile.parent_email.toLowerCase().trim() : undefined)
      : profile.parent_email,
    age_group:     ['mini', 'junior', 'pro', 'expert'].includes(profile.age_group ?? '')
      ? profile.age_group : undefined,
    country:       profile.country?.slice(0, 10),
    interests:     profile.interests?.slice(0, 10).map(i => sanitizeText(i, 50) ?? ''),
    language:      ['en', 'ar', 'fr'].includes(profile.language ?? '') ? profile.language : undefined,
    phone:         sanitizePhone(profile.phone),
  }

  const { language: lang, ...sanitizedRest } = sanitized
  const dbPayload = {
    ...sanitizedRest,
    ...(lang !== undefined ? { preferred_language: lang } : {}),
    updated_at: new Date().toISOString(),
  }

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

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (data) return { data, error: null }

  const { data: created, error: createError } = await supabase
    .from('user_progress')
    .upsert({ user_id: userId, xp: 0, level: 1, streak: 0 }, { onConflict: 'user_id' })
    .select()
    .single()

  return { data: created, error: createError }
}

export const addXP = async (userId: string, amount: number, reason: string, sourceId?: string) => {
  const supabase = createClient()

  const { data: current } = await getUserProgress(userId)
  if (!current) return { error: new Error('No progress record') }

  const newXP    = current.xp + amount
  const newLevel = Math.floor(newXP / 100) + 1
  const leveledUp = newLevel > current.level

  const { error: progressError } = await supabase
    .from('user_progress')
    .update({ xp: newXP, level: newLevel, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (progressError) return { error: progressError }

  await supabase.from('xp_transactions').insert({
    user_id:   userId,
    amount,
    reason,
    source_id: sourceId || null,
  })

  // ── Award wallet coins based on XP earned ────────────────────
  // 100 coins per 1,000 XP (only if amount qualifies)
  const coinsToAward = Math.floor(amount / 1000) * 100
  if (coinsToAward > 0) {
    try {
      await supabase.rpc('add_coins', {
        p_user_id:    userId,
        p_amount:     coinsToAward,
        p_type:       'xp_reward',
        p_description: `⚡ ${amount.toLocaleString()} XP earned → ${coinsToAward} coins`,
        p_reference:  sourceId ?? null,
      })
    } catch {
      // Non-blocking — XP is primary, coins are secondary
    }
  }

  return { data: { newXP, newLevel, leveledUp, coinsEarned: coinsToAward }, error: null }
}

export const updateStreak = async (userId: string) => {
  const supabase = createClient()
  const { data: current } = await getUserProgress(userId)
  if (!current) return

  const today      = new Date().toISOString().split('T')[0]
  const lastActive = current.last_active_date

  if (lastActive === today) return // already updated today

  const yesterday  = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0]

  let newStreak    = current.streak
  let freezeUsed   = false
  let freezeTokens = (current as any).freeze_tokens ?? 0

  if (lastActive === yesterday) {
    newStreak = current.streak + 1
  } else if (lastActive === twoDaysAgo && freezeTokens > 0) {
    newStreak    = current.streak + 1
    freezeTokens = freezeTokens - 1
    freezeUsed   = true
    await supabase.from('freeze_uses').insert({
      user_id:          userId,
      used_date:        yesterday,
      protected_streak: current.streak,
    })
  } else {
    newStreak = 1
  }

  const longestStreak = Math.max(newStreak, current.longest_streak)

  await supabase
    .from('user_progress')
    .update({
      streak:           newStreak,
      longest_streak:   longestStreak,
      last_active_date: today,
      freeze_tokens:    freezeTokens,
      updated_at:       new Date().toISOString(),
    })
    .eq('user_id', userId)

  // ── Award streak coins (1,000 per day, once per calendar day) ─
  try {
    const { data: alreadyAwarded } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'streak_login')
      .gte('created_at', `${today}T00:00:00Z`)
      .limit(1)
      .maybeSingle()

    if (!alreadyAwarded) {
      await supabase.rpc('add_coins', {
        p_user_id:    userId,
        p_amount:     1000,
        p_type:       'streak_login',
        p_description: `🔥 Daily streak bonus — 1,000 coins!`,
        p_reference:  today,
      })
    }
  } catch {
    // Non-blocking
  }

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

  const [itemRes, progressRes] = await Promise.all([
    supabase.from('shop_items').select('*').eq('id', itemId).single(),
    getUserProgress(userId),
  ])

  const item     = itemRes.data
  const progress = progressRes.data
  if (!item || !progress) return { error: 'Item or user not found' }
  if (progress.xp < item.xp_cost) return { error: 'Not enough XP' }

  const newXP    = progress.xp - item.xp_cost
  const newLevel = Math.floor(newXP / 100) + 1

  const updates: Record<string, any> = { updated_at: new Date().toISOString() }
  if (item.item_type === 'freeze') {
    updates.freeze_tokens = Math.min(((progress as any).freeze_tokens ?? 0) + item.quantity, 10)
  }

  await Promise.all([
    supabase.from('user_progress').update({ xp: newXP, level: newLevel, ...updates }).eq('user_id', userId),
    supabase.from('xp_transactions').insert({ user_id: userId, amount: -item.xp_cost, reason: 'shop_purchase', source_id: itemId }),
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

// ── WALLET ────────────────────────────────────────────────────

export const getWalletBalance = async (userId: string): Promise<number> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single()
  return (data as any)?.balance ?? 0
}

export const getWalletData = async (userId: string) => {
  const supabase = createClient()
  const [walletRes, txRes] = await Promise.all([
    supabase.from('wallets').select('*').eq('user_id', userId).single(),
    supabase.from('wallet_transactions').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(30),
  ])
  return {
    wallet:       walletRes.data,
    transactions: txRes.data ?? [],
  }
}

export const awardCoins = async (
  userId: string,
  amount: number,
  type: 'streak_login' | 'xp_reward' | 'admin_grant' | 'refund',
  description: string,
  referenceId?: string
): Promise<number> => {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('add_coins', {
    p_user_id:    userId,
    p_amount:     amount,
    p_type:       type,
    p_description: description,
    p_reference:  referenceId ?? null,
  })
  if (error) throw error
  return data as number
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

  if (trackId)  query = query.eq('track_id', trackId)
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
      user_id:       userId,
      skill_node_id: skillNodeId,
      progress_pct:  Math.min(progressPct, 100),
      completed_at:  isComplete ? new Date().toISOString() : null,
      updated_at:    new Date().toISOString(),
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

  const { data: lesson } = await supabase
    .from('lessons')
    .select('skill_node_id')
    .eq('id', lessonId)
    .single()

  let trackId: string | null = null
  if (lesson?.skill_node_id) {
    const { data: skillNode } = await supabase
      .from('skill_nodes')
      .select('track_id')
      .eq('id', lesson.skill_node_id)
      .single()
    trackId = skillNode?.track_id ?? null
  }

  const { data, error } = await supabase
    .from('user_lesson_completions')
    .upsert(
      { user_id: userId, lesson_id: lessonId, score_pct: scorePct, time_spent_mins: timeMins },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single()

  // Roll this lesson's real time into the running total, and update
  // current_track (both already being done here from the earlier fix).
  const { data: progress } = await supabase
    .from('user_progress')
    .select('total_time_mins')
    .eq('user_id', userId)
    .single()

  await supabase
    .from('user_progress')
    .update({
      current_track: trackId ?? undefined,
      total_time_mins: (progress?.total_time_mins ?? 0) + timeMins,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

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

export const checkAndAwardBadges = async (userId: string) => {
  const [progressRes, lessonsRes, badgesRes, existingBadgesRes] = await Promise.all([
    getUserProgress(userId),
    getUserLessonCompletions(userId),
    getAllBadges(),
    getUserBadges(userId),
  ])

  const progress         = progressRes.data
  const lessons          = lessonsRes.data || []
  const existingBadgeIds = (existingBadgesRes.data || []).map((b: any) => b.badge_id)
  const newBadges: string[] = []

  const check = async (id: string, condition: boolean) => {
    if (condition && !existingBadgeIds.includes(id)) {
      await awardBadge(userId, id)
      newBadges.push(id)
    }
  }

  if (progress) {
    await check('first-lesson', lessons.length >= 1)
    await check('streak-3',     progress.streak >= 3)
    await check('streak-7',     progress.streak >= 7)
    await check('streak-30',    progress.streak >= 30)
    await check('xp-100',       progress.xp >= 100)
    await check('xp-500',       progress.xp >= 500)
    await check('xp-1000',      progress.xp >= 1000)
    await check('lessons-5',    lessons.length >= 5)
    await check('lessons-10',   lessons.length >= 10)
    await check('lessons-25',   lessons.length >= 25)
  }

  return newBadges
}

// ── DAILY CHALLENGES ──────────────────────────────────────────

export const getTodaysChallenge = async (ageGroup: AgeGroup) => {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('age_group', ageGroup)
    .eq('active_date', today)
    .is('skill_node_id', null)               // ← add this line

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

export const completeChallenge = async (
  userId: string,
  challengeId: string,
  challengeType: 'daily' | 'bonus' = 'daily'
) => {
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

export const saveChatMessage = async (
  sessionId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string
) => {
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
  const [
    profile, progress, skillProgress, lessonCompletions,
    userBadges, allBadges, todayChallenge, challengeCompletions,
  ] = await Promise.all([
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
    profile:              profile.data,
    progress:             progress.data,
    skillProgress:        skillProgress.data || [],
    lessonCompletions:    lessonCompletions.data || [],
    userBadges:           userBadges.data || [],
    allBadges:            allBadges.data || [],
    todayChallenge:       todayChallenge.data,
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
    .update({
      trial_started_at: new Date().toISOString(),
      trial_ends_at:    trialEnds,
      updated_at:       new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export const checkUserAccess = async (userId: string): Promise<{
  hasAccess: boolean
  trialDaysLeft: number
  isTrialing: boolean
  isPaid: boolean
}> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('trial_ends_at, subscription_ends_at, subscription')
    .eq('id', userId)
    .single()

  if (!data) return { hasAccess: false, trialDaysLeft: 0, isTrialing: false, isPaid: false }

  const now          = Date.now()
  const trialEnd     = data.trial_ends_at ? new Date(data.trial_ends_at).getTime() : 0
  const subEnd       = data.subscription_ends_at ? new Date(data.subscription_ends_at).getTime() : 0
  const isTrialing   = trialEnd > now
  const isPaid       = subEnd > now || data.subscription === 'pro' || data.subscription === 'school'
  const trialDaysLeft = isTrialing ? Math.ceil((trialEnd - now) / 86400000) : 0

  return { hasAccess: isTrialing || isPaid, trialDaysLeft, isTrialing, isPaid }
}

export const updateUserLanguage = async (userId: string, language: 'en' | 'ar' | 'fr') => {
  const supabase = createClient()
  return supabase
    .from('profiles')
    .update({ preferred_language: language, updated_at: new Date().toISOString() })
    .eq('id', userId)
}

// ── BONUS CHALLENGES ──────────────────────────────────────────

export const getBonusChallenges = async (userId: string, ageGroup: AgeGroup) => {
  const supabase = createClient()

  // Get completed skill nodes
  const { data: progress } = await supabase
    .from('user_skill_progress')
    .select('skill_node_id')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)

  if (!progress?.length) return { data: [], error: null }

  const completedNodeIds = progress.map((p) => p.skill_node_id)

  const { data, error } = await supabase
    .from('bonus_challenges')          // ← correct table
    .select('*')
    .eq('is_active', true)
    .contains('age_groups', [ageGroup])  // ← array column
    .in('skill_node_id', completedNodeIds)
    .order('sort_order')

  return { data: data ?? [], error }
}
// ── LEADERBOARD (enriched) ────────────────────────────────────

export const getLeaderboardByScope = async (
  scope: 'global' | 'country' | 'age_group',
  value?: string,
  limit = 50
) => {
  const supabase = createClient()
  let query = supabase
    .from('leaderboard')
    .select('*')
    .order('xp', { ascending: false })
    .limit(limit)

  if (scope === 'country'   && value) query = query.eq('country', value)
  if (scope === 'age_group' && value) query = query.eq('age_group', value)

  const { data, error } = await query
  return { data, error }
}

export const getUserLeaderboardRank = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('id', userId)
    .single()
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
// ── LESSON SUBMISSIONS ────────────────────────────────────────

export const submitLessonSubmission = async (
  userId: string,
  lessonId: string,
  projectUrl?: string,
  videoUrl?: string
) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lesson_submissions')
    .upsert(
      {
        user_id:     userId,
        lesson_id:   lessonId,
        project_url: projectUrl ?? null,
        video_url:   videoUrl   ?? null,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single()
  return { data, error }
}

// ============================================================
// B2B2C ADDITIONS BELOW — everything above this line is your
// original file, untouched.
// ============================================================

// ── ROLE-AWARE ROUTING (B2B2C) ──────────────────────────────────
// Called after a successful login to decide where to send someone.
// Reads existing DB state only — never assigns a role, so it's
// safe to call for any authenticated user.

export type UserDestination =
  | { type: 'teacher';       redirectTo: string; schoolId: string; staffId: string }
  | { type: 'school_admin';  redirectTo: string; schoolId: string; staffId: string }
  | { type: 'b2b2c_student'; redirectTo: string; schoolId: string }
  | { type: 'b2c_student';   redirectTo: string }

export const resolveUserDestination = async (userId: string): Promise<UserDestination> => {
  const supabase = createClient()

  // Staff role takes priority over student status — a school_staff
  // row existing at all means this person manages/teaches a class,
  // regardless of what their profiles row says.
  const { data: staff } = await supabase
    .from('school_staff')
    .select('id, school_id, role')
    .eq('profile_id', userId)
    .maybeSingle()

  if (staff) {
    return staff.role === 'school_admin'
      ? { type: 'school_admin', redirectTo: '/school-admin', schoolId: staff.school_id, staffId: staff.id }
      : { type: 'teacher', redirectTo: '/teacher', schoolId: staff.school_id, staffId: staff.id }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type, school_id')
    .eq('id', userId)
    .single()

  // NOTE: both branches below land on the SAME /dashboard route —
  // DashboardClient already adapts its display based on the data it's
  // given (assignedBy/dueLabel/className for B2B2C, plain streak/XP
  // for B2C), so there's no separate route to send B2B2C students to.
  if (profile?.account_type === 'b2b2c' && profile.school_id) {
    return { type: 'b2b2c_student', redirectTo: '/dashboard', schoolId: profile.school_id }
  }

  return { type: 'b2c_student', redirectTo: '/dashboard' }
}


// ── CLASS JOIN CODE (student linking to a school) ───────────────
// The only sanctioned way a profile gets linked to a school + class.
// Calls the redeem_class_code RPC (SECURITY DEFINER, validates
// server-side) — never writes school_id/account_type/enrollment
// directly from the client.

export const redeemClassCode = async (code: string): Promise<{
  success: boolean
  error?: string
  classId?: string
  schoolId?: string
}> => {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('redeem_class_code', {
    p_code: code.trim().toUpperCase(),
  })

  if (error) return { success: false, error: error.message }
  if (!data?.success) return { success: false, error: data?.error ?? 'Invalid code' }

  return { success: true, classId: data.class_id, schoolId: data.school_id }
}


// ── SIGNUP with optional pending class code ─────────────────────
// Extends the original signUp() to accept a class code at signup
// time. It's NOT redeemed here — email confirmation means there's
// no active session yet, so auth.uid() wouldn't resolve inside the
// RPC. Instead it's stashed in the auth user's metadata (same
// mechanism already used for display_name/phone) and redeemed on
// first successful login instead — see the login page.
export const signUpWithOptionalClassCode = async (
  email: string,
  password: string,
  displayName: string,
  phone?: string,
  classCode?: string
) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        phone: phone?.trim() ?? null,
        pending_class_code: classCode?.trim() ? classCode.trim().toUpperCase() : null,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}


// ── DASHBOARD: is this user school staff? (guard for /dashboard) ─
// A teacher/school_admin should never see the student dashboard even
// if they navigate to /dashboard directly — call this first and
// redirect if it returns non-null.
export const getStaffRoleIfAny = async (userId: string) => {
  const supabase = createClient()
  const { data } = await supabase
    .from('school_staff')
    .select('id, school_id, role')
    .eq('profile_id', userId)
    .maybeSingle()
  return data
}


// ── DASHBOARD: next lesson (B2C solo path) ───────────────────────
// Walks skill_nodes in order, finds the first one not yet completed,
// then the first lesson in it not yet completed. No assignment/due
// date involved — this is the free-exploration path.
export const getNextLessonForSoloStudent = async (userId: string, ageGroup: string, supabaseClient?: any) => {
  const supabase = supabaseClient ?? createClient()

  const { data: skillProgress } = await supabase
    .from('user_skill_progress')
    .select('skill_node_id, progress_pct')
    .eq('user_id', userId)

  const completedNodeIds = new Set(
    (skillProgress ?? []).filter((s: any) => s.progress_pct >= 100).map((s: any) => s.skill_node_id)
  )

  const { data: skillNodes } = await supabase
    .from('skill_nodes')
    .select('id, sort_order')
    .eq('is_active', true)
    .contains('age_groups', [ageGroup])
    .order('sort_order')

  const nextNode = (skillNodes ?? []).find((n: any) => !completedNodeIds.has(n.id))
  if (!nextNode) return null

  const { data: completions } = await supabase
    .from('user_lesson_completions')
    .select('lesson_id')
    .eq('user_id', userId)
  const completedLessonIds = new Set((completions ?? []).map((c: any) => c.lesson_id))

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('skill_node_id', nextNode.id)
    .eq('is_active', true)
    .contains('age_groups', [ageGroup])
    .order('sort_order')

  const nextLesson = (lessons ?? []).find((l: any) => !completedLessonIds.has(l.id))
  if (!nextLesson) return null

  return {
    id: nextLesson.id,
    title: nextLesson.title,
    emoji: nextLesson.emoji ?? '',
    xp_reward: nextLesson.xp_reward ?? 0,
    skill_id: nextNode.id,
  }
}


// ── ASSIGNMENTS PAGE: full list, all types, resolved details ────
// Unlike getNextAssignmentForStudent (dashboard, finds ONE pending
// item), this returns everything for the /dashboard/assignments
// page — including 'custom' assignments, which the dashboard
// deliberately skips. This is where those finally get handled.
export const getStudentAssignmentsList = async (userId: string, supabaseClient?: any) => {
  const supabase = supabaseClient ?? createClient()

  const { data: enrollment } = await supabase
    .from('class_enrollments')
    .select('class_id, classes(id, name)')
    .eq('student_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (!enrollment) return { className: null, assignments: [] as any[] }

  const className = (enrollment as any).classes?.name ?? null

  const { data: assignments } = await supabase
    .from('assignments')
    .select('*, assignment_submissions(status, submission_content, submitted_at, grade, feedback, student_id)')
    .eq('class_id', enrollment.class_id)
    .order('due_date', { ascending: true, nullsFirst: false })

  if (!assignments?.length) return { className, assignments: [] as any[] }

  const lessonIds    = assignments.filter((a: any) => a.source_type === 'lesson').map((a: any) => a.lesson_id)
  const skillNodeIds = assignments.filter((a: any) => a.source_type === 'skill_node').map((a: any) => a.skill_node_id)
  const staffIds     = [...new Set(assignments.map((a: any) => a.assigned_by))]

  const lessonsRes: { data: any[] } = lessonIds.length
    ? await supabase.from('lessons').select('id, title, skill_node_id').in('id', lessonIds)
    : { data: [] }

  const skillNodesRes: { data: any[] } = skillNodeIds.length
    ? await supabase.from('skill_nodes').select('id, title').in('id', skillNodeIds)
    : { data: [] }

  const staffRes: { data: any[] } = staffIds.length
    ? await supabase.from('school_staff').select('id, profiles(display_name)').in('id', staffIds)
    : { data: [] }

  const lessonMap    = new Map((lessonsRes.data ?? []).map((l: any) => [l.id, l]))
  const skillNodeMap = new Map((skillNodesRes.data ?? []).map((s: any) => [s.id, s]))
  const staffMap     = new Map((staffRes.data ?? []).map((s: any) => [s.id, s.profiles?.display_name]))

  const result = assignments.map((a: any) => {
    const submission = (a.assignment_submissions as any[])?.find((s) => s.student_id === userId) ?? null

    let title = a.title
    let lessonHref: string | null = null

    if (a.source_type === 'lesson') {
      const lesson = lessonMap.get(a.lesson_id)
      title = a.title ?? lesson?.title ?? 'Lesson'
      if (lesson) lessonHref = `/dashboard/skills/${lesson.skill_node_id}/lesson/${a.lesson_id}`
    } else if (a.source_type === 'skill_node') {
      const node = skillNodeMap.get(a.skill_node_id)
      title = a.title ?? node?.title ?? 'Unit'
      lessonHref = `/dashboard/skills/${a.skill_node_id}`
    }

    return {
      id: a.id as string,
      sourceType: a.source_type as 'lesson' | 'skill_node' | 'custom',
      title: title as string,
      instructions: (a.instructions ?? null) as string | null,
      dueDate: (a.due_date ?? null) as string | null,
      assignedBy: (staffMap.get(a.assigned_by) ?? null) as string | null,
      lessonHref,
      status: (submission?.status ?? 'not_started') as 'not_started' | 'in_progress' | 'submitted' | 'graded',
      submissionContent: (submission?.submission_content ?? '') as string,
      projectUrl: (submission?.project_url ?? '') as string,
      videoUrl: (submission?.video_url ?? '') as string,
      grade: (submission?.grade ?? null) as string | null,
      feedback: (submission?.feedback ?? null) as string | null,
    }
  })

  return { className, assignments: result }
}

// ── ASSIGNMENTS PAGE: submit a custom (freeform) assignment ──────
export const submitAssignmentResponse = async (
  assignmentId: string,
  studentId: string,
  content: string,
  projectUrl?: string,
  videoUrl?: string
) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('assignment_submissions')
    .upsert(
      {
        assignment_id: assignmentId,
        student_id: studentId,
        submission_content: content,
        project_url: projectUrl?.trim() || null,
        video_url: videoUrl?.trim() || null,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'assignment_id,student_id' }
    )
    .select()
    .single()
  return { data, error }
}
// Finds the student's active class, the earliest-due pending
// assignment in it, and resolves it down to an actual lesson.
// ── DASHBOARD: next lesson (B2B2C, assignment-driven path) ───────
// Only 'lesson' and 'skill_node' assignments feed nextLesson —
// 'custom' assignments (freeform teacher activities, no lesson_id)
// are deliberately excluded here. They need their own card, not a
// forced fit into the "next lesson" shape — that card isn't built
// yet, so a custom-only assignment currently shows as no assignment
// at all. Worth building before this goes live with real teachers.
//
// NOTE: the nested-select embeds below (classes(...), assignment_
// submissions(...)) rely on Supabase/PostgREST inferring the FK
// relationship automatically. Should work given the schema, but
// test against real data — can't verify without a live instance.
export const getNextAssignmentForStudent = async (userId: string, supabaseClient?: any) => {
  const supabase = supabaseClient ?? createClient()

  const { data: enrollment } = await supabase
    .from('class_enrollments')
    .select('class_id, classes(id, name, school_id)')
    .eq('student_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (!enrollment) return { nextLesson: null, className: null }

  const className = (enrollment as any).classes?.name ?? null

  const { data: assignments } = await supabase
    .from('assignments')
    .select('*, assignment_submissions(status, student_id)')
    .eq('class_id', enrollment.class_id)
    .in('source_type', ['lesson', 'skill_node'])
    .order('due_date', { ascending: true, nullsFirst: false })

  const pending = (assignments ?? []).find((a: any) => {
    const sub = (a.assignment_submissions as any[])?.find((s: any) => s.student_id === userId)
    return !sub || sub.status !== 'graded'
  })

  if (!pending) return { nextLesson: null, className }

  const { data: staff } = await supabase
    .from('school_staff')
    .select('profiles(display_name)')
    .eq('id', pending.assigned_by)
    .maybeSingle()
  const teacherName = (staff as any)?.profiles?.display_name ?? undefined

  const dueLabel = pending.due_date
    ? new Date(pending.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : undefined

  if (pending.source_type === 'lesson') {
    const { data: lesson } = await supabase.from('lessons').select('*').eq('id', pending.lesson_id).single()
    if (!lesson) return { nextLesson: null, className }
    return {
      nextLesson: {
        id: lesson.id,
        title: pending.title ?? lesson.title,
        emoji: lesson.emoji ?? '',
        xp_reward: lesson.xp_reward ?? 0,
        skill_id: lesson.skill_node_id,
        assignedBy: teacherName,
        dueLabel,
      },
      className,
    }
  }

  const { data: completions } = await supabase
    .from('user_lesson_completions')
    .select('lesson_id')
    .eq('user_id', userId)
  const completedIds = new Set((completions ?? []).map((c: any) => c.lesson_id))

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('skill_node_id', pending.skill_node_id)
    .order('sort_order')

  const firstIncomplete = (lessons ?? []).find((l: any) => !completedIds.has(l.id)) ?? (lessons ?? [])[0]
  if (!firstIncomplete) return { nextLesson: null, className }

  return {
    nextLesson: {
      id: firstIncomplete.id,
      title: pending.title ?? firstIncomplete.title,
      emoji: firstIncomplete.emoji ?? '',
      xp_reward: firstIncomplete.xp_reward ?? 0,
      skill_id: pending.skill_node_id,
      assignedBy: teacherName,
      dueLabel,
    },
    className,
  }
}
export async function getStudentClassInfo(userId: string, supabaseClient?: any) {
  const supabase = supabaseClient ?? createClient()

  const { data, error } = await supabase
    .from('class_enrollments')
    .select(`
      status,
      class:classes (
        name,
        teacher:school_staff!teacher_id ( profile:profiles ( display_name ) )
      )
    `)
    .eq('student_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !data?.class) return null

  const cls: any = Array.isArray(data.class) ? data.class[0] : data.class
  const teacherStaff = Array.isArray(cls?.teacher) ? cls.teacher[0] : cls?.teacher
  const teacher = Array.isArray(teacherStaff?.profile) ? teacherStaff.profile[0] : teacherStaff?.profile

  return {
    className: cls?.name ?? null,
    teacherName: teacher?.display_name ?? null,
  }
}
export const pingPresence = async (userId: string) => {
  const supabase = createClient()
  await supabase
    .from('profiles')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', userId)
}