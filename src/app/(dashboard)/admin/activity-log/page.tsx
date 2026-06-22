'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Search, Calendar, ShieldAlert, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

interface ActivityLog {
  id: string
  action: string
  module: string
  targetName: string | null
  detail: any
  ipAddress: string | null
  createdAt: string
  user: { name: string; email: string; role: string }
}

export default function ActivityLogPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    module: '',
    action: '',
    startDate: '',
    endDate: '',
  })
  const [search, setSearch] = useState('')

  const modules = ['AUTH', 'INVENTORY', 'ISSUE', 'KANBAN', 'MORNING_CHECK', 'USER', 'BACKUP']
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT_PDF', 'BACKUP']

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (userRole === 'SUPERADMIN') {
      fetchLogs()
    }
  }, [page, filters, search, userRole])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success) {
        if (data.data.role !== 'SUPERADMIN') {
          toast.error('Akses ditolak. Hanya SUPERADMIN yang dapat mengakses halaman ini.')
          router.push('/dashboard')
        } else {
          setUserRole(data.data.role)
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setChecking(false)
    }
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search }),
        ...(filters.module && { module: filters.module }),
        ...(filters.action && { action: filters.action }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      })
      const res = await fetch(`/api/activity-log?${params}`)
      const data = await res.json()
      if (data.success) {
        setLogs(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      toast.error('Gagal memuat activity log')
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      CREATE: 'bg-green-500/20 text-green-500 border border-green-500/30',
      UPDATE: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
      DELETE: 'bg-red-500/20 text-red-500 border border-red-500/30',
      LOGIN: 'bg-blue-500/20 text-blue-500 border border-blue-500/30',
      LOGOUT: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
      EXPORT_PDF: 'bg-purple-500/20 text-purple-500 border border-purple-500/30',
      BACKUP: 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/30',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-mono ${styles[action] || 'bg-secondary text-muted-foreground'}`}>
        {action}
      </span>
    )
  }

  const getModuleBadge = (module: string) => {
    const styles: Record<string, string> = {
      AUTH: 'bg-purple-500/20 text-purple-500',
      INVENTORY: 'bg-blue-500/20 text-blue-500',
      ISSUE: 'bg-red-500/20 text-red-500',
      KANBAN: 'bg-yellow-500/20 text-yellow-500',
      MORNING_CHECK: 'bg-green-500/20 text-green-500',
      USER: 'bg-pink-500/20 text-pink-500',
      BACKUP: 'bg-cyan-500/20 text-cyan-500',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-mono ${styles[module] || 'bg-secondary text-muted-foreground'}`}>
        {module}
      </span>
    )
  }

  if (checking) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (userRole !== 'SUPERADMIN') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-12 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-500">ACCESS DENIED</h2>
        <p className="text-red-500/80 mt-2 font-mono">Halaman ini hanya dapat diakses oleh SUPERADMIN.</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-500 transition-colors">
          BACK TO DASHBOARD
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header Industrial */}
      <div className="mb-8 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary rounded-full animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">ACTIVITY LOG</h1>
          <span className="text-xs text-muted-foreground font-mono ml-auto">
            Real-time User Activity
          </span>
        </div>
        <p className="text-muted-foreground font-mono text-sm mt-2 ml-4">
          Audit Trail — Monitor Semua Aktivitas User
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari user, target, atau aktivitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground/50 font-mono text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.module}
            onChange={(e) => setFilters({ ...filters, module: e.target.value })}
            className="p-2 border border-border rounded-lg bg-background text-foreground font-mono text-sm"
          >
            <option value="">SEMUA MODUL</option>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="p-2 border border-border rounded-lg bg-background text-foreground font-mono text-sm"
          >
            <option value="">SEMUA AKSI</option>
            {actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="p-2 border border-border rounded-lg bg-background text-foreground font-mono text-sm"
            placeholder="Mulai"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="p-2 border border-border rounded-lg bg-background text-foreground font-mono text-sm"
            placeholder="Akhir"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">WAKTU</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">USER</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">AKSI</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">MODUL</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">TARGET</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">IP ADDRESS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground font-mono text-sm">LOADING DATA...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-muted-foreground font-mono text-sm">NO ACTIVITY FOUND</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-secondary/30 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm font-mono whitespace-nowrap text-foreground">
                      {new Date(log.createdAt).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm text-foreground">{log.user.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">{log.user.email}</p>
                    </td>
                    <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                    <td className="px-6 py-4">{getModuleBadge(log.module)}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{log.targetName || '-'}</td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{log.ipAddress || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-border">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1 border border-border rounded-lg disabled:opacity-50 hover:bg-secondary transition-colors font-mono text-sm text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
              PREV
            </button>
            <span className="text-sm font-mono text-muted-foreground">
              PAGE {page} OF {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1 border border-border rounded-lg disabled:opacity-50 hover:bg-secondary transition-colors font-mono text-sm text-foreground"
            >
              NEXT
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}