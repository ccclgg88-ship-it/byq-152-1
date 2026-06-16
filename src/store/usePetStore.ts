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
  DailyTasksData,
  DailyTask,
  TaskReward,
} from '@/types'
import {
  loadFromStorage,
  saveToStorage as saveToStorageUtil,
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
  DAILY_TASK_POOL,
  TREASURE_REWARD,
} from '@/data/species'
import { getTodayString, getLastNDays, formatDateTime, getDaysAgo, formatDate, isYesterday } from '@/utils/date'

interface PetStore {
  pets: Pet[]
  records: InteractionRecord[]
  dailyStats: DailyStats[]
  settings: UserSettings
  achievements: Achievement[]
  stickers: Sticker[]
  dailyTasksData: DailyTasksData | null
  pendingAchievement: Achievement | null
  pendingTaskCompletedId: string | null
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

  refreshDailyTasks: () => void
  updateTaskProgress: (interactionType: InteractionType) => string | null
  claimTaskReward: (taskId: string) => boolean
  claimDailyTreasure: () => boolean
  clearPendingTaskCompleted: () => void

  getTodayTasksSummary: () => {
    total: number
    completed: number
    claimed: number
    streak: number
    canClaimTreasure: boolean
  }
  getTaskHistory7Days: () => Array<{
    date: string
    label: string
    completed: number
    total: number
    treasureClaimed: boolean
  }>
  getWeeklyCompletionRate: () => number
  getTotalTasksCompleted: () => number
  getTotalTreasuresClaimed: () => number

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

const generateDailyTasks = (): DailyTask[] => {
  const pool = [...DAILY_TASK_POOL]
  const count = 4 + Math.floor(Math.random() * 2)
  const shuffled = pool.sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, pool.length))

  return selected.map((config) => ({
    id: generateId(),
    configId: config.id,
    type: config.type,
    currentProgress: 0,
    target: config.target,
    isCompleted: false,
    isClaimed: false,
    reward: { ...config.reward },
  }))
}

const getDefaultDailyTasksData = (): DailyTasksData => ({
  date: getTodayString(),
  tasks: generateDailyTasks(),
  treasureClaimed: false,
  treasureReward: { ...TREASURE_REWARD },
  taskStreakDays: 0,
  lastCompletedDate: '',
  totalTasksCompleted: 0,
  totalTreasuresClaimed: 0,
  dailyHistory: [],
})

