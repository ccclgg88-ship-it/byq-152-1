import { useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { AchievementConfig } from '@/types'

interface AchievementUnlockModalProps {
  isOpen: boolean
  onClose: () => void
  achievement: AchievementConfig | null
}

export default function AchievementUnlockModal({
  isOpen,
  onClose,
  achievement,
}: AchievementUnlockModalProps) {
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

  if (!isOpen || !achievement) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:via-purple-900/50 dark:to-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-bounce-in"
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
                className="absolute -top-2 -left-2 text-yellow-400 animate-pulse"
                size={24}
              />
              <Sparkles
                className="absolute -top-1 -right-3 text-pink-400 animate-pulse"
                size={20}
                style={{ animationDelay: '0.2s' }}
              />
              <Sparkles
                className="absolute -bottom-1 -right-1 text-purple-400 animate-pulse"
                size={18}
                style={{ animationDelay: '0.4s' }}
              />
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-lg animate-wiggle"
                style={{
                  background: `linear-gradient(135deg, ${achievement.color}80, ${achievement.color}40)`,
                  boxShadow: `0 0 40px ${achievement.color}60`,
                }}
              >
                {achievement.icon}
              </div>
            </div>
          </div>

          <div className="mb-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-400 shadow-md">
              🎉 成就解锁
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {achievement.name}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {achievement.description}
          </p>

          <button
            onClick={onClose}
            className="pet-button-primary w-full py-3 text-base"
          >
            太棒了！✨
          </button>
        </div>
      </div>
    </div>
  )
}
