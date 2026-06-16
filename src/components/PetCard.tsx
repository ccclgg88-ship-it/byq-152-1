import { useState } from 'react'
import { Pet } from '@/types'
import { getMoodEmoji, getMoodName, getExpProgress, getNextLevelExp, getSpeciesName, getSpeciesEmoji } from '@/utils/pet'
import ContextMenu from './ContextMenu'
import { Star, Edit, TrendingUp, Crown } from 'lucide-react'

interface PetCardProps {
  pet: Pet
  onSetMain?: () => void
  onEditName?: () => void
  onViewGrowth?: () => void
  onClick?: () => void
}

export default function PetCard({ pet, onSetMain, onEditName, onViewGrowth, onClick }: PetCardProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const expProgress = getExpProgress(pet.exp)
  const nextLevelExp = getNextLevelExp()
  const expPercent = (expProgress / nextLevelExp) * 100

  const menuItems = [
    {
      label: '设为主宠物',
      icon: <Star size={16} />,
      onClick: () => onSetMain?.(),
    },
    {
      label: '编辑昵称',
      icon: <Edit size={16} />,
      onClick: () => onEditName?.(),
    },
    {
      label: '查看成长曲线',
      icon: <TrendingUp size={16} />,
      onClick: () => onViewGrowth?.(),
    },
  ]

  return (
    <>
      <div
        className="pet-card p-5 cursor-pointer relative group"
        onContextMenu={handleContextMenu}
        onClick={onClick}
      >
        {pet.isMain && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full p-1.5 shadow-lg">
              <Crown size={14} className="text-white" />
            </div>
          </div>
        )}

        <div
          className="w-full aspect-square rounded-3xl flex items-center justify-center mb-4 relative overflow-hidden"
          style={{ backgroundColor: pet.color + '30' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
          <span className="text-6xl relative z-10 group-hover:scale-110 transition-transform duration-300">
            {pet.emoji}
          </span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">{pet.name}</h3>
          <span className="text-2xl">{getMoodEmoji(pet.mood)}</span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {getSpeciesEmoji(pet.species)} {getSpeciesName(pet.species)}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Lv.{pet.level} · {getMoodName(pet.mood)}
        </p>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-500"
            style={{ width: `${expPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          EXP: {expProgress}/{nextLevelExp}
        </p>

        <div className="flex flex-wrap gap-1 mt-3">
          {pet.personality.slice(0, 2).map((p, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={menuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  )
}
