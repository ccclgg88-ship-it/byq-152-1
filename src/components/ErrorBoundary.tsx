import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-gray-900 p-4">
          <div className="text-center pet-card p-8 max-w-md">
            <div className="text-6xl mb-4">😿</div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              页面出错了
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              {this.state.error?.message || '发生了未知错误，请刷新页面重试'}
            </p>
            <button
              className="pet-button-primary px-6 py-3"
              onClick={() => window.location.reload()}
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
