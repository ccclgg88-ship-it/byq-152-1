export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'YYYY-MM-DD HH:mm')
}

export const formatTime = (date: Date | string): string => {
  return formatDate(date, 'HH:mm')
}

export const getTodayString = (): string => {
  return formatDate(new Date(), 'YYYY-MM-DD')
}

export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export const isYesterday = (date: Date | string): boolean => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return isSameDay(date, yesterday)
}

export const getDaysAgo = (days: number): Date => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

export const getLastNDays = (n: number): string[] => {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    days.push(formatDate(getDaysAgo(i), 'YYYY-MM-DD'))
  }
  return days
}

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} 分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours} 小时`
  }
  return `${hours} 小时 ${mins} 分钟`
}

export const getRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins} 分钟前`
  if (diffHours < 24) return `${diffHours} 小时前`
  if (diffDays < 7) return `${diffDays} 天前`
  return formatDate(d)
}
