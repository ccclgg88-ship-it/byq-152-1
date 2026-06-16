import { create } from 'zustand'
import {
  Pet,
  InteractionRecord,
  DailyStats,
  UserSettings,
  InteractionType,
  PetSpecies,
  Achievement,
  Sticker,
} from '@/types'
import {
  loadFromStorage,
  saveToStorage,
  clearStorage,
  exportDataToJson,
  importDataFromJson,
} from '@/utils/storage'
import {
  generateId,
  getMoodFromValue,
  clampMoodValue,
  calculateLevel,
} from '@/utils/pet'
import {
  SPECIES_LIST,
  INTERACTION_CONFIG,
  STICKER_ID_TO_EMOJI,
  ACHIEVEMENT_LIST,
  STICKER_LIST,
} from '@/data/species'
import { getTodayString, getLastNDays, formatDateTime, getDaysAgo, formatDate } from '@/utils/date'

interface PetStore {
  pets: Pet[]
  records: InteractionRecord[]
  dailyStats: DailyStats[]
  settings: UserSettings
  achievements: Achievement[]
  stickers: Sticker[]
  pendingAchievement: Achievement | null
  isLoading: boolean
  error: string | null
  hasData: boolean

  init: () => void
  adoptPet: (speciesId: PetSpecies, name: string) => boolean
  setMainPet: (petId: string) => void
  updatePetName: (petId: string, name: string) => boolean
  getMainPet: () => Pet | undefined
  getPetById: (petId: string) => Pet | undefined

  interact: (petId: string, type: InteractionType) => InteractionRecord | null
  checkAndUnlockAchievements: () => void

  getTodayStats: () => { minutes: number; streak: number }
  getWeeklyMoodData: (petId: string) => { labels: string[]; moodData: number[]; timeData: number[] }
  getFilteredRecords: (filters?: {
    species?: PetSpecies
    type?: InteractionType
    search?: string
  }) => InteractionRecord[]

  getAchievementProgress: (achievementId: string) => number
  getPetStickers: (petId: string) => Sticker[]
  getRecentAchievements: (limit?: number) => Achievement[]
  getRecentStickers: (limit?: number) => Sticker[]
  getStickersLast7Days: () => number
  markAchievementViewed: (achievementId: string) => void
  markStickerViewed: (stickerId: string) => void
  markAllViewed: () => void
  clearPendingAchievement: () => void
  hasNewItems: () => { achievements: boolean; stickers: boolean }

  updateSettings: (partial: Partial<UserSettings>) => void
  exportData: () => string
  importData: (json: string) => boolean
  clearAllData: () => void

  saveToStorage: () => void
}

const getDefaultSettings = (): UserSettings => ({
  theme: 'light',
  fontSize: 'medium',
  streakDays: 0,
  lastSignInDate: '',
  createdAt: new Date().toISOString(),
})

const createPet = (speciesId: PetSpecies, name: string, isMain: boolean = false): Pet => {
  const species = SPECIES_LIST.find((s) => s.id === speciesId)!
  const now = new Date().toISOString()
  return {
    id: generateId(),
    species: speciesId,
    name: name.trim(),
    level: 1,
    exp: 0,
    mood: 'calm',
    moodValue: 60,
    emoji: species.emoji,
    color: species.color,
    personality: [...species.personality],
    createdAt: now,
    lastInteractionAt: now,
    isMain,
  }
}

const updateDailyStats = (
  dailyStats: DailyStats[],
  petId: string,
  moodValue: number,
  minutes: number = 5
): DailyStats[] => {
  const today = getTodayString()
  const existingIndex = dailyStats.findIndex((d) => d.date === today)

  if (existingIndex >= 0) {
    const updated = [...dailyStats]
    const stat = { ...updated[existingIndex] }
    stat.totalMinutes += minutes
    stat.petMoods = { ...stat.petMoods }
    const currentMood = stat.petMoods[petId] ?? moodValue
    stat.petMoods[petId] = Math.round((currentMood + moodValue) / 2)
    updated[existingIndex] = stat
    return updated
  } else {
    return [
      ...dailyStats,
      {
        date: today,
        totalMinutes: minutes,
        petMoods: { [petId]: moodValue },
      },
    ]
  }
}

