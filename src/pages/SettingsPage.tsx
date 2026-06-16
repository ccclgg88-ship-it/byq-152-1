import { useState, useRef } from 'react'
import { usePetStore } from '@/store/usePetStore'
import { useToast } from '@/hooks/useToast'
import { UserSettings } from '@/types'
import Modal from '@/components/Modal'
import { Sun, Moon, Type, Download, Upload, Trash2, Info, Check, AlertTriangle } from 'lucide-react'

interface SettingsItem {
  label: string
  description: string
  content?: React.ReactNode
  value?: string
  danger?: boolean
}

interface SettingsSection {
  title: string
  icon: string
  items: SettingsItem[]
}

export default function SettingsPage() {
  const { settings, updateSettings, exportData, importData, clearAllData, pets, records } = usePetStore()
  const { showToast } = useToast()

  const [showClearModal, setShowClearModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleThemeChange = (theme: UserSettings['theme']) => {
    updateSettings({ theme })
    showToast(`已切换到${theme === 'dark' ? '深色' : '浅色'}模式`, 'success')
  }

  const handleFontSizeChange = (fontSize: UserSettings['fontSize']) => {
    updateSettings({ fontSize })
    const sizeNames = { small: '小', medium: '中', large: '大' }
    showToast(`字体大小已设为${sizeNames[fontSize]}`, 'success')
  }

  const handleExport = () => {
    try {
      const json = exportData()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `圆嘟嘟宠物档案_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('数据导出成功！', 'success')
    } catch (error) {
      showToast('导出失败，请重试', 'error')
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string
        const success = importData(json)
        if (success) {
          showToast('数据导入成功！', 'success')
        } else {
          showToast('导入失败：数据格式不正确', 'error')
        }
      } catch (error) {
        showToast('导入失败：文件解析错误', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClearData = () => {
    if (confirmText !== '确认删除') {
      showToast('请输入「确认删除」以继续', 'warning')
      return
    }
    clearAllData()
    setShowClearModal(false)
    setConfirmText('')
    showToast('所有数据已清除', 'success')
  }

  const settingsSections: SettingsSection[] = [
    {
      title: '外观设置',
      icon: '🎨',
      items: [
        {
          label: '主题模式',
          description: '选择浅色或深色主题',
          content: (
            <div className="flex gap-2">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  settings.theme === 'light'
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 font-medium'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Sun size={16} />
                浅色
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 font-medium'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Moon size={16} />
                深色
              </button>
            </div>
          ),
        },
        {
          label: '字体大小',
          description: '调整界面文字大小',
          content: (
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => {
                const sizeNames = { small: '小', medium: '中', large: '大' }
                const sizeIcons = { small: 'A', medium: 'A', large: 'A' }
                const fontSizes = { small: 'text-sm', medium: 'text-base', large: 'text-lg' }
                return (
                  <button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                      settings.fontSize === size
                        ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 font-medium'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Type size={size === 'small' ? 14 : size === 'medium' ? 16 : 18} />
                    <span className={fontSizes[size]}>{sizeNames[size]}</span>
                  </button>
                )
              })}
            </div>
          ),
        },
      ],
    },
    {
      title: '数据管理',
      icon: '💾',
      items: [
        {
          label: '导出数据',
          description: '将所有数据导出为 JSON 文件备份',
          content: (
            <button
              onClick={handleExport}
              className="pet-button-secondary px-4 py-2 flex items-center gap-2"
            >
              <Download size={18} />
              导出 JSON
            </button>
          ),
        },
        {
          label: '导入数据',
          description: '从 JSON 文件恢复数据（会覆盖现有数据）',
          content: (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="pet-button-secondary px-4 py-2 flex items-center gap-2"
              >
                <Upload size={18} />
                导入 JSON
              </button>
            </>
          ),
        },
        {
          label: '清除数据',
          description: '删除所有宠物档案、互动记录和设置',
          danger: true,
          content: (
            <button
              onClick={() => setShowClearModal(true)}
              className="pet-button-danger px-4 py-2 flex items-center gap-2"
            >
              <Trash2 size={18} />
              清除全部
            </button>
          ),
        },
      ],
    },
    {
      title: '关于',
      icon: 'ℹ️',
      items: [
        {
          label: '宠物数量',
          description: '当前已领养的宠物总数',
          value: `${pets.length} 只`,
        },
        {
          label: '互动记录',
          description: '累计互动次数',
          value: `${records.length} 次`,
        },
        {
          label: '连续签到',
          description: '保持每日打开应用',
          value: `${settings.streakDays} 天`,
        },
      ],
    },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          设置中心
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          个性化你的圆嘟嘟宠物体验
        </p>
      </div>

      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="pet-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <span className="text-2xl">{section.icon}</span>
              <h2 className="font-bold text-gray-800 dark:text-gray-100">{section.title}</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p
                      className={`font-medium ${
                        item.danger
                          ? 'text-red-500'
                          : 'text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>
                    {item.value && (
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-1">
                        {item.value}
                      </p>
                    )}
                  </div>
                  {item.content && <div className="flex-shrink-0">{item.content}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showClearModal}
        onClose={() => {
          setShowClearModal(false)
          setConfirmText('')
        }}
        title="确认清除数据"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">此操作不可撤销</p>
              <p className="text-sm text-red-600 dark:text-red-300">
                所有宠物档案、互动记录和个人设置都将被永久删除，请谨慎操作。
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              请输入「确认删除」以继续
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="确认删除"
              className="input-field"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowClearModal(false)
                setConfirmText('')
              }}
              className="pet-button-secondary flex-1 py-3"
            >
              取消
            </button>
            <button
              onClick={handleClearData}
              disabled={confirmText !== '确认删除'}
              className="pet-button-danger flex-1 py-3"
            >
              确认清除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
