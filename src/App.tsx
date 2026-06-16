import React, { useEffect, useState, useCallback, createContext, useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { usePetStore } from '@/store/usePetStore'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import PetsPage from '@/pages/PetsPage'
import RecordsPage from '@/pages/RecordsPage'
import SettingsPage from '@/pages/SettingsPage'
import CollectionPage from '@/pages/CollectionPage'
import TasksPage from '@/pages/TasksPage'
import ToastContainer from '@/components/ToastContainer'
import AchievementUnlockModal from '@/components/AchievementUnlockModal'
import TaskCompleteModal from '@/components/TaskCompleteModal'
import { ToastItem, ToastType } from '@/types'
import { ACHIEVEMENT_LIST, DAILY_TASK_POOL } from '@/data/species'
import ErrorBoundary from '@/components/ErrorBoundary'

export const ToastContext = createContext<{
  showToast: (message: string, type?: ToastType, duration?: number) => void
}>({ showToast: () => {} })

function App() {
  const { init, settings, isLoading, error, pendingAchievement, clearPendingAchievement, pendingTaskCompletedId, clearPendingTaskCompleted } = usePetStore()
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', settings.fontSize)
  }, [settings.fontSize])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2)
    setToasts((prev) => [...prev, { id, message, type, duration }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const pendingAchievementConfig = useMemo(() => {
    if (!pendingAchievement) return null
    return ACHIEVEMENT_LIST.find((a) => a.id === pendingAchievement.id) || null
  }, [pendingAchievement])

  const pendingTaskConfig = useMemo(() => {
    if (!pendingTaskCompletedId) return null
    return DAILY_TASK_POOL.find((t) => t.id === pendingTaskCompletedId) || null
  }, [pendingTaskCompletedId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐾</div>
          <p className="text-gray-600 dark:text-gray-300">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-gray-900">
        <div className="text-center pet-card p-8 max-w-md">
          <div className="text-5xl mb-4">😿</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">出错了</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            className="pet-button-primary px-6 py-3"
            onClick={() => window.location.reload()}
          >
            刷新页面
          </button>
        </div>
      </div>
    )
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ErrorBoundary>
        <div className="min-h-screen">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pets" element={<PetsPage />} />
              <Route path="/records" element={<RecordsPage />} />
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
          <ToastContainer toasts={toasts} />
          <AchievementUnlockModal
            isOpen={!!pendingAchievement}
            onClose={clearPendingAchievement}
            achievement={pendingAchievementConfig}
          />
          <TaskCompleteModal
            isOpen={!!pendingTaskCompletedId}
            onClose={clearPendingTaskCompleted}
            task={pendingTaskConfig}
          />
        </div>
      </ErrorBoundary>
    </ToastContext.Provider>
  )
}

export default App
