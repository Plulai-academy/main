// lib/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, UserProgress, AgeGroup } from './types'

// XP required to reach each level
export const XP_PER_LEVEL = 1000
export const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1
export const getXPInLevel = (xp: number) => xp % XP_PER_LEVEL
export const getLevelTitle = (level: number): string => {
  const tiers = [
    'Rookie',
    'Explorer',
    'Builder',
    'Creator',
    'Innovator',
    'Strategist',
    'Visionary',
    'Elite',
    'Legend',
    'Grandmaster',
  ]

  const tierIndex = Math.floor((level - 1) / 10)
  const tierLevel = ((level - 1) % 10) + 1

  const tier = tiers[Math.min(tierIndex, tiers.length - 1)]

  return `${tier} ${tierLevel}`
}
export const getAgeGroup = (age: number): AgeGroup => {
  if (age <= 8) return 'mini'
  if (age <= 11) return 'junior'
  if (age <= 14) return 'pro'
  return 'expert'
}

interface AppState {
  profile: UserProfile | null
  progress: UserProgress
  setProfile: (profile: UserProfile) => void
  addXP: (amount: number, reason?: string) => { newBadges: string[]; leveledUp: boolean }
  completeLesson: (lessonId: string) => void
  completeChallenge: (challengeId: string) => void
  updateStreak: () => void
  unlockBadge: (badgeId: string) => void
  updateSkillProgress: (skillId: string, value: number) => void
  resetProgress: () => void
}

const defaultProgress: UserProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: '',
  completedLessons: [],
  completedChallenges: [],
  unlockedBadges: [],
  currentPath: 'coding',
  skillProgress: {},
}

// Badge unlock logic
const checkBadges = (progress: UserProgress): string[] => {
  const newBadges: string[] = []
  const { xp, completedLessons, streak, unlockedBadges } = progress

  const maybeUnlock = (id: string, condition: boolean) => {
    if (condition && !unlockedBadges.includes(id)) newBadges.push(id)
  }

  maybeUnlock('first-lesson', completedLessons.length >= 1)
  maybeUnlock('streak-3',     streak >= 3)
  maybeUnlock('streak-7',     streak >= 7)
  maybeUnlock('xp-100',       xp >= 100)
  maybeUnlock('xp-500',       xp >= 500)
  maybeUnlock('lessons-5',    completedLessons.length >= 5)
  maybeUnlock('lessons-10',   completedLessons.length >= 10)

  return newBadges
}

export const useAppStore = create<AppState>()(
  persist(
    (set: (partial: Partial<AppState>) => void, get: () => AppState) => ({
      profile: null,
      progress: defaultProgress,

      setProfile: (profile: UserProfile) => set({ profile }),

      addXP: (amount: number) => {
        const state = get()
        const oldLevel = getLevel(state.progress.xp)
        const newXP = state.progress.xp + amount
        const newLevel = getLevel(newXP)
        const leveledUp = newLevel > oldLevel

        const updatedProgress = { ...state.progress, xp: newXP, level: newLevel }
        const newBadges = checkBadges(updatedProgress)

        set({
          progress: {
            ...updatedProgress,
            unlockedBadges: [...updatedProgress.unlockedBadges, ...newBadges],
          },
        })

        return { newBadges, leveledUp }
      },

      completeLesson: (lessonId: string) => {
        const { progress } = get()
        if (progress.completedLessons.includes(lessonId)) return
        const updated = {
          ...progress,
          completedLessons: [...progress.completedLessons, lessonId],
        }
        const newBadges = checkBadges(updated)
        set({ progress: { ...updated, unlockedBadges: [...updated.unlockedBadges, ...newBadges] } })
      },

      completeChallenge: (challengeId: string) => {
        const { progress } = get()
        if (progress.completedChallenges.includes(challengeId)) return
        set({ progress: { ...progress, completedChallenges: [...progress.completedChallenges, challengeId] } })
      },

      updateStreak: () => {
        const { progress } = get()
        const today = new Date().toDateString()
        const yesterday = new Date(Date.now() - 86400000).toDateString()

        let newStreak = progress.streak
        if (progress.lastActiveDate === today) return
        if (progress.lastActiveDate === yesterday) {
          newStreak = progress.streak + 1
        } else if (progress.lastActiveDate !== today) {
          newStreak = 1
        }

        set({ progress: { ...progress, streak: newStreak, lastActiveDate: today } })
      },

      unlockBadge: (badgeId: string) => {
        const { progress } = get()
        if (progress.unlockedBadges.includes(badgeId)) return
        set({ progress: { ...progress, unlockedBadges: [...progress.unlockedBadges, badgeId] } })
      },

      updateSkillProgress: (skillId: string, value: number) => {
        const { progress } = get()
        set({ progress: { ...progress, skillProgress: { ...progress.skillProgress, [skillId]: value } } })
      },

      resetProgress: () => set({ progress: defaultProgress, profile: null }),
    }),
    { name: 'kidai-storage' }
  )
)
