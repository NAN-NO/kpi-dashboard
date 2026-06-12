'use client'

import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center mb-5 shadow-lg">
          <AlertCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="text-2xl font-bold text-rose-800 dark:text-rose-200 mb-2">
          ไม่สามารถโหลดข้อมูลการตั้งค่าได้
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          ระบบไม่สามารถดึงข้อมูลแผนกและตัวชี้วัดจากฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-md active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            ลองใหม่อีกครั้ง
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
          >
            <Home className="h-4 w-4" />
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  )
}
