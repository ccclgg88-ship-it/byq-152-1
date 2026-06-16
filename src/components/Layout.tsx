import { NavLink, useLocation } from 'react-router-dom'
import { Home, PawPrint, Clock, Settings } from 'lucide-react'
import { usePetStore } from '@/store/usePetStore'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { getTodayStats: stats } = usePetStore()
  const todayStats = stats()

  const navItems = [
    { path: '/', icon: Home, label: '首页概览' },
    { path: '/pets', icon: PawPrint, label: '宠物档案' },
    { path: '/records', icon: Clock, label: '互动记录' },
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
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden md:block p-4 border-t border-gray-200/50 dark:border-gray-700/50">
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
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">今日陪伴</p>
                <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                  {todayStats.minutes} 分钟
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 px-2 py-2 z-40">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <item.icon size={20} />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
