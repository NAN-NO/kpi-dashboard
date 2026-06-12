'use client'

import Link from 'next/link'
import { Activity, LayoutDashboard, Settings, LogOut, User, Menu, X, Sun, Moon, Printer } from 'lucide-react'
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
    { href: '/settings', label: 'จัดการระบบ', icon: Settings, roles: ['editor', 'admin'] },
  ]

  const filteredLinks = navLinks.filter(link => {
    if (!session) return link.href === '/'
    return link.roles.includes(session.user?.role || 'viewer')
  })

  return (
    <header 
      style={{
        background: 'linear-gradient(135deg, #0a0f2e 0%, #1e3a8a 40%, #4338ca 75%, #7c3aed 100%)',
        borderBottom: '2px solid rgba(139,92,246,0.35)'
      }}
      className="sticky top-0 z-50 w-full text-white shadow-xl"
    >
      <div className="w-full flex min-h-[64px] items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 shadow-sm">
              <Activity className="h-5 w-5 text-blue-300" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-tight md:text-base text-white">Clinical Governance KPI Dashboard</h1>
              <p className="text-blue-300 text-[11px] md:text-xs">
                ระบบติดตามตัวชี้วัดคุณภาพทางคลินิก | ปีงบประมาณ <span className="font-semibold text-white">2569</span>
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {filteredLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    isActive 
                      ? 'bg-white/20 text-white shadow-inner' 
                      : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-indigo-200'}`} />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Menu & Mobile Toggle & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Print Button (Only on Dashboard) */}
          {pathname === '/' && (
            <button 
              onClick={() => window.print()}
              className="hidden sm:flex bg-blue-600/80 hover:bg-blue-600 border border-blue-400/30 text-xs transition px-3 py-1.5 rounded items-center gap-1.5 text-white font-semibold shadow-sm backdrop-blur"
            >
              <Printer className="w-3.5 h-3.5" />
              พิมพ์ PDF
            </button>
          )}

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 text-indigo-200 hover:bg-white/10 hover:text-white rounded-md transition-colors border border-transparent hover:border-white/20"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {session ? (
            <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-white/20">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white">{session.user?.name}</span>
                <span className="text-[10px] text-blue-200 capitalize bg-white/10 px-1.5 rounded-sm">{session.user?.role}</span>
              </div>
              <div className="h-8 w-8 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center text-indigo-800 font-bold shadow-inner">
                {session.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-1.5 text-indigo-200 hover:text-rose-300 hover:bg-rose-500/20 rounded-md transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-indigo-900 bg-white/95 px-3 py-1.5 rounded-md hover:bg-white transition-colors shadow-sm ml-2"
            >
              <User className="h-3.5 w-3.5" />
              เข้าสู่ระบบ
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-1.5 text-indigo-100 hover:bg-white/10 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-indigo-950/95 backdrop-blur-md">
          <nav className="flex flex-col px-4 py-3 space-y-1">
            {filteredLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-indigo-300'}`} />
                  {link.label}
                </Link>
              )
            })}
            
            {pathname === '/' && (
               <button 
                onClick={() => { window.print(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-indigo-200 hover:bg-white/10 hover:text-white w-full text-left"
              >
                <Printer className="h-4 w-4 text-indigo-300" />
                พิมพ์ PDF
              </button>
            )}

            <div className="h-px bg-white/10 my-2"></div>
            
            {session ? (
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-rose-300 hover:bg-rose-500/20 w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                ออกจากระบบ ({session.user?.name})
              </button>
            ) : (
              <Link 
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 mt-2"
              >
                <User className="h-4 w-4" />
                เข้าสู่ระบบ
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
