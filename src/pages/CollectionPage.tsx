import { useState, useEffect, useMemo } from 'react'
import { usePetStore } from '@/store/usePetStore'
import Modal from '@/components/Modal'
import {
  ACHIEVEMENT_LIST,
  STICKER_LIST,
  ACHIEVEMENT_CATEGORY_CONFIG,
  STICKER_RARITY_CONFIG,
} from '@/data/species'
import {
  AchievementCategory,
  AchievementConfig,
  StickerConfig,
  Sticker,
} from '@/types'
import { formatDateTime } from '@/utils/date'
import { getSpeciesEmoji, getSpeciesName } from '@/utils/pet'
import {
  BookOpen,
  Image,
  Award,
  Filter,
  ChevronDown,
  Sparkles,
  Star,
} from 'lucide-react'

type TabType = 'achievement' | 'sticker'
type AchievementFilter = 'all' | 'unlocked' | 'locked'

export default function CollectionPage() {
  const {
    achievements,
    stickers,
    getAchievementProgress,
    getPetById,
    getStickersLast7Days,
    markAchievementViewed,
    markStickerViewed,
    hasNewItems,
  } = usePetStore()

  const [activeTab, setActiveTab] = useState<TabType>('achievement')
  const [achievementFilter, setAchievementFilter] = useState<AchievementFilter>('all')
  const [showStickerModal, setShowStickerModal] = useState(false)
  const [selectedSticker, setSelectedSticker] = useState<{
    config: StickerConfig
    sticker: Sticker | null
  } | null>(null)
  const [showAchievementModal, setShowAchievementModal] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementConfig | null>(null)

  const unlockedAchievementIds = useMemo(
    () => new Set(achievements.map((a) => a.id)),
    [achievements]
  )
  const achievementUnlockRate = Math.round(
    (achievements.length / ACHIEVEMENT_LIST.length) * 100
  )

  const collectedStickerIds = useMemo(() => {
    const map = new Map<string, Sticker>()
    stickers.forEach((s) => {
      if (!map.has(s.id)) {
        map.set(s.id, s)
      }
    })
    return map
  }, [stickers])
  const stickerCollectRate = Math.round(
    (collectedStickerIds.size / STICKER_LIST.length) * 100
  )
  const stickersLast7Days = getStickersLast7Days()

  const filteredAchievements = useMemo(() => {
    return ACHIEVEMENT_LIST.filter((config) => {
      const unlocked = unlockedAchievementIds.has(config.id)
      if (achievementFilter === 'unlocked') return unlocked
      if (achievementFilter === 'locked') return !unlocked
      return true
    })
  }, [achievementFilter, unlockedAchievementIds])

  const achievementsByCategory = useMemo(() => {
    const grouped: Record<AchievementCategory, AchievementConfig[]> = {
      first: [],
      growth: [],
      companion: [],
      explore: [],
    }
    filteredAchievements.forEach((a) => {
      grouped[a.category].push(a)
    })
    return grouped
  }, [filteredAchievements])

  const handleViewAchievement = (config: AchievementConfig) => {
    setSelectedAchievement(config)
    setShowAchievementModal(true)
    if (unlockedAchievementIds.has(config.id)) {
      markAchievementViewed(config.id)
    }
  }

  const handleViewSticker = (config: StickerConfig) => {
    const sticker = collectedStickerIds.get(config.id) || null
    setSelectedSticker({ config, sticker })
    setShowStickerModal(true)
    if (sticker) {
      markStickerViewed(sticker.id)
    }
  }

  const newItems = hasNewItems()

  useEffect(() => {
    if (activeTab === 'achievement' && newItems.achievements) {
      const timer = setTimeout(() => {
        achievements.forEach((a) => {
          if (a.isNew) markAchievementViewed(a.id)
        })
      }, 2000)
      return () => clearTimeout(timer)
    }
    if (activeTab === 'sticker' && newItems.stickers) {
      const timer = setTimeout(() => {
        stickers.forEach((s) => {
          if (s.isNew) markStickerViewed(s.id)
        })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [activeTab])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
          图鉴收藏
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          收集成就勋章与冒险贴纸，记录你们的美好时光
        </p>
      </div>

      <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('achievement')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
            activeTab === 'achievement'
              ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 shadow-md'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Award size={18} />
          成就勋章
          {newItems.achievements && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('sticker')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
            activeTab === 'sticker'
              ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 shadow-md'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Image size={18} />
          冒险贴纸
          {newItems.stickers && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>
      </div>

      {activeTab === 'achievement' ? (
        <div>
          <div className="pet-card p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-md">
                  <Award className="text-white" size={22} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">成就解锁率</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {achievements.length} / {ACHIEVEMENT_LIST.length}
                    <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
                      ({achievementUnlockRate}%)
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                  {[
                    { value: 'all' as AchievementFilter, label: '全部' },
                    { value: 'unlocked' as AchievementFilter, label: '已解锁' },
                    { value: 'locked' as AchievementFilter, label: '未解锁' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setAchievementFilter(item.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        achievementFilter === item.value
                          ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 transition-all duration-700"
                style={{ width: `${achievementUnlockRate}%` }}
              />
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(achievementsByCategory).map(([category, list]) => {
              if (list.length === 0) return null
              const categoryConfig = ACHIEVEMENT_CATEGORY_CONFIG[category as AchievementCategory]
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                      style={{ backgroundColor: categoryConfig.color + '30' }}
                    >
                      {categoryConfig.icon}
                    </span>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">
                      {categoryConfig.name}
                    </h3>
                    <span className="text-sm text-gray-400">
                      ({list.filter((a) => unlockedAchievementIds.has(a.id)).length}/{list.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {list.map((config) => {
                      const unlocked = unlockedAchievementIds.has(config.id)
                      const achievementData = achievements.find((a) => a.id === config.id)
                      const progress = getAchievementProgress(config.id)
                      const isNew = achievementData?.isNew

                      return (
                        <button
                          key={config.id}
                          onClick={() => handleViewAchievement(config)}
                          className={`pet-card p-4 text-left transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden ${
                            !unlocked ? 'opacity-70' : ''
                          }`}
                        >
                          {isNew && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-lg z-10" />
                          )}

                          <div className="flex items-start gap-3">
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md ${
                                unlocked ? '' : 'grayscale opacity-50'
                              }`}
                              style={{
                                background: unlocked
                                  ? `linear-gradient(135deg, ${config.color}80, ${config.color}40)`
                                  : 'linear-gradient(135deg, #9CA3AF40, #9CA3AF20)',
                              }}
                            >
                              {unlocked ? config.icon : '🔒'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`font-semibold mb-1 truncate ${
                                  unlocked
                                    ? 'text-gray-800 dark:text-gray-100'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                {config.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                                {config.description}
                              </p>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-500 ${
                                    unlocked
                                      ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {unlocked ? `已解锁 · ${formatDateTime(achievementData!.unlockedAt).split(' ')[0]}` : `${progress}%`}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div>
          <div className="pet-card p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-md">
                  <Image className="text-white" size={22} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">贴纸收集进度</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {collectedStickerIds.size} / {STICKER_LIST.length}
                    <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
                      ({stickerCollectRate}%)
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="pet-card p-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">近7日新增</p>
                    <p className="font-bold text-gray-800 dark:text-gray-100">
                      {stickersLast7Days} 张
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 transition-all duration-700"
                style={{ width: `${stickerCollectRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {STICKER_LIST.map((config) => {
              const sticker = collectedStickerIds.get(config.id)
              const collected = !!sticker
              const rarityConfig = STICKER_RARITY_CONFIG[config.rarity]
              const isNew = sticker?.isNew

              return (
                <button
                  key={config.id}
                  onClick={() => handleViewSticker(config)}
                  className={`pet-card p-3 flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-1 relative ${
                    !collected ? 'opacity-60' : ''
                  }`}
                  style={{
                    borderColor: collected ? rarityConfig.color + '60' : undefined,
                    borderWidth: collected ? '2px' : undefined,
                  }}
                >
                  {isNew && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-lg z-10" />
                  )}

                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                      collected ? '' : 'grayscale opacity-40'
                    }`}
                    style={{ backgroundColor: rarityConfig.bgColor }}
                  >
                    {collected ? config.emoji : '❓'}
                  </div>

                  <div className="text-center w-full">
                    <p
                      className={`text-xs font-medium truncate ${
                        collected
                          ? 'text-gray-800 dark:text-gray-100'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {collected ? config.name : '???'}
                    </p>
                    <span
                      className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: rarityConfig.color + '20',
                        color: rarityConfig.color,
                      }}
                    >
                      {rarityConfig.name}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <Modal
        isOpen={showAchievementModal}
        onClose={() => {
          setShowAchievementModal(false)
          setSelectedAchievement(null)
        }}
        title="成就详情"
      >
        {selectedAchievement && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${selectedAchievement.color}80, ${selectedAchievement.color}40)`,
                }}
              >
                {unlockedAchievementIds.has(selectedAchievement.id)
                  ? selectedAchievement.icon
                  : '🔒'}
              </div>
              <div>
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1"
                  style={{
                    backgroundColor:
                      ACHIEVEMENT_CATEGORY_CONFIG[selectedAchievement.category].color + '30',
                    color: ACHIEVEMENT_CATEGORY_CONFIG[selectedAchievement.category].color,
                  }}
                >
                  {ACHIEVEMENT_CATEGORY_CONFIG[selectedAchievement.category].icon}{' '}
                  {ACHIEVEMENT_CATEGORY_CONFIG[selectedAchievement.category].name}
                </span>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {selectedAchievement.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedAchievement.description}
                </p>
              </div>
            </div>

            <div className="pet-card p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">完成进度</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {getAchievementProgress(selectedAchievement.id)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-500"
                  style={{ width: `${getAchievementProgress(selectedAchievement.id)}%` }}
                />
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p className="mb-1">解锁条件：</p>
              <p className="pet-card p-3 text-gray-700 dark:text-gray-300">
                {(() => {
                  const c = selectedAchievement.condition
                  switch (c.type) {
                    case 'adopt':
                      return `领养 ${c.target} 只宠物`
                    case 'species':
                      return `领养 ${c.target} 种不同的宠物`
                    case 'level':
                      return `任意宠物达到 ${c.target} 级`
                    case 'interact':
                      return c.interactionType
                        ? `${INTERACTION_CONFIG_DISPLAY[c.interactionType] || c.interactionType} ${c.target} 次`
                        : `累计互动 ${c.target} 次`
                    case 'adventure':
                      return `完成 ${c.target} 次冒险`
                    case 'streak':
                      return `连续签到 ${c.target} 天`
                    case 'mood':
                      return `让宠物心情值达到 ${c.target}`
                    case 'time':
                      return `累计陪伴 ${c.target} 分钟`
                    default:
                      return '完成特定条件'
                  }
                })()}
              </p>
            </div>

            {unlockedAchievementIds.has(selectedAchievement.id) && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Star size={16} fill="currentColor" />
                已于 {formatDateTime(achievements.find((a) => a.id === selectedAchievement.id)!.unlockedAt)} 解锁
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showStickerModal}
        onClose={() => {
          setShowStickerModal(false)
          setSelectedSticker(null)
        }}
        title="贴纸详情"
      >
        {selectedSticker && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg"
                style={{
                  backgroundColor: STICKER_RARITY_CONFIG[selectedSticker.config.rarity].bgColor,
                  borderWidth: '2px',
                  borderColor: STICKER_RARITY_CONFIG[selectedSticker.config.rarity].color,
                }}
              >
                {selectedSticker.sticker ? selectedSticker.config.emoji : '❓'}
              </div>
              <div>
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1"
                  style={{
                    backgroundColor:
                      STICKER_RARITY_CONFIG[selectedSticker.config.rarity].color + '20',
                    color: STICKER_RARITY_CONFIG[selectedSticker.config.rarity].color,
                  }}
                >
                  {STICKER_RARITY_CONFIG[selectedSticker.config.rarity].name}
                </span>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {selectedSticker.sticker ? selectedSticker.config.name : '???'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedSticker.sticker
                    ? selectedSticker.config.description
                    : '通过冒险探索收集此贴纸'}
                </p>
              </div>
            </div>

            {selectedSticker.sticker ? (
              <div className="pet-card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">获得时间：</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {formatDateTime(selectedSticker.sticker.obtainedAt)}
                  </span>
                </div>

                {(() => {
                  const pet = getPetById(selectedSticker.sticker.petId)
                  if (!pet) return null
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{pet.emoji}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">关联宠物：</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {getSpeciesEmoji(pet.species)} {getSpeciesName(pet.species)} · {pet.name}
                      </span>
                    </div>
                  )
                })()}

                {selectedSticker.sticker.recordId && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📝</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">关联记录：</span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      第 {selectedSticker.sticker.recordId.slice(0, 8)} 号冒险
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="pet-card p-4 text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-gray-600 dark:text-gray-300 mb-1">还未收集到这张贴纸</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  带宠物去冒险，有机会获得哦！
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

const INTERACTION_CONFIG_DISPLAY: Record<string, string> = {
  feed: '喂食',
  pet: '抚摸',
  adventure: '冒险',
  bedtime: '睡前故事',
  play: '玩耍',
}
