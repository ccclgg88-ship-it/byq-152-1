import { create } from 'zustand'
import {
  Pet,
  InteractionRecord,
  DailyStats,
  UserSettings,
  InteractionType,
  PetSpecies,
} from '@/types'
import {
  loadFromStorage,
  saveToStorage,
  clearStorage,
  exportDataToJson,
  importDataFromJson,
  isValidData,
} from '@/utils/storage'
import {
  generateId,
  getMoodFromValue,
  clampMoodValue,
  calculateLevel,
} from '@/utils/pet'
import { SPECIES_LIST, INTERACTION_CONFIG, ADVENTURE_STICKERS } from '@/data/species'
import { getTodayString, getLastNDays, formatDateTime } from '@/utils/date'

interface PetStore {
  pets: Pet[]
  records: InteractionRecord[]
  dailyStats: DailyStats[]
  settings: UserSettings
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

  getTodayStats: () => { minutes: number; streak: number }
  getWeeklyMoodData: (petId: string) => { labels: string[]; moodData: number[]; timeData: number[] }
  getFilteredRecords: (filters?: {
    species?: PetSpecies
    type?: InteractionType
    search?: string
  }) => InteractionRecord[]

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

export const usePetStore = create<PetStore>((set, get) => ({
  pets: [],
  records: [],
  dailyStats: [],
  settings: getDefaultSettings(),
  isLoading: true,
  error: null,
  hasData: false,

  init: () => {
    try {
      const data = loadFromStorage()
      if (data) {
        const settings = updateStreak(data.settings || getDefaultSettings())
        set({
          pets: data.pets || [],
          records: data.records || [],
          dailyStats: data.dailyStats || [],
          settings,
          isLoading: false,
          hasData: data.pets.length > 0,
        })
      } else {
        set({
          pets: [],
          records: [],
          dailyStats: [],
          settings: getDefaultSettings(),
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
    if (type === 'adventure') {
      const sticker = ADVENTURE_STICKERS[Math.floor(Math.random() * ADVENTURE_STICKERS.length)]
      details = { sticker }
    }

    const record: InteractionRecord = {
      id: generateId(),
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

      return {
        pets: updatedPets,
        records: [record, ...state.records],
        dailyStats: updatedDailyStats,
      }
    })

    get().saveToStorage()
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

  updateSettings: (partial) => {
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }))
    get().saveToStorage()
  },

  exportData: () => {
    const { pets, records, dailyStats, settings } = get()
    return exportDataToJson({ pets, records, dailyStats, settings })
  },

  importData: (json: string) => {
    const data = importDataFromJson(json)
    if (!data) return false

    set({
      pets: data.pets,
      records: data.records,
      dailyStats: data.dailyStats,
      settings: data.settings,
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
      hasData: false,
    })
  },

  saveToStorage: () => {
    const { pets, records, dailyStats, settings } = get()
    saveToStorage({ pets, records, dailyStats, settings })
  },
}))
