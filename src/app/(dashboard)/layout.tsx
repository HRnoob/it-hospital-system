'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { 
  LayoutDashboard, 
  ClipboardList, 
  Package, 
  AlertCircle, 
  KanbanSquare,
  FileText,
  Monitor,
  LogOut,
  User,
  Shield,
  Moon,
  Sun,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  Settings,
  BookOpen,
  Activity,
  Users
} from 'lucide-react'
import toast from 'react-hot-toast'

const menuItems = [
  { icon: LayoutDashboard, label: 'DASHBOARD', href: '/dashboard' },
  { icon: ClipboardList, label: 'MORNING CHECK', href: '/morning-check' },
  { icon: Package, label: 'INVENTARIS', href: '/inventory' },
  { icon: AlertCircle, label: 'ISSUES', href: '/issues' },
  { icon: KanbanSquare, label: 'KANBAN', href: '/kanban' },
  { icon: FileText, label: 'REPORTS', href: '/reports' },
  { icon: Monitor, label: 'REMOTE', href: '/remote' },
  { icon: Users, label: 'TEAM', href: '/team' },
  { icon: Shield, label: 'ADMIN', href: '/admin/users' },
  { icon: Database, label: 'BACKUP', href: '/admin/backup' },
  { icon: Activity, label: 'ACTIVITY LOG', href: '/admin/activity-log' },
  { icon: Settings, label: 'SETTINGS', href: '/admin/settings' },
  { icon: BookOpen, label: 'MANUAL', href: '/manual' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen')
      return saved !== null ? saved === 'true' : true
    }
    return true
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(sidebarOpen))
  }, [sidebarOpen])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data)
          setIsAdmin(data.data.role === 'SUPERADMIN')
        } else {
          router.push('/login')
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logout berhasil')
    router.push('/login')
  }

  const filteredMenu = menuItems.filter(item => {
    if (item.href === '/admin/users' && !isAdmin) return false
    return true
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-secondary/80 backdrop-blur-sm border border-border text-secondary-foreground"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-40 h-full transition-all duration-500 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'w-72' : 'lg:w-20'}
          bg-gradient-to-b from-card via-card to-secondary/95
          border-r border-border
          shadow-2xl shadow-black/20
        `}
      >
        {/* Industrial noise overlay */}
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        
        {/* Vertical accent line */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-primary via-primary/50 to-transparent" />

        <div className="flex flex-col h-full relative z-10">
          {/* Logo Area with Toggle Button */}
          <div className={`relative pt-6 pb-4 ${!sidebarOpen && 'lg:px-2'}`}>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            {/* Tombol Toggle (Desktop) */}
            <div className="absolute -right-3 top-8 z-50 hidden lg:block">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform"
              >
                {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            
            {sidebarOpen ? (
              <div className="px-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-6 bg-primary rounded-full animate-pulse" />
                  <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                    IT COMMAND CENTER
                  </h1>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] ml-3">
                  RSUD MARIA WALANDA MARAMIS
                </p>
                <div className="flex items-center gap-2 mt-3 ml-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-mono text-green-500">SYSTEM ONLINE</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30">
                  <span className="text-xl font-black text-primary">IT</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {filteredMenu.map((item, idx) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                    ${isActive 
                      ? 'bg-primary/10 text-primary shadow-lg shadow-primary/5' 
                      : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                    }
                    ${!sidebarOpen && 'lg:justify-center lg:px-2'}
                    overflow-hidden
                  `}
                  style={{ animationDelay: `${idx * 0.03}s` }}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full bg-primary transition-all duration-300 ${isActive ? 'h-6' : 'group-hover:h-4'}`} />
                  <div className={`relative transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                  </div>
                  {sidebarOpen && (
                    <span className="relative z-10 text-sm font-mono font-medium tracking-wide">
                      {item.label}
                    </span>
                  )}
                  {isActive && sidebarOpen && (
                    <>
                      <div className="absolute top-1 right-1 w-1 h-1 border-t border-r border-primary/50" />
                      <div className="absolute bottom-1 left-1 w-1 h-1 border-b border-l border-primary/50" />
                    </>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="relative p-4 pb-6">
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`
                flex items-center gap-3 w-full px-4 py-2.5 rounded-lg mb-3
                bg-secondary/30 hover:bg-secondary/50 transition-all duration-300
                border border-border/50 hover:border-primary/30
                ${!sidebarOpen && 'lg:justify-center'}
              `}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-yellow-500" />
                  {sidebarOpen && <span className="text-sm font-mono">LIGHT MODE</span>}
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-primary" />
                  {sidebarOpen && <span className="text-sm font-mono">DARK MODE</span>}
                </>
              )}
            </button>

            {/* User Info Card */}
            <div className={`
              relative rounded-lg bg-gradient-to-br from-secondary/40 to-secondary/20 p-3 mb-3
              border border-border/50 backdrop-blur-sm
              ${!sidebarOpen && 'lg:flex lg:justify-center'}
            `}>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className={`flex items-center gap-3 ${!sidebarOpen && 'lg:justify-center'}`}>
                <div className="relative">
                  <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse" />
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/30 to-secondary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-[10px] font-mono text-primary tracking-wider">{user.role}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-mono text-muted-foreground">ACTIVE</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-3 w-full px-4 py-2.5 rounded-lg
                bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all duration-300
                border border-destructive/20 hover:border-destructive/40
                ${!sidebarOpen && 'lg:justify-center'}
              `}
            >
              <LogOut className="w-4 h-4" />
              {sidebarOpen && <span className="text-sm font-mono tracking-wide">LOGOUT</span>}
            </button>

            {sidebarOpen && (
              <p className="text-[9px] font-mono text-muted-foreground text-center mt-4 tracking-wider">
                v1.0.0 | SECURE CONNECTION
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="hidden lg:block w-1 h-6 bg-primary rounded-full animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground tracking-wider">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-green-500 tracking-wider">LIVE</span>
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}