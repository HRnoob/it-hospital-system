'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react'
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

  const modules = ['INVENTORY', 'ISSUE', 'KANBAN', 'MORNING_CHECK', 'USER', 'AUTH']
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT_PDF']

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (userRole === 'SUPERADMIN') {
      fetchLogs()
    }
  }, [page, filters, userRole])

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
      LOGOUT: 'bg-gray-500/20 text-gray-500 border border-gray-500/30',
      EXPORT_PDF: 'bg-purple-500/20 text-purple-500 border border-purple-500/30',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${styles[action] || 'bg-secondary text-muted-foreground border border-border'}`}>
        {action}
      </span>
    )
  }

  if (checking) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (userRole !== 'SUPERADMIN') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-12 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-700">Akses Ditolak</h2>
        <p className="text-red-600 mt-2">Halaman ini hanya dapat diakses oleh SUPERADMIN.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Kembali ke Dashboard
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
        <p className="text-gray-500 mt-1">Riwayat aktivitas semua user dalam sistem</p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.module}
            onChange={(e) => setFilters({ ...filters, module: e.target.value })}
            className="p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Modul</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Aksi</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">Waktu</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">Modul</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">Target</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">IP Address</th>
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
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-muted-foreground">{log.module}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground">{log.targetName || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-muted-foreground">{log.ipAddress || '-'}</span>
                    </td>
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
              className="flex items-center gap-1 px-3 py-1 border border-border rounded-lg disabled:opacity-50 hover:bg-secondary transition-colors font-mono text-sm"
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
              className="flex items-center gap-1 px-3 py-1 border border-border rounded-lg disabled:opacity-50 hover:bg-secondary transition-colors font-mono text-sm"
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