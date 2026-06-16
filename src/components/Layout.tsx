import { NavLink, useLocation } from 'react-router-dom'
import { Home, PawPrint, Clock, Settings, BookOpen, ListTodo } from 'lucide-react'
import { usePetStore } from '@/store/usePetStore'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { getTodayStats: stats, hasNewItems, getTodayTasksSummary } = usePetStore()
  const todayStats = stats()
  const newItems = hasNewItems()
  const hasCollectionNew = newItems.achievements || newItems.stickers
  const taskSummary = getTodayTasksSummary()

  const navItems = [
    { path: '/', icon: Home, label: '首页概览' },
    { path: '/pets', icon: PawPrint, label: '宠物档案' },
    { path: '/records', icon: Clock, label: '互动记录' },
    {
      path: '/tasks',
      icon: ListTodo,
      label: '每日任务',
      badge: taskSummary.total > 0 ? `${taskSummary.completed}/${taskSummary.total}` : null,
      highlight: taskSummary.canClaimTreasure,
    },
    { path: '/collection', icon: BookOpen, label: '图鉴收藏', hasNew: hasCollectionNew },
    { path: '/settings', icon: Settings, label: '设置中心' },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 md:min-h-screen bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-b md:border-b-0 md:border-r border-gray-200/50 dark:border-gray-700/50">
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-2xl shadow-glow">
              🐾
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-800 dark:text-gray-100">圆嘟嘟宠物</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">宠物档案管理</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link relative ${isActive ? 'nav-link-active' : ''}`
                }
              >
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {item.badge && !item.hasNew && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.highlight
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white animate-pulse shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.hasNew && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-lg" />
                )}
                {item.highlight && !item.hasNew && !item.badge && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-lg" />
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden md:block p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="space-y-3">
            <div className="pet-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">连续签到</p>
                  <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                    {todayStats.streak} 天
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">今日陪伴</p>
                  <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                    {todayStats.minutes} 分钟
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">任务连胜</p>
                  <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                    {taskSummary.streak} 天
                  </p>
                </div>
              </div>
            </div>

            {taskSummary.total > 0 && (
              <div className="pet-card p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200/60 dark:border-purple-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">今日任务</span>
                  {taskSummary.canClaimTreasure && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold animate-pulse shadow-sm">
                      🎁 宝箱
                    </span>
                  )}
                </div>
                <div className="w-full bg-white/60 dark:bg-gray-700/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500"
                    style={{
                      width: `${taskSummary.total > 0 ? (taskSummary.completed / taskSummary.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    进度 {taskSummary.completed}/{taskSummary.total}
                  </span>
                  <NavLink
                    to="/tasks"
                    className="text-purple-600 dark:text-purple-300 font-semibold hover:underline"
                  >
                    去完成 →
                  </NavLink>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 px-1 py-2 z-40">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <div className="relative">
                <item.icon size={20} />
                {item.hasNew && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-lg" />
                )}
                {item.highlight && !item.hasNew && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-lg" />
                )}
              </div>
              <span className="text-[10px] whitespace-nowrap">{item.label}</span>
              {item.badge && !item.hasNew && (
                <span
                  className={`absolute -top-0.5 right-0.5 text-[9px] px-1 py-0.5 rounded-full font-bold ${
                    item.highlight
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
