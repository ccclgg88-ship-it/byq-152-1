const STORAGE_KEY = 'round_pet_archive_data'

export interface StoredData {
  pets: any[]
  records: any[]
  dailyStats: any[]
  settings: any
}

export const loadFromStorage = (): StoredData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return null
    const parsed = JSON.parse(data)
    if (!isValidData(parsed)) {
      console.warn('Invalid data format in localStorage')
      return null
    }
    return parsed
  } catch (error) {
    console.error('Failed to load data from localStorage:', error)
    return null
  }
}

export const saveToStorage = (data: StoredData): boolean => {
  try {
    const json = JSON.stringify(data)
    localStorage.setItem(STORAGE_KEY, json)
    return true
  } catch (error) {
    console.error('Failed to save data to localStorage:', error)
    return false
  }
}

export const clearStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY)
}

export const isValidData = (data: any): data is StoredData => {
  if (!data || typeof data !== 'object') return false
  if (!Array.isArray(data.pets)) return false
  if (!Array.isArray(data.records)) return false
  if (!Array.isArray(data.dailyStats)) return false
  if (!data.settings || typeof data.settings !== 'object') return false
  return true
}

export const exportDataToJson = (data: StoredData): string => {
  return JSON.stringify(data, null, 2)
}

export const importDataFromJson = (json: string): StoredData | null => {
  try {
    const parsed = JSON.parse(json)
    if (!isValidData(parsed)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}
