'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
          <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center mb-4">
            <AlertCircle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-lg font-bold text-rose-800 dark:text-rose-200 mb-1">
            {this.props.fallbackTitle || 'เกิดข้อผิดพลาด'}
          </h2>
          <p className="text-sm text-rose-600 dark:text-rose-400 mb-4 text-center max-w-md">
            {this.state.error?.message || 'ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors shadow-md active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            ลองใหม่อีกครั้ง
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
