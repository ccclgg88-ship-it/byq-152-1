import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { ToastItem } from '@/types'

interface ToastContainerProps {
  toasts: ToastItem[]
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const toastColors = {
  success: 'from-green-400 to-emerald-400',
  error: 'from-red-400 to-rose-400',
  info: 'from-blue-400 to-cyan-400',
  warning: 'from-yellow-400 to-orange-400',
}

export default function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type]
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 min-w-[280px] max-w-md animate-[slideIn_0.3s_ease-out]`}
            style={{
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div className={`p-1.5 rounded-xl bg-gradient-to-br ${toastColors[toast.type]} text-white`}>
              <Icon size={18} />
            </div>
            <p className="flex-1 text-sm text-gray-700 dark:text-gray-200">{toast.message}</p>
          </div>
        )
      })}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
