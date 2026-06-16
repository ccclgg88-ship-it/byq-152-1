import { SpeciesConfig } from '@/types'

export const SPECIES_LIST: SpeciesConfig[] = [
  {
    id: 'cat',
    name: '小猫',
    emoji: '🐱',
    color: '#FFB6C1',
    personality: ['傲娇', '爱干净'],
  },
  {
    id: 'dog',
    name: '小狗',
    emoji: '🐶',
    color: '#87CEEB',
    personality: ['忠诚', '活泼'],
  },
  {
    id: 'pig',
    name: '小猪',
    emoji: '🐷',
    color: '#FFC0CB',
    personality: ['贪吃', '憨厚'],
  },
  {
    id: 'rabbit',
    name: '小兔',
    emoji: '🐰',
    color: '#DDA0DD',
    personality: ['胆小', '可爱'],
  },
  {
    id: 'bear',
    name: '小熊',
    emoji: '🐻',
    color: '#DEB887',
    personality: ['温暖', '可靠'],
  },
  {
    id: 'fox',
    name: '小狐',
    emoji: '🦊',
    color: '#FFA07A',
    personality: ['聪明', '狡黠'],
  },
]

export const MOOD_CONFIG = {
  happy: { emoji: '😊', name: '开心', minValue: 70 },
  calm: { emoji: '😌', name: '平静', minValue: 40 },
  playful: { emoji: '🎾', name: '想玩', minValue: 50 },
  sleepy: { emoji: '😴', name: '困倦', minValue: 0 },
}

export const INTERACTION_CONFIG = {
  feed: { name: '喂食', emoji: '🍖', moodChange: 15, expGain: 10 },
  pet: { name: '抚摸', emoji: '🤚', moodChange: 10, expGain: 5 },
  adventure: { name: '冒险', emoji: '🗺️', moodChange: 20, expGain: 25 },
  bedtime: { name: '睡前故事', emoji: '🌙', moodChange: 5, expGain: 8 },
  play: { name: '玩耍', emoji: '🎮', moodChange: 12, expGain: 12 },
}

export const ADVENTURE_STICKERS = [
  '🏆 勇敢勋章',
  '⭐ 幸运星',
  '🎀 彩虹丝带',
  '💎 闪亮宝石',
  '🌸 花朵徽章',
  '🚀 冒险家徽章',
]

export const EXP_PER_LEVEL = 100