export const usePetStore = create<PetStore>((set, get) => ({
  pets: [],
  records: [],
  dailyStats: [],
  settings: getDefaultSettings(),
  achievements: [],
  stickers: [],
  dailyTasksData: null,
  pendingAchievement: null,
  pendingTaskCompletedId: null,
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
        let dailyTasksData = data.dailyTasks || null

        const today = getTodayString()
        if (!dailyTasksData || dailyTasksData.date !== today) {
          if (dailyTasksData && dailyTasksData.date !== today) {
            const yesterdayTasks = dailyTasksData.tasks
            const completedCount = yesterdayTasks.filter((t: DailyTask) => t.isCompleted).length
            const allCompleted = completedCount === yesterdayTasks.length && dailyTasksData.treasureClaimed

            let newHistory = dailyTasksData.dailyHistory || []
            newHistory = [
              ...newHistory,
              {
                date: dailyTasksData.date,
                totalTasks: yesterdayTasks.length,
                completedTasks: completedCount,
                treasureClaimed: dailyTasksData.treasureClaimed,
              },
            ].slice(-7)

            let newStreakDays = dailyTasksData.taskStreakDays || 0
            if (allCompleted) {
              if (isYesterday(dailyTasksData.date) || dailyTasksData.lastCompletedDate === dailyTasksData.date) {
                newStreakDays += 1
              } else {
                newStreakDays = 1
              }
            } else if (!isYesterday(dailyTasksData.lastCompletedDate)) {
              newStreakDays = 0
            }

            dailyTasksData = {
              date: today,
              tasks: generateDailyTasks(),
              treasureClaimed: false,
              treasureReward: { ...TREASURE_REWARD },
              taskStreakDays: newStreakDays,
              lastCompletedDate: allCompleted ? dailyTasksData.date : dailyTasksData.lastCompletedDate,
              totalTasksCompleted: (dailyTasksData.totalTasksCompleted || 0) + completedCount,
              totalTreasuresClaimed: (dailyTasksData.totalTreasuresClaimed || 0) + (dailyTasksData.treasureClaimed ? 1 : 0),
              dailyHistory: newHistory,
            }
          } else {
            dailyTasksData = getDefaultDailyTasksData()
          }
        }

        set({
          pets: data.pets || [],
          records: data.records || [],
          dailyStats: data.dailyStats || [],
          settings,
          achievements,
          stickers,
          dailyTasksData,
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
          dailyTasksData: getDefaultDailyTasksData(),
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
    const completedTaskId = get().updateTaskProgress(type)
    if (completedTaskId) {
      set({ pendingTaskCompletedId: completedTaskId })
    }
    return record
  },

  refreshDailyTasks: () => {
    set({ dailyTasksData: getDefaultDailyTasksData() })
    get().saveToStorage()
  },

  updateTaskProgress: (interactionType: InteractionType): string | null => {
    const state = get()
    const data = state.dailyTasksData
    if (!data) return null

    let completedTaskId: string | null = null
    const updatedTasks = data.tasks.map((task) => {
      if (task.isCompleted) return task

      const config = DAILY_TASK_POOL.find((c) => c.id === task.configId)
      if (!config) return task

      let shouldIncrement = false
      if (task.type === 'total_interact') {
        shouldIncrement = true
      } else if (config.interactionType) {
        shouldIncrement = config.interactionType === interactionType
      }

      if (!shouldIncrement) return task

      const newProgress = Math.min(task.currentProgress + 1, task.target)
      const nowCompleted = newProgress >= task.target && !task.isCompleted

      if (nowCompleted) {
        completedTaskId = task.id
      }

      return {
        ...task,
        currentProgress: newProgress,
        isCompleted: newProgress >= task.target,
        completedAt: nowCompleted ? new Date().toISOString() : task.completedAt,
      }
    })

    set({
      dailyTasksData: {
        ...data,
        tasks: updatedTasks,
      },
    })
    get().saveToStorage()
    return completedTaskId
  },

  claimTaskReward: (taskId: string): boolean => {
    const state = get()
    const data = state.dailyTasksData
    if (!data) return false

    const task = data.tasks.find((t) => t.id === taskId)
    if (!task || !task.isCompleted || task.isClaimed) return false

    const updatedTasks = data.tasks.map((t) =>
      t.id === taskId ? { ...t, isClaimed: true } : t
    )

    set({
      dailyTasksData: {
        ...data,
        tasks: updatedTasks,
      },
    })
    get().saveToStorage()
    return true
  },

  claimDailyTreasure: (): boolean => {
    const state = get()
    const data = state.dailyTasksData
    const mainPet = state.getMainPet()
    if (!data || !mainPet) return false

    const allCompleted = data.tasks.every((t) => t.isCompleted)
    if (!allCompleted || data.treasureClaimed) return false

    const reward = data.treasureReward
    const newMoodValue = clampMoodValue(mainPet.moodValue + reward.mood)
    const newMood = getMoodFromValue(newMoodValue)
    const newExp = mainPet.exp + reward.exp
    const newLevel = calculateLevel(newExp)

    const recordId = generateId()
    const rewardRecord: InteractionRecord = {
      id: recordId,
      petId: mainPet.id,
      type: 'play',
      description: `${mainPet.name} 领取了今日陪伴宝箱奖励`,
      details: {
        reward: reward.description,
        expGain: reward.exp,
        moodGain: reward.mood,
      },
      moodChange: reward.mood,
      expGain: reward.exp,
      createdAt: new Date().toISOString(),
    }

    set((prevState) => ({
      pets: prevState.pets.map((p) =>
        p.id === mainPet.id
          ? {
              ...p,
              moodValue: newMoodValue,
              mood: newMood,
              exp: newExp,
              level: newLevel,
              lastInteractionAt: new Date().toISOString(),
            }
          : p
      ),
      records: [rewardRecord, ...prevState.records],
      dailyTasksData: {
        ...data,
        treasureClaimed: true,
      },
    }))

    get().saveToStorage()
    setTimeout(() => get().checkAndUnlockAchievements(), 50)
    return true
  },

  clearPendingTaskCompleted: () => {
    set({ pendingTaskCompletedId: null })
  },

  getTodayTasksSummary: () => {
    const data = get().dailyTasksData
    if (!data) {
      return { total: 0, completed: 0, claimed: 0, streak: 0, canClaimTreasure: false }
    }
    const total = data.tasks.length
    const completed = data.tasks.filter((t) => t.isCompleted).length
    const claimed = data.tasks.filter((t) => t.isClaimed).length
    return {
      total,
      completed,
      claimed,
      streak: data.taskStreakDays,
      canClaimTreasure: total > 0 && completed === total && !data.treasureClaimed,
    }
  },

  getTaskHistory7Days: () => {
    const data = get().dailyTasksData
    const last7Days = getLastNDays(7)
    const history = data?.dailyHistory || []

    return last7Days.map((date) => {
      const label = date.slice(5)
      const today = getTodayString()
      if (date === today) {
        const summary = get().getTodayTasksSummary()
        return {
          date,
          label,
          completed: summary.completed,
          total: summary.total || 5,
          treasureClaimed: data?.treasureClaimed || false,
        }
      }
      const record = history.find((h) => h.date === date)
      if (record) {
        return {
          date,
          label,
          completed: record.completedTasks,
          total: record.totalTasks,
          treasureClaimed: record.treasureClaimed,
        }
      }
      return {
        date,
        label,
        completed: 0,
        total: 0,
        treasureClaimed: false,
      }
    })
  },

  getWeeklyCompletionRate: () => {
    const history = get().getTaskHistory7Days().filter((d) => d.total > 0)
    if (history.length === 0) return 0
    const totalCompleted = history.reduce((sum, d) => sum + d.completed, 0)
    const totalTasks = history.reduce((sum, d) => sum + d.total, 0)
    if (totalTasks === 0) return 0
    return Math.round((totalCompleted / totalTasks) * 100)
  },

  getTotalTasksCompleted: () => {
    return get().dailyTasksData?.totalTasksCompleted || 0
  },

  getTotalTreasuresClaimed: () => {
    return get().dailyTasksData?.totalTreasuresClaimed || 0
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
    const { pets, records, dailyStats, settings, achievements, stickers, dailyTasksData } = get()
    return exportDataToJson({ pets, records, dailyStats, settings, achievements, stickers, dailyTasks: dailyTasksData })
  },

  importData: (json: string) => {
    const data = importDataFromJson(json)
    if (!data) return false

    const today = getTodayString()
    let dailyTasksData = data.dailyTasks || null

    if (!dailyTasksData) {
      dailyTasksData = getDefaultDailyTasksData()
    } else if (dailyTasksData.date !== today) {
      dailyTasksData = {
        ...getDefaultDailyTasksData(),
        taskStreakDays: dailyTasksData.taskStreakDays || 0,
        lastCompletedDate: dailyTasksData.lastCompletedDate || '',
        totalTasksCompleted: dailyTasksData.totalTasksCompleted || 0,
        totalTreasuresClaimed: dailyTasksData.totalTreasuresClaimed || 0,
        dailyHistory: dailyTasksData.dailyHistory || [],
      }
    }

    set({
      pets: data.pets,
      records: data.records,
      dailyStats: data.dailyStats,
      settings: data.settings,
      achievements: data.achievements || [],
      stickers: data.stickers || [],
      dailyTasksData,
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
      dailyTasksData: getDefaultDailyTasksData(),
      pendingAchievement: null,
      pendingTaskCompletedId: null,
      hasData: false,
    })
  },

  saveToStorage: () => {
    const { pets, records, dailyStats, settings, achievements, stickers, dailyTasksData } = get()
    saveToStorageUtil({ pets, records, dailyStats, settings, achievements, stickers, dailyTasks: dailyTasksData })
  },
}))
