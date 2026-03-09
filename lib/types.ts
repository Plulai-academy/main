// lib/types.ts

export type AgeGroup = 'mini' | 'junior' | 'pro' | 'expert'

export interface UserProfile {
  name: string
  avatar: string
  age: number
  ageGroup: AgeGroup
  interests: Interest[]
  dreamProject: string
  createdAt: string
}

export type Interest = 'coding' | 'ai' | 'games' | 'entrepreneurship' | 'art' | 'robots'

export interface UserProgress {
  xp: number
  level: number
  streak: number
  lastActiveDate: string
  completedLessons: string[]
  completedChallenges: string[]
  unlockedBadges: string[]
  currentPath: string
  skillProgress: Record<string, number> // skill id -> 0-100
}

export interface Badge {
  id: string
  name: string
  emoji: string
  description: string
  condition: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
}

export interface SkillNode {
  id: string
  title: string
  emoji: string
  description: string
  xpReward: number
  order: number
  requiredNodes: string[]
  track: Track
  ageGroups: AgeGroup[]
  lessons: string[]
}

export type Track = 'coding' | 'ai' | 'entrepreneurship'

export interface DailyChallenge {
  id: string
  title: string
  description: string
  emoji: string
  xpReward: number
  type: 'quiz' | 'build' | 'think' | 'share'
  expiresAt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
