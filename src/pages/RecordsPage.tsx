import { useState, useEffect } from 'react'
import { usePetStore } from '@/store/usePetStore'
import { useToast } from '@/hooks/useToast'
import { SPECIES_LIST, INTERACTION_CONFIG } from '@/data/species'
import { formatDateTime, getRelativeTime } from '@/utils/date'
import { getSpeciesName, getSpeciesEmoji } from '@/utils/pet'
import { PetSpecies, InteractionType, InteractionRecord } from '@/types'
import { Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react'

export default function RecordsPage() {
  const { getFilteredRecords, getPetById, hasData } = usePetStore()
  const { showToast } = useToast()

  const [speciesFilter, setSpeciesFilter] = useState<PetSpecies | ''>('')
  const [typeFilter, setTypeFilter] = useState<InteractionType | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const records = getFilteredRecords({
    species: speciesFilter || undefined,
    type: typeFilter || undefined,
    search: searchQuery || undefined,
  })

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const clearFilters = () => {
    setSpeciesFilter('')
    setTypeFilter('')
    setSearchQuery('')
  }

  const hasActiveFilters = speciesFilter || typeFilter || searchQuery

  const getTypeIcon = (type: InteractionType) => {
    return INTERACTION_CONFIG[type]?.emoji || '✨'
  }

  const getTypeName = (type: InteractionType) => {
    return INTERACTION_CONFIG[type]?.name || type
  }

  const getTypeColor = (type: InteractionType): string => {
    const colors: Record<InteractionType, string> = {
      feed: 'from-orange-400 to-red-400',
      pet: 'from-pink-400 to-rose-400',
      adventure: 'from-green-400 to-teal-400',
      bedtime: 'from-purple-400 to-indigo-400',
      play: 'from-blue-400 to-cyan-400',
    }
    return colors[type] || 'from-gray-400 to-gray-500'
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            互动记录
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            共 {records.length} 条记录
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`pet-button-secondary px-4 py-2 flex items-center gap-2 sm:hidden ${
            showFilters ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700' : ''
          }`}
        >
          <Filter size={18} />
          筛选
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          )}
        </button>
      </div>

      <div className={`${showFilters ? 'block' : 'hidden'} sm:block mb-6`}>
        <div className="pet-card p-4 space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索宠物昵称或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                宠物品种
              </label>
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value as PetSpecies | '')}
                className="input-field"
              >
                <option value="">全部品种</option>
                {SPECIES_LIST.map((species) => (
                  <option key={species.id} value={species.id}>
                    {species.emoji} {species.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                互动类型
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as InteractionType | '')}
                className="input-field"
              >
                <option value="">全部类型</option>
                {Object.entries(INTERACTION_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.emoji} {config.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <X size={14} />
                清除筛选
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="pet-card p-4 flex items-center gap-4">
              <div className="skeleton h-12 w-12 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : !hasData || records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-7xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {hasActiveFilters ? '没有找到匹配的记录' : '还没有互动记录'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            {hasActiveFilters
              ? '试试调整筛选条件，或清除筛选查看全部记录'
              : '快去和你的宠物互动吧，每一次互动都会记录在这里！'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="pet-button-primary px-6 py-3">
              清除筛选
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => {
            const pet = getPetById(record.petId)
            const isExpanded = expandedId === record.id
            const hasDetails = record.details && Object.keys(record.details).length > 0

            return (
              <div
                key={record.id}
                className="pet-card overflow-hidden cursor-pointer transition-all duration-300"
                onClick={() => hasDetails && toggleExpand(record.id)}
              >
                <div className="p-4 flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getTypeColor(record.type)} flex items-center justify-center text-xl shadow-md flex-shrink-0`}
                  >
                    {getTypeIcon(record.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {record.description}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        {pet?.emoji} {pet?.name || '未知宠物'}
                      </span>
                      {pet && (
                        <span className="flex items-center gap-1">
                          {getSpeciesEmoji(pet.species)} {getSpeciesName(pet.species)}
                        </span>
                      )}
                      <span>·</span>
                      <span>{getRelativeTime(record.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-green-500">+{record.moodChange} 心情</p>
                      <p className="text-xs text-gray-400">+{record.expGain} 经验</p>
                    </div>
                    {hasDetails && (
                      <div className="text-gray-400">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && hasDetails && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="pt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        详情信息
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                        {Object.entries(record.details).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 dark:text-gray-400 capitalize">
                              {key === 'sticker' ? '获得贴纸' : key}:
                            </span>
                            <span className="text-gray-800 dark:text-gray-200 font-medium">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        发生时间：{formatDateTime(record.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
