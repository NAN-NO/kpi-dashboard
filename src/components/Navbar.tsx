'use client'

import Link from 'next/link'
import { Activity, LayoutDashboard, FileEdit, Settings, LogOut, User, Menu, X, Sun, Moon } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { href: '/', label: 'ภาพรวม (Dashboard)', icon: LayoutDashboard, roles: ['viewer', 'editor', 'admin'] },
    { href: '/settings', label: 'จัดการระบบและข้อมูล (Manage & Entry)', icon: Settings, roles: ['editor', 'admin'] },
  ]

  const filteredLinks = navLinks.filter(link => {
    if (!session) return link.href === '/'
    return link.roles.includes(session.user?.role || 'viewer')
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-sm">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground hidden sm:inline-block">
              ระบบฐานข้อมูลตัวชี้วัด (CG)
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {filteredLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Menu & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          {session ? (
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-slate-700">{session.user?.name}</span>
                <span className="text-xs text-slate-500 capitalize px-2 py-0.5 bg-slate-100 rounded-full">{session.user?.role}</span>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                {session.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
            >
              <User className="h-4 w-4" />
              เจ้าหน้าที่เข้าสู่ระบบ
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="flex flex-col px-4 py-3 space-y-1">
            {filteredLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              )
            })}
            
            <div className="h-px bg-slate-200 my-2"></div>
            
            {session ? (
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                ออกจากระบบ ({session.user?.name})
              </button>
            ) : (
              <Link 
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
              >
                <User className="h-5 w-5" />
                เจ้าหน้าที่เข้าสู่ระบบ
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