const updateStreak = (settings: UserSettings): UserSettings => {
  const today = getTodayString()
  const lastDate = settings.lastSignInDate

  if (lastDate === today) {
    return settings
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (lastDate === yesterdayStr) {
    return {
      ...settings,
      streakDays: settings.streakDays + 1,
      lastSignInDate: today,
    }
  }

  return {
    ...settings,
    streakDays: 1,
    lastSignInDate: today,
  }
}

const convertStickerEmojiToId = (stickerText: string): string | null => {
  return STICKER_ID_TO_EMOJI[stickerText] || null
}

export const usePetStore = create<PetStore>((set, get) => ({
  pets: [],
  records: [],
  dailyStats: [],
  settings: getDefaultSettings(),
  achievements: [],
  stickers: [],
  pendingAchievement: null,
  isLoading: true,
  error: null,
  hasData: false,

  init: () => {
    try {
      const data = loadFromStorage()
      if (data) {
        const settings = updateStreak(data.settings || getDefaultSettings())
        const achievements = data.achievements || []
        const stickers = data.stickers || []

        set({
          pets: data.pets || [],
          records: data.records || [],
          dailyStats: data.dailyStats || [],
          settings,
          achievements,
          stickers,
          isLoading: false,
          hasData: data.pets.length > 0,
        })

        setTimeout(() => {
          get().checkAndUnlockAchievements()
        }, 100)
      } else {
        set({
          pets: [],
          records: [],
          dailyStats: [],
          settings: getDefaultSettings(),
          achievements: [],
          stickers: [],
          isLoading: false,
          hasData: false,
        })
      }
    } catch (error) {
      set({
        isLoading: false,
        error: '数据加载失败，请刷新页面重试',
      })
    }
  },

  checkAndUnlockAchievements: () => {
    const state = get()
    const unlockedIds = new Set(state.achievements.map((a) => a.id))
    const newlyUnlocked: Achievement[] = []

    for (const config of ACHIEVEMENT_LIST) {
      if (unlockedIds.has(config.id)) continue

      const progress = state.getAchievementProgress(config.id)
      if (progress >= 100) {
        newlyUnlocked.push({
          id: config.id,
          unlockedAt: new Date().toISOString(),
          isNew: true,
        })
      }
    }

    if (newlyUnlocked.length > 0) {
      set((prevState) => ({
        achievements: [...prevState.achievements, ...newlyUnlocked],
        pendingAchievement: newlyUnlocked[0],
      }))
      get().saveToStorage()
    }
  },

  adoptPet: (speciesId: PetSpecies, name: string) => {
    const { pets } = get()
    const species = SPECIES_LIST.find((s) => s.id === speciesId)
    if (!species) return false

    const isMain = pets.length === 0
    const newPet = createPet(speciesId, name, isMain)

    set((state) => {
      const newPets = [...state.pets, newPet]
      return { pets: newPets, hasData: true }
    })

    get().saveToStorage()
    setTimeout(() => get().checkAndUnlockAchievements(), 50)
    return true
  },

  setMainPet: (petId: string) => {
    set((state) => ({
      pets: state.pets.map((p) => ({
        ...p,
        isMain: p.id === petId,
      })),
    }))
    get().saveToStorage()
  },

  updatePetName: (petId: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed || trimmed.length > 12) return false

    set((state) => ({
      pets: state.pets.map((p) =>
        p.id === petId ? { ...p, name: trimmed } : p
      ),
    }))
    get().saveToStorage()
    return true
  },

  getMainPet: () => {
    const { pets } = get()
    return pets.find((p) => p.isMain) || pets[0]
  },

  getPetById: (petId: string) => {
    const { pets } = get()
    return pets.find((p) => p.id === petId)
  },

  interact: (petId: string, type: InteractionType) => {
    const config = INTERACTION_CONFIG[type]
    if (!config) return null

    const pet = get().getPetById(petId)
    if (!pet) return null

    const newMoodValue = clampMoodValue(pet.moodValue + config.moodChange)
    const newMood = getMoodFromValue(newMoodValue)
    const newExp = pet.exp + config.expGain
    const newLevel = calculateLevel(newExp)

    let details: Record<string, any> = {}
    let stickerId: string | null = null

    if (type === 'adventure') {
      const allStickers = [...STICKER_LIST]
      const weights = allStickers.map((s) => {
        if (s.rarity === 'legendary') return 1
        if (s.rarity === 'rare') return 3
        return 6
      })
      const totalWeight = weights.reduce((a, b) => a + b, 0)
      let random = Math.random() * totalWeight
      let selectedSticker = allStickers[0]
      for (let i = 0; i < allStickers.length; i++) {
        random -= weights[i]
        if (random <= 0) {
          selectedSticker = allStickers[i]
          break
        }
      }
      stickerId = selectedSticker.id
      details = { sticker: `${selectedSticker.emoji} ${selectedSticker.name}`, stickerId }
    }

    const recordId = generateId()
    const record: InteractionRecord = {
      id: recordId,
      petId,
      type,
      description: `${pet.name} ${config.name}了`,
      details,
      moodChange: config.moodChange,
      expGain: config.expGain,
      createdAt: new Date().toISOString(),
    }

    set((state) => {
      const updatedPets = state.pets.map((p) =>
        p.id === petId
          ? {
              ...p,
              moodValue: newMoodValue,
              mood: newMood,
              exp: newExp,
              level: newLevel,
              lastInteractionAt: new Date().toISOString(),
            }
          : p
      )

      const updatedDailyStats = updateDailyStats(
        state.dailyStats,
        petId,
        newMoodValue,
        5
      )

      let newStickers = state.stickers
      if (stickerId) {
        newStickers = [
          ...state.stickers,
          {
            id: stickerId,
            obtainedAt: new Date().toISOString(),
            petId,
            recordId,
            isNew: true,
          },
        ]
      }

      return {
        pets: updatedPets,
        records: [record, ...state.records],
        dailyStats: updatedDailyStats,
        stickers: newStickers,
      }
    })

    get().saveToStorage()
    setTimeout(() => get().checkAndUnlockAchievements(), 50)
    return record
  },

  getTodayStats: () => {
    const { dailyStats, settings } = get()
    const today = getTodayString()
    const todayStat = dailyStats.find((d) => d.date === today)
    return {
      minutes: todayStat?.totalMinutes || 0,
      streak: settings.streakDays,
    }
  },

  getWeeklyMoodData: (petId: string) => {
    const { dailyStats } = get()
    const last7Days = getLastNDays(7)

    const labels = last7Days.map((d) => d.slice(5))
    const moodData: number[] = []
    const timeData: number[] = []

    last7Days.forEach((date) => {
      const stat = dailyStats.find((d) => d.date === date)
      if (stat) {
        moodData.push(stat.petMoods[petId] ?? 0)
        timeData.push(stat.totalMinutes)
      } else {
        moodData.push(0)
        timeData.push(0)
      }
    })

    return { labels, moodData, timeData }
  },

  getFilteredRecords: (filters) => {
    const { records, pets } = get()
    let filtered = [...records]

    if (filters?.species) {
      const petIdsOfSpecies = pets.filter((p) => p.species === filters.species).map((p) => p.id)
      filtered = filtered.filter((r) => petIdsOfSpecies.includes(r.petId))
    }

    if (filters?.type) {
      filtered = filtered.filter((r) => r.type === filters.type)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      const petNames: Record<string, string> = {}
      pets.forEach((p) => {
        petNames[p.id] = p.name.toLowerCase()
      })
      filtered = filtered.filter((r) => {
        const petName = petNames[r.petId] || ''
        return (
          petName.includes(search) ||
          r.description.toLowerCase().includes(search)
        )
      })
    }

    return filtered
  },

  getAchievementProgress: (achievementId: string) => {
    const state = get()
    const config = ACHIEVEMENT_LIST.find((a) => a.id === achievementId)
    if (!config) return 0

    const { condition } = config
    let current = 0

    switch (condition.type) {
      case 'adopt':
        current = state.pets.length
        break
      case 'species':
        current = new Set(state.pets.map((p) => p.species)).size
        break
      case 'level':
        current = Math.max(0, ...state.pets.map((p) => p.level))
        break
      case 'interact':
        if (condition.interactionType) {
          current = state.records.filter((r) => r.type === condition.interactionType).length
        } else {
          current = state.records.length
        }
        break
      case 'adventure':
        current = state.records.filter((r) => r.type === 'adventure').length
        break
      case 'streak':
        current = state.settings.streakDays
        break
      case 'mood':
        current = state.pets.some((p) => p.moodValue >= condition.target) ? condition.target : 0
        break
      case 'time':
        current = state.dailyStats.reduce((sum, d) => sum + d.totalMinutes, 0)
        break
    }

    return Math.min(100, Math.round((current / condition.target) * 100))
  },

  getPetStickers: (petId: string) => {
    return get().stickers.filter((s) => s.petId === petId)
  },

  getRecentAchievements: (limit: number = 5) => {
    return [...get().achievements]
      .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
      .slice(0, limit)
  },

  getRecentStickers: (limit: number = 5) => {
    return [...get().stickers]
      .sort((a, b) => new Date(b.obtainedAt).getTime() - new Date(a.obtainedAt).getTime())
      .slice(0, limit)
  },

  getStickersLast7Days: () => {
    const sevenDaysAgo = formatDate(getDaysAgo(7), 'YYYY-MM-DD')
    return get().stickers.filter((s) => s.obtainedAt >= sevenDaysAgo).length
  },

  markAchievementViewed: (achievementId: string) => {
    set((state) => ({
      achievements: state.achievements.map((a) =>
        a.id === achievementId ? { ...a, isNew: false } : a
      ),
    }))
    get().saveToStorage()
  },

  markStickerViewed: (stickerId: string) => {
    set((state) => ({
      stickers: state.stickers.map((s) =>
        s.id === stickerId ? { ...s, isNew: false } : s
      ),
    }))
    get().saveToStorage()
  },

  markAllViewed: () => {
    set((state) => ({
      achievements: state.achievements.map((a) => ({ ...a, isNew: false })),
      stickers: state.stickers.map((s) => ({ ...s, isNew: false })),
    }))
    get().saveToStorage()
  },

  clearPendingAchievement: () => {
    set({ pendingAchievement: null })
  },

  hasNewItems: () => {
    const state = get()
    return {
      achievements: state.achievements.some((a) => a.isNew),
      stickers: state.stickers.some((s) => s.isNew),
    }
  },

  updateSettings: (partial) => {
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }))
    get().saveToStorage()
    setTimeout(() => get().checkAndUnlockAchievements(), 50)
  },

  exportData: () => {
    const { pets, records, dailyStats, settings, achievements, stickers } = get()
    return exportDataToJson({ pets, records, dailyStats, settings, achievements, stickers })
  },

  importData: (json: string) => {
    const data = importDataFromJson(json)
    if (!data) return false

    set({
      pets: data.pets,
      records: data.records,
      dailyStats: data.dailyStats,
      settings: data.settings,
      achievements: data.achievements || [],
      stickers: data.stickers || [],
      hasData: data.pets.length > 0,
    })
    get().saveToStorage()
    return true
  },

  clearAllData: () => {
    clearStorage()
    set({
      pets: [],
      records: [],
      dailyStats: [],
      settings: getDefaultSettings(),
      achievements: [],
      stickers: [],
      pendingAchievement: null,
      hasData: false,
    })
  },

  saveToStorage: () => {
    const { pets, records, dailyStats, settings, achievements, stickers } = get()
    saveToStorage({ pets, records, dailyStats, settings, achievements, stickers })
  },
}))
