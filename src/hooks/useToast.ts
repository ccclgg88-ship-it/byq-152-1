import { useContext } from 'react'
import { ToastContext } from '@/App'
import { ToastType } from '@/types'

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const showSuccessToast = (showToast: (msg: string, type?: ToastType) => void, message: string) => {
  showToast(message, 'success')
}

export const showErrorToast = (showToast: (msg: string, type?: ToastType) => void, message: string) => {
  showToast(message, 'error')
}

export const showInfoToast = (showToast: (msg: string, type?: ToastType) => void, message: string) => {
  showToast(message, 'info')
}
