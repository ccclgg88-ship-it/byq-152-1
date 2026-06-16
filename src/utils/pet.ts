import { PetMood, PetSpecies } from '@/types'
import { MOOD_CONFIG, EXP_PER_LEVEL, SPECIES_LIST } from '@/data/species'

export const getMoodFromValue = (value: number): PetMood => {
  if (value >= MOOD_CONFIG.happy.minValue) return 'happy'
  if (value >= MOOD_CONFIG.playful.minValue) return 'playful'
  if (value >= MOOD_CONFIG.calm.minValue) return 'calm'
  return 'sleepy'
}

export const getMoodEmoji = (mood: PetMood): string => {
  return MOOD_CONFIG[mood].emoji
}

export const getMoodName = (mood: PetMood): string => {
  return MOOD_CONFIG[mood].name
}

export const clampMoodValue = (value: number): number => {
  return Math.max(0, Math.min(100, value))
}

export const calculateLevel = (exp: number): number => {
  return Math.floor(exp / EXP_PER_LEVEL) + 1
}

export const getExpProgress = (exp: number): number => {
  return exp % EXP_PER_LEVEL
}

export const getNextLevelExp = (): number => {
  return EXP_PER_LEVEL
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const validatePetName = (name: string): { valid: boolean; message?: string } => {
  if (!name || !name.trim()) {
    return { valid: false, message: '昵称不能为空' }
  }
  if (name.length > 12) {
    return { valid: false, message: '昵称不能超过12个字符' }
  }
  return { valid: true }
}

export const getSpeciesName = (species: PetSpecies): string => {
  const config = SPECIES_LIST.find((s) => s.id === species)
  return config?.name || species
}

export const getSpeciesEmoji = (species: PetSpecies): string => {
  const config = SPECIES_LIST.find((s) => s.id === species)
  return config?.emoji || '🐾'
}

export const getSpeciesColor = (species: PetSpecies): string => {
  const config = SPECIES_LIST.find((s) => s.id === species)
  return config?.color || '#888888'
}
