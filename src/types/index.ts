export type PetSpecies = 'cat' | 'dog' | 'pig' | 'rabbit' | 'bear' | 'fox'

export type PetMood = 'happy' | 'calm' | 'playful' | 'sleepy'

export type InteractionType = 'feed' | 'pet' | 'adventure' | 'bedtime' | 'play'

export interface SpeciesConfig {
  id: PetSpecies
  name: string
  emoji: string
  color: string
  personality: string[]
}

export interface Pet {
  id: string
  species: PetSpecies
  name: string
  level: number
  exp: number
  mood: PetMood
  moodValue: number
  emoji: string
  color: string
  personality: string[]
  createdAt: string
  lastInteractionAt: string
  isMain: boolean
}

export interface InteractionRecord {
  id: string
  petId: string
  type: InteractionType
  description: string
  details: Record<string, any>
  moodChange: number
  expGain: number
  createdAt: string
}

export interface DailyStats {
  date: string
  totalMinutes: number
  petMoods: Record<string, number>
}

export interface UserSettings {
  theme: 'light' | 'dark'
  fontSize: 'small' | 'medium' | 'large'
  streakDays: number
  lastSignInDate: string
  createdAt: string
}

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration: number
}

export type AchievementCategory = 'first' | 'growth' | 'companion' | 'explore'

export interface AchievementConfig {
  id: string
  name: string
  description: string
  category: AchievementCategory
  icon: string
  color: string
  condition: {
    type: 'adopt' | 'level' | 'interact' | 'adventure' | 'streak' | 'species' | 'mood' | 'time'
    target: number
    species?: PetSpecies
    interactionType?: InteractionType
  }
}

export interface Achievement {
  id: string
  unlockedAt: string
  isNew: boolean
}

export interface StickerConfig {
  id: string
  name: string
  emoji: string
  rarity: 'common' | 'rare' | 'legendary'
  description: string
}

export interface Sticker {
  id: string
  obtainedAt: string
  petId: string
  recordId: string
  isNew: boolean
}
