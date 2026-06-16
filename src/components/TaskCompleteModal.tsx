import { useEffect } from 'react'
import { X, Gift, Sparkles } from 'lucide-react'
import { DailyTaskConfig } from '@/types'

interface TaskCompleteModalProps {
  isOpen: boolean
  onClose: () => void
  task: DailyTaskConfig | null
  taskProgress?: { current: number; target: number }
}

export default function TaskCompleteModal({
  isOpen,
  onClose,
  task,
  taskProgress,
}: TaskCompleteModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !task) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-br from-green-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-green-900/50 dark:to-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors text-gray-500 dark:text-gray-400"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles
                className="absolute -top-2 -left-2 text-green-400 animate-pulse"
                size={20}
              />
              <Sparkles
                className="absolute -top-1 -right-3 text-blue-400 animate-pulse"
                size={18}
                style={{ animationDelay: '0.2s' }}
              />
              <Sparkles
                className="absolute -bottom-1 -right-1 text-yellow-400 animate-pulse"
                size={16}
                style={{ animationDelay: '0.4s' }}
              />
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-lg animate-wiggle"
                style={{
                  background: `linear-gradient(135deg, ${task.color}80, ${task.color}40)`,
                  boxShadow: `0 0 40px ${task.color}60`,
                }}
              >
                {task.icon}
              </div>
            </div>
          </div>

          <div className="mb-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-green-400 to-emerald-400 shadow-md">
              ✅ 任务完成
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {task.name}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {task.description}
          </p>

          <div className="pet-card p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">完成进度</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {taskProgress?.target || task.target} / {taskProgress?.target || task.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-400"
                style={{ width: '100%' }}
              />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center gap-2">
              <Gift size={18} className="text-purple-500" />
              <span className="font-semibold text-purple-700 dark:text-purple-300">
                {task.reward.description}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="pet-button-primary w-full py-3 text-base"
          >
            太棒了！继续加油 ✨
          </button>
        </div>
      </div>
    </div>
  )
}
