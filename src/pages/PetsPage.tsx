import { useState, useEffect, useRef } from 'react'
import { usePetStore } from '@/store/usePetStore'
import PetCard from '@/components/PetCard'
import Modal from '@/components/Modal'
import { useToast } from '@/hooks/useToast'
import { SPECIES_LIST, STICKER_LIST } from '@/data/species'
import { validatePetName, getSpeciesName, getSpeciesEmoji } from '@/utils/pet'
import { PetSpecies, Pet } from '@/types'
import { Plus, Search, X, TrendingUp, Edit, Star, Image } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function PetsPage() {
  const { pets, adoptPet, setMainPet, updatePetName, getWeeklyMoodData, hasData, getPetStickers } = usePetStore()
  const { showToast } = useToast()

  const [showAdoptModal, setShowAdoptModal] = useState(false)
  const [showGrowthModal, setShowGrowthModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies | null>(null)
  const [petName, setPetName] = useState('')
  const [editName, setEditName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredPets = pets.filter((pet) =>
    pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    SPECIES_LIST.find((s) => s.id === pet.species)?.name.includes(searchQuery)
  )

  const handleAdopt = () => {
    if (!selectedSpecies) {
      showToast('请先选择宠物品种', 'warning')
      return
    }
    const validation = validatePetName(petName)
    if (!validation.valid) {
      showToast(validation.message || '昵称无效', 'error')
      return
    }

    const success = adoptPet(selectedSpecies, petName)
    if (success) {
      const speciesName = SPECIES_LIST.find((s) => s.id === selectedSpecies)?.name
      showToast(`成功领养了一只${speciesName}：${petName}！`, 'success')
      setShowAdoptModal(false)
      setPetName('')
      setSelectedSpecies(null)
    } else {
      showToast('领养失败，请重试', 'error')
    }
  }

  const handleSetMain = (pet: Pet) => {
    setMainPet(pet.id)
    showToast(`${pet.name} 已设为主宠物`, 'success')
  }

  const handleEditName = (pet: Pet) => {
    setSelectedPet(pet)
    setEditName(pet.name)
    setShowEditModal(true)
  }

  const handleSaveName = () => {
    if (!selectedPet) return
    const validation = validatePetName(editName)
    if (!validation.valid) {
      showToast(validation.message || '昵称无效', 'error')
      return
    }
    const success = updatePetName(selectedPet.id, editName)
    if (success) {
      showToast('昵称修改成功', 'success')
      setShowEditModal(false)
    } else {
      showToast('修改失败，请重试', 'error')
    }
  }

  const handleViewGrowth = (pet: Pet) => {
    setSelectedPet(pet)
    setShowGrowthModal(true)
  }

  useEffect(() => {
    if (showAdoptModal && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100)
    }
  }, [showAdoptModal])

  const weeklyData = selectedPet ? getWeeklyMoodData(selectedPet.id) : null

  const chartData = weeklyData
    ? {
        labels: weeklyData.labels,
        datasets: [
          {
            label: '心情指数',
            data: weeklyData.moodData,
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 105, 180, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#FF69B4',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y',
          },
          {
            label: '陪伴时长(分钟)',
            data: weeklyData.timeData,
            borderColor: '#87CEEB',
            backgroundColor: 'rgba(135, 206, 235, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#87CEEB',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y1',
          },
        ],
      }
    : null

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'inherit',
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 12,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(128, 128, 128, 0.1)',
        },
        ticks: {
          color: 'inherit',
        },
        title: {
          display: true,
          text: '心情指数',
          color: 'inherit',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'inherit',
        },
        title: {
          display: true,
          text: '陪伴时长',
          color: 'inherit',
        },
      },
      x: {
        grid: {
          color: 'rgba(128, 128, 128, 0.1)',
        },
        ticks: {
          color: 'inherit',
        },
      },
    },
  }

  const hasDataForChart = weeklyData && (weeklyData.moodData.some(v => v > 0) || weeklyData.timeData.some(v => v > 0))

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            宠物档案
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            你有 {pets.length} 只圆嘟嘟小伙伴
          </p>
        </div>
        <button
          onClick={() => setShowAdoptModal(true)}
          className="pet-button-primary px-5 py-3 flex items-center gap-2"
        >
          <Plus size={20} />
          领养新宠物
        </button>
      </div>

      {hasData && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索宠物昵称或品种..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11"
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="pet-card p-5">
              <div className="skeleton h-32 w-full mb-4 rounded-3xl" />
              <div className="skeleton h-5 w-24 mb-2" />
              <div className="skeleton h-4 w-20 mb-3" />
              <div className="skeleton h-2 w-full mb-1" />
              <div className="skeleton h-3 w-16" />
            </div>
          ))}
        </div>
      ) : !hasData || pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-7xl mb-4 animate-bounce-soft">🐾</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            还没有宠物档案
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            点击上方按钮，领养一只属于你的圆嘟嘟小伙伴吧！
          </p>
          <button
            onClick={() => setShowAdoptModal(true)}
            className="pet-button-primary px-6 py-3"
          >
            立即领养 ✨
          </button>
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-500 dark:text-gray-400">没有找到匹配的宠物</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onSetMain={() => handleSetMain(pet)}
              onEditName={() => handleEditName(pet)}
              onViewGrowth={() => handleViewGrowth(pet)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showAdoptModal}
        onClose={() => {
          setShowAdoptModal(false)
          setPetName('')
          setSelectedSpecies(null)
        }}
        title="领养新宠物"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选择品种
            </label>
            <div className="grid grid-cols-3 gap-3">
              {SPECIES_LIST.map((species) => (
                <button
                  key={species.id}
                  onClick={() => setSelectedSpecies(species.id)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selectedSpecies === species.id
                      ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/30 scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700'
                  }`}
                >
                  <div
                    className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-2"
                    style={{ backgroundColor: species.color + '30' }}
                  >
                    <span className="text-3xl">{species.emoji}</span>
                  </div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                    {species.name}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    {species.personality.map((p, i) => (
                      <span
                        key={i}
                        className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              给它取个名字
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="输入昵称（最多12个字符）"
              className="input-field"
              maxLength={12}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowAdoptModal(false)
                setPetName('')
                setSelectedSpecies(null)
              }}
              className="pet-button-secondary flex-1 py-3"
            >
              取消
            </button>
            <button
              onClick={handleAdopt}
              className="pet-button-primary flex-1 py-3"
            >
              确认领养
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedPet(null)
        }}
        title="编辑昵称"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {selectedPet && (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: selectedPet.color + '30' }}
                >
                  <span className="text-3xl">{selectedPet.emoji}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">当前昵称</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">{selectedPet.name}</p>
                </div>
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              新昵称
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="输入新昵称"
              className="input-field"
              maxLength={12}
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowEditModal(false)
                setSelectedPet(null)
              }}
              className="pet-button-secondary flex-1 py-3"
            >
              取消
            </button>
            <button
              onClick={handleSaveName}
              className="pet-button-primary flex-1 py-3"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showGrowthModal}
        onClose={() => {
          setShowGrowthModal(false)
          setSelectedPet(null)
        }}
        title={`${selectedPet?.name || ''} 的成长曲线`}
        size="lg"
      >
        {selectedPet && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: selectedPet.color + '30' }}
              >
                <span className="text-3xl">{selectedPet.emoji}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 dark:text-gray-100">{selectedPet.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">
                  {getSpeciesEmoji(selectedPet.species)} {getSpeciesName(selectedPet.species)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Lv.{selectedPet.level} · 经验 {selectedPet.exp}
                </p>
              </div>
              <div className="pet-card p-3 flex items-center gap-2">
                <Image size={18} className="text-purple-500" />
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">贴纸</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">
                    {getPetStickers(selectedPet.id).length} 张
                  </p>
                </div>
              </div>
            </div>

            {getPetStickers(selectedPet.id).length > 0 && (
              <div className="pet-card p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">已收集贴纸</p>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const petStickers = getPetStickers(selectedPet.id)
                    const uniqueStickerIds = [...new Set(petStickers.map((s) => s.id))]
                    return uniqueStickerIds.slice(0, 8).map((stickerId) => {
                      const config = STICKER_LIST.find((s) => s.id === stickerId)
                      return (
                        <div
                          key={stickerId}
                          className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl"
                          title={config?.name || ''}
                        >
                          {config?.emoji || '✨'}
                        </div>
                      )
                    })
                  })()}
                  {(() => {
                    const petStickers = getPetStickers(selectedPet.id)
                    const uniqueCount = new Set(petStickers.map((s) => s.id)).size
                    if (uniqueCount > 8) {
                      return (
                        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                          +{uniqueCount - 8}
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>
            )}

            {hasDataForChart ? (
              <div className="h-64 md:h-80">
                <Line data={chartData!} options={chartOptions as any} />
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-3">📊</div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">暂无成长数据</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  多和 {selectedPet.name} 互动，这里会显示近7日的心情与陪伴时长
                </p>
              </div>
            )}

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              数据为近7日统计，每日心情为当日均值
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
