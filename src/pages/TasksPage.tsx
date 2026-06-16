import { useState, useEffect, useMemo } from 'react'
import { usePetStore } from '@/store/usePetStore'
import Modal from '@/components/Modal'
import { useToast } from '@/hooks/useToast'
import { DAILY_TASK_POOL } from '@/data/species'
import { formatDateTime } from '@/utils/date'
import {
  ListTodo,
  CheckCircle2,
  Circle,
  Gift,
  Flame,
  Filter,
  CheckSquare,
  Clock,
  Square,
  ChevronRight,
  Sparkles,
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type TaskFilter = 'all' | 'in_progress' | 'completed' | 'claimed'

export default function TasksPage() {
  const {
    dailyTasksData,
    getTodayTasksSummary,
    getTaskHistory7Days,
    getWeeklyCompletionRate,
    getTotalTasksCompleted,
    getTotalTreasuresClaimed,
    claimTaskReward,
    claimDailyTreasure,
    getMainPet,
    hasData,
  } = usePetStore()
  const { showToast } = useToast()

  const [filter, setFilter] = useState<TaskFilter>('all')
  const [showTreasureModal, setShowTreasureModal] = useState(false)
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  const summary = getTodayTasksSummary()
  const history7Days = getTaskHistory7Days()
  const weeklyRate = getWeeklyCompletionRate()
  const totalCompleted = getTotalTasksCompleted()
  const totalTreasures = getTotalTreasuresClaimed()

  const filteredTasks = useMemo(() => {
    if (!dailyTasksData) return []
    return dailyTasksData.tasks.filter((task) => {
      if (filter === 'all') return true
      if (filter === 'in_progress') return !task.isCompleted
      if (filter === 'completed') return task.isCompleted && !task.isClaimed
      if (filter === 'claimed') return task.isClaimed
      return true
    })
  }, [dailyTasksData, filter])

  const handleClaimTask = (taskId: string, rewardDesc: string) => {
    const success = claimTaskReward(taskId)
    if (success) {
      showToast(`🎉 奖励已领取：${rewardDesc}`, 'success')
    }
  }

  const handleClaimTreasure = () => {
    const success = claimDailyTreasure()
    if (success) {
      setShowTreasureModal(true)
    }
  }

  const handleTaskClick = (task: any) => {
    const config = DAILY_TASK_POOL.find((c) => c.id === task.configId)
    setSelectedTask({ ...task, config })
    setShowTaskDetailModal(true)
  }

  const chartData = {
    labels: history7Days.map((d) => d.label),
    datasets: [
      {
        label: '完成任务数',
        data: history7Days.map((d) => d.completed),
        backgroundColor: 'rgba(147, 112, 219, 0.7)',
        borderRadius: 8,
        barThickness: 24,
      },
      {
        label: '总任务数',
        data: history7Days.map((d) => d.total),
        backgroundColor: 'rgba(203, 213, 225, 0.5)',
        borderRadius: 8,
        barThickness: 24,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(229, 231, 235, 0.5)' },
        ticks: { color: '#6B7280', stepSize: 1, precision: 0 },
      },
    },
  }

  const filterOptions: Array<{ value: TaskFilter; label: string; icon: any }> = [
    { value: 'all', label: '全部', icon: ListTodo },
    { value: 'in_progress', label: '进行中', icon: Clock },
    { value: 'completed', label: '待领取', icon: CheckSquare },
    { value: 'claimed', label: '已领取', icon: CheckCircle2 },
  ]

  if (!hasData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            每日陪伴任务
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            每天和宠物互动，完成任务领取丰厚奖励
          </p>
        </div>

        <div className="pet-card p-10 text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            领养宠物后开启每日任务
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            先去领养一只可爱的圆嘟嘟宠物吧！每天陪伴它，完成任务就可以领取经验值宝箱哦～
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          每日陪伴任务
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          每天和宠物互动，完成任务领取丰厚奖励
        </p>
      </div>

      <div className="pet-card p-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
              <ListTodo className="text-white" size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">今日进度</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {summary.completed}
                <span className="text-base font-normal text-gray-400"> / {summary.total}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center shadow-md">
              <Flame className="text-white" size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">任务连胜</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {summary.streak}
                <span className="text-base font-normal text-gray-400"> 天</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center shadow-md">
              <TrendingUp className="text-white" size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">本周完成率</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {weeklyRate}
                <span className="text-base font-normal text-gray-400">%</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-400 flex items-center justify-center shadow-md">
              <Award className="text-white" size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">累计宝箱</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {totalTreasures}
                <span className="text-base font-normal text-gray-400"> 个</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 transition-all duration-700 flex items-center justify-end pr-2"
              style={{
                width: `${summary.total > 0 ? (summary.completed / summary.total) * 100 : 0}%`,
              }}
            >
              {summary.canClaimTreasure && (
                <Sparkles size={16} className="text-yellow-100 animate-pulse" />
              )}
            </div>
          </div>

          {summary.canClaimTreasure && (
            <button
              onClick={handleClaimTreasure}
              className="mt-4 w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 animate-pulse-slow"
            >
              <Gift size={24} />
              领取今日陪伴宝箱 🎁
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <Filter size={16} className="text-gray-400 flex-shrink-0" />
        {filterOptions.map((option) => {
          const Icon = option.icon
          return (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === option.value
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon size={14} />
              {option.label}
            </button>
          )
        })}
      </div>

      <div className="space-y-3 mb-8">
        {filteredTasks.length === 0 ? (
          <div className="pet-card p-10 text-center">
            <div className="text-5xl mb-3">✨</div>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' ? '今日任务已全部完成！' : '暂无该类型的任务'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const config = DAILY_TASK_POOL.find((c) => c.id === task.configId)
            if (!config) return null
            const progressPercent = Math.min(100, (task.currentProgress / task.target) * 100)

            return (
              <button
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className={`pet-card p-4 w-full text-left transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden ${
                  task.isClaimed ? 'opacity-70' : ''
                }`}
              >
                {task.isCompleted && !task.isClaimed && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-green-400 to-emerald-400 shadow-sm animate-bounce-slow">
                    可领取
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md"
                    style={{
                      background: task.isCompleted
                        ? `linear-gradient(135deg, ${config.color}90, ${config.color}50)`
                        : `linear-gradient(135deg, ${config.color}40, ${config.color}20)`,
                      filter: task.isClaimed ? 'grayscale(50%)' : undefined,
                    }}
                  >
                    {task.isClaimed ? (
                      <CheckCircle2 size={24} className="text-gray-400" />
                    ) : task.isCompleted ? (
                      <CheckCircle2 size={24} className="text-green-500" />
                    ) : (
                      config.icon
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`font-semibold truncate ${
                          task.isClaimed
                            ? 'text-gray-400 dark:text-gray-500 line-through'
                            : 'text-gray-800 dark:text-gray-100'
                        }`}
                      >
                        {config.name}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {config.description}
                    </p>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          task.isCompleted
                            ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                            : `linear-gradient(90deg, ${config.color}, ${config.color}CC)`
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        进度：{task.currentProgress} / {task.target}
                        {task.completedAt && (
                          <span className="ml-2 text-green-500">
                            · {formatDateTime(task.completedAt).split(' ')[1]} 完成
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-medium">
                          🎁 {task.reward.description}
                        </span>
                      </div>
                    </div>

                    {task.isCompleted && !task.isClaimed && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          handleClaimTask(task.id, task.reward.description)
                        }}
                        className="mt-3 py-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-400 text-white text-sm font-semibold text-center shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Gift size={14} />
                        领取奖励
                      </div>
                    )}
                  </div>

                  <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                </div>
              </button>
            )
          })
        )}
      </div>

      <div className="pet-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center shadow-md">
            <BarChart3 className="text-white" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100">近 7 日完成概况</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">记录每天的陪伴情况</p>
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">
                累计完成任务：<span className="font-bold text-gray-700 dark:text-gray-300">{totalCompleted}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="h-64">
          {history7Days.every((d) => d.total === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">暂无历史数据</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                从今天开始，每天完成任务都会记录在这里
              </p>
            </div>
          ) : (
            <Bar data={chartData} options={chartOptions as any} />
          )}
        </div>
      </div>

      <Modal
        isOpen={showTreasureModal}
        onClose={() => setShowTreasureModal(false)}
        size="sm"
      >
        <div className="text-center py-2">
          <div className="text-7xl mb-4 animate-bounce-in">🎁</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            宝箱领取成功！
          </h3>
          <div className="pet-card p-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Star /> 经验值奖励
                </span>
                <span className="font-bold text-purple-600 dark:text-purple-300">
                  +{dailyTasksData?.treasureReward.exp || 50}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Smile /> 心情提升
                </span>
                <span className="font-bold text-pink-600 dark:text-pink-300">
                  +{dailyTasksData?.treasureReward.mood || 20}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            奖励已发放给 <span className="font-semibold">{getMainPet()?.name || '主宠'}</span>
          </p>
          <button
            onClick={() => setShowTreasureModal(false)}
            className="pet-button-primary w-full py-3"
          >
            太棒了！✨
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showTaskDetailModal}
        onClose={() => {
          setShowTaskDetailModal(false)
          setSelectedTask(null)
        }}
        title="任务详情"
      >
        {selectedTask?.config && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${selectedTask.config.color}80, ${selectedTask.config.color}40)`,
                }}
              >
                {selectedTask.isClaimed ? <CheckCircle2 className="text-gray-400" /> : selectedTask.config.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                  {selectedTask.config.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedTask.config.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {selectedTask.isClaimed ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      已领取
                    </span>
                  ) : selectedTask.isCompleted ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 animate-pulse">
                      ✨ 可领取奖励
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      进行中
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pet-card p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">任务进度</span>
                <span className="font-medium">
                  {selectedTask.currentProgress} / {selectedTask.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedTask.isCompleted
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                      : `linear-gradient(90deg, ${selectedTask.config.color}, ${selectedTask.config.color}CC)`
                  }`}
                  style={{ width: `${Math.min(100, (selectedTask.currentProgress / selectedTask.target) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pet-card p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                完成奖励
              </p>
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
                <Gift size={18} className="text-purple-500" />
                <span className="font-semibold text-purple-700 dark:text-purple-300">
                  {selectedTask.reward.description}
                </span>
                {selectedTask.isClaimed && (
                  <CheckCircle2 size={16} className="ml-auto text-green-500" />
                )}
              </div>
            </div>

            {selectedTask.completedAt && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                完成时间：{formatDateTime(selectedTask.completedAt)}
              </p>
            )}

            {selectedTask.isCompleted && !selectedTask.isClaimed && (
              <button
                onClick={() => {
                  handleClaimTask(selectedTask.id, selectedTask.reward.description)
                  setShowTaskDetailModal(false)
                }}
                className="pet-button-primary w-full py-3 flex items-center justify-center gap-2"
              >
                <Gift size={18} />
                领取奖励
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function Star() {
  return <Sparkles size={14} />
}
function Smile() {
  return <Sparkles size={14} />
}
