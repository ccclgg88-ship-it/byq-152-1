import { useState } from 'react'
import { usePetStore } from '@/store/usePetStore'
import MoodRing from '@/components/MoodRing'
import { useToast } from '@/hooks/useToast'
import { getRelativeTime } from '@/utils/date'
import { getExpProgress, getNextLevelExp, getMoodName, getSpeciesName, getSpeciesEmoji } from '@/utils/pet'
import { Utensils, Hand, Map, Moon, Sparkles, Flame, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { InteractionType } from '@/types'

export default function HomePage() {
  const { getMainPet, interact, getTodayStats, hasData, pets } = usePetStore()
  const { showToast } = useToast()
  const [isInteracting, setIsInteracting] = useState<string | null>(null)

  const mainPet = getMainPet()
  const todayStats = getTodayStats()

  const handleInteract = async (type: InteractionType) => {
    if (!mainPet || isInteracting) return

    setIsInteracting(type)
    setTimeout(() => {
      const record = interact(mainPet.id, type)
      if (record) {
        showToast(`${mainPet.name} ${record.description}！心情+${record.moodChange}`, 'success')
      }
      setIsInteracting(null)
    }, 500)
  }

  if (!hasData || !mainPet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-8xl mb-6 animate-bounce-soft">🐾</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          欢迎来到圆嘟嘟宠物世界
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          你还没有领养任何宠物，快去领养一只属于你的圆嘟嘟小伙伴吧！
        </p>
        <Link
          to="/pets"
          className="pet-button-primary px-8 py-4 text-lg"
        >
          开始领养 ✨
        </Link>
      </div>
    )
  }

  const expProgress = getExpProgress(mainPet.exp)
  const nextLevelExp = getNextLevelExp()
  const expPercent = (expProgress / nextLevelExp) * 100

  const quickActions = [
    { type: 'feed' as InteractionType, icon: Utensils, label: '喂食', color: 'from-orange-400 to-red-400' },
    { type: 'pet' as InteractionType, icon: Hand, label: '抚摸', color: 'from-pink-400 to-rose-400' },
    { type: 'adventure' as InteractionType, icon: Map, label: '冒险', color: 'from-green-400 to-teal-400' },
    { type: 'bedtime' as InteractionType, icon: Moon, label: '睡前模式', color: 'from-purple-400 to-indigo-400' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
          你好呀！👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          今天是和 {mainPet.name} 相伴的美好一天
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="pet-card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">宠物数量</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{pets.length}</p>
          </div>
        </div>
        <div className="pet-card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
            <span className="text-white text-lg">❤️</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">主宠等级</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">Lv.{mainPet.level}</p>
          </div>
        </div>
        <div className="pet-card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
            <Flame className="text-white" size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">连续签到</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{todayStats.streak} 天</p>
          </div>
        </div>
        <div className="pet-card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
            <Clock className="text-white" size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">今日陪伴</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{todayStats.minutes} 分</p>
          </div>
        </div>
      </div>

      <div className="pet-card p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div
              className={`w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center ${
                isInteracting ? 'animate-wiggle' : 'animate-float'
              }`}
              style={{
                background: `radial-gradient(circle at 30% 30%, ${mainPet.color}80, ${mainPet.color}40)`,
                boxShadow: `0 0 60px ${mainPet.color}40`,
              }}
            >
              <span className="text-7xl md:text-8xl">{mainPet.emoji}</span>
            </div>
            {mainPet.isMain && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full px-3 py-1 text-white text-xs font-bold shadow-lg">
                👑 主宠
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
              {mainPet.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {getSpeciesEmoji(mainPet.species)} {getSpeciesName(mainPet.species)}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {getMoodName(mainPet.mood)} · Lv.{mainPet.level}
            </p>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 dark:text-gray-400">经验值</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {expProgress} / {nextLevelExp}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-700"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {mainPet.personality.map((p, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ backgroundColor: mainPet.color + '30', color: mainPet.color }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <MoodRing
              moodValue={mainPet.moodValue}
              mood={mainPet.mood}
              size={160}
              strokeWidth={14}
              lastInteraction={getRelativeTime(mainPet.lastInteractionAt)}
              lastInteractionReason="上次互动"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
          快捷互动
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            const isActive = isInteracting === action.type
            return (
              <button
                key={action.type}
                onClick={() => handleInteract(action.type)}
                disabled={!!isInteracting}
                className={`pet-card p-6 flex flex-col items-center gap-3 transition-all duration-300 ${
                  isActive ? 'scale-95' : 'hover:-translate-y-1'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg transition-transform duration-300 ${
                    isActive ? 'scale-90' : 'hover:scale-110'
                  }`}
                >
                  <Icon className="text-white" size={28} />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {action.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
