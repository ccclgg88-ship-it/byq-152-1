import { getMoodName, getMoodEmoji } from '@/utils/pet'
import { PetMood } from '@/types'

interface MoodRingProps {
  moodValue: number
  mood: PetMood
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  lastInteraction?: string
  lastInteractionReason?: string
}

export default function MoodRing({
  moodValue,
  mood,
  size = 200,
  strokeWidth = 16,
  showLabel = true,
  lastInteraction,
  lastInteractionReason,
}: MoodRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (moodValue / 100) * circumference

  const gradientColors: Record<PetMood, string[]> = {
    happy: ['#FFB6C1', '#FF69B4'],
    calm: ['#87CEEB', '#4169E1'],
    playful: ['#FFD700', '#FFA500'],
    sleepy: ['#DDA0DD', '#9370DB'],
  }

  const colors = gradientColors[mood] || gradientColors.calm

  return (
    <div className="relative group" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={`mood-gradient-${mood}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#mood-gradient-${mood})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl mb-1 animate-bounce-soft">{getMoodEmoji(mood)}</span>
        {showLabel && (
          <>
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {getMoodName(mood)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {moodValue}/100
            </span>
          </>
        )}
      </div>

      {lastInteraction && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap bg-gray-800 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-xl pointer-events-none z-10">
          {lastInteractionReason && <p className="mb-1">{lastInteractionReason}</p>}
          <p className="text-gray-300">{lastInteraction}</p>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-700 rotate-45" />
        </div>
      )}
    </div>
  )
}
