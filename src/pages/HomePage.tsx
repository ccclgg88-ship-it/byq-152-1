import { useState } from 'react'
import { usePetStore } from '@/store/usePetStore'
import MoodRing from '@/components/MoodRing'
import { useToast } from '@/hooks/useToast'
import { getRelativeTime } from '@/utils/date'
import { getExpProgress, getNextLevelExp, getMoodName, getSpeciesName, getSpeciesEmoji } from '@/utils/pet'
import { Utensils, Hand, Map, Moon, Sparkles, Flame, Clock, Award, Image, ChevronRight, ListTodo, Gift } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { InteractionType } from '@/types'
import { ACHIEVEMENT_LIST, STICKER_LIST } from '@/data/species'

export default function HomePage() {
  const { getMainPet, interact, getTodayStats, hasData, pets, getRecentAchievements, getRecentStickers, hasNewItems, getTodayTasksSummary } = usePetStore()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isInteracting, setIsInteracting] = useState<string | null>(null)

  const mainPet = getMainPet()
  const todayStats = getTodayStats()
  const taskSummary = getTodayTasksSummary()

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

      {taskSummary.total > 0 && (
        <button
          onClick={() => navigate('/tasks')}
          className="w-full mb-8 pet-card p-5 text-left transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
          style={{
            background: taskSummary.canClaimTreasure
              ? 'linear-gradient(135deg, #FEF3C7 0%, #FECACA 50%, #DDD6FE 100%)'
              : undefined,
          }}
        >
          {taskSummary.canClaimTreasure && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold shadow-md animate-pulse-slow flex items-center gap-1">
              <Gift size={12} />
              宝箱可领取
            </div>
          )}

          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                taskSummary.canClaimTreasure ? 'bg-gradient-to-br from-yellow-400 to-orange-400' : 'bg-gradient-to-br from-purple-400 to-pink-400'
              }`}
            >
              <ListTodo className="text-white" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-gray-800 dark:text-gray-100">
                  今日任务进度
                </p>
                <span className="text-sm text-purple-600 dark:text-purple-300 font-semibold">
                  {taskSummary.completed}/{taskSummary.total} 已完成
                </span>
                {taskSummary.streak > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 font-medium">
                    🔥 连胜 {taskSummary.streak} 天
                  </span>
                )}
              </div>
              <div className="w-full max-w-md bg-gray-200/70 dark:bg-gray-700/70 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    taskSummary.canClaimTreasure
                      ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 animate-pulse-slow'
                      : 'bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400'
                  }`}
                  style={{
                    width: `${taskSummary.total > 0 ? (taskSummary.completed / taskSummary.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <ChevronRight size={22} className="text-gray-400 flex-shrink-0" />
          </div>
        </button>
      )}

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

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {(() => {
          const recentAchievements = getRecentAchievements(3)
          const newItems = hasNewItems()
          return (
            <button
              onClick={() => navigate('/collection')}
              className="pet-card p-5 text-left transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-md">
                    <Award className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1">
                      成就勋章
                      {newItems.achievements && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      已解锁 {recentAchievements.length} 个
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
              <div className="flex gap-2">
                {recentAchievements.length > 0 ? (
                  recentAchievements.map((a) => {
                    const config = ACHIEVEMENT_LIST.find((c) => c.id === a.id)
                    return (
                      <div
                        key={a.id}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${config?.color || '#9CA3AF'}60, ${config?.color || '#9CA3AF'}30)`,
                        }}
                        title={config?.name}
                      >
                        {config?.icon || '🏆'}
                      </div>
                    )
                  })
                ) : (
                  <div className="flex-1 text-center py-2 text-sm text-gray-400 dark:text-gray-500">
                    还未解锁成就，快去探索吧！
                  </div>
                )}
              </div>
            </button>
          )
        })()}

        {(() => {
          const recentStickers = getRecentStickers(4)
          const newItems = hasNewItems()
          return (
            <button
              onClick={() => navigate('/collection?tab=sticker')}
              className="pet-card p-5 text-left transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-md">
                    <Image className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1">
                      冒险贴纸
                      {newItems.stickers && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      已收集 {recentStickers.length} 张
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
              <div className="flex gap-2">
                {recentStickers.length > 0 ? (
                  recentStickers.map((s) => {
                    const config = STICKER_LIST.find((c) => c.id === s.id)
                    return (
                      <div
                        key={s.id + s.obtainedAt}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gray-100 dark:bg-gray-700 shadow-sm"
                        title={config?.name}
                      >
                        {config?.emoji || '✨'}
                      </div>
                    )
                  })
                ) : (
                  <div className="flex-1 text-center py-2 text-sm text-gray-400 dark:text-gray-500">
                    还没有贴纸，带宠物去冒险吧！
                  </div>
                )}
              </div>
            </button>
          )
        })()}
      </div>
    </div>
  )
}
