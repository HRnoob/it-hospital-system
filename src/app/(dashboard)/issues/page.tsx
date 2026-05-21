'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Eye, ChevronLeft, ChevronRight, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Issue {
  id: string
  ticketNumber: string
  title: string
  description: string
  status: string
  priority: string
  createdAt: string
  asset: { name: string; assetCode: string } | null
  reportedBy: { name: string }
  assignedTo: { name: string } | null
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchIssues = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      })
      const res = await fetch(`/api/issues?${params}`)
      const data = await res.json()
      if (data.success) {
        setIssues(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIssues()
  }, [page, search, statusFilter, priorityFilter])

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-800',
      HIGH: 'bg-orange-100 text-orange-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-blue-100 text-blue-800',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority] || 'bg-gray-100'}`}>
        {priority}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      OPEN: 'bg-red-100 text-red-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      WAITING_PARTS: 'bg-orange-100 text-orange-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }
    const icons: Record<string, JSX.Element> = {
      OPEN: <AlertCircle className="w-3 h-3 inline mr-1" />,
      IN_PROGRESS: <Clock className="w-3 h-3 inline mr-1" />,
      RESOLVED: <CheckCircle className="w-3 h-3 inline mr-1" />,
    }
    const labels: Record<string, string> = {
      OPEN: 'Open',
      IN_PROGRESS: 'In Progress',
      WAITING_PARTS: 'Waiting Parts',
      RESOLVED: 'Resolved',
      CLOSED: 'Closed',
      CANCELLED: 'Cancelled',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {icons[status]}
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 border-b border-border pb-4">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full animate-pulse" />
              <h1 className="text-3xl font-bold tracking-tight">ISSUE TRACKER</h1>
            </div>
            <p className="text-muted-foreground font-mono text-sm mt-2 ml-4">
              Incident Management — SLA Monitoring
            </p>
          </div>
          <Link
            href="/issues/add"
            className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg px-4 py-2 font-mono text-sm transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            REPORT ISSUE
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari tiket atau judul..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          >
            <option value="">Semua Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          >
            <option value="">Semua Prioritas</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tiket</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Judul</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Aset</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Prioritas</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Pelapor</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      Memuat data...
                    </div>
                   </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Belum ada laporan kerusakan
                   </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">{issue.ticketNumber}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{issue.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{issue.description.substring(0, 50)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">{issue.asset?.name || '-'}</td>
                    <td className="px-6 py-4">{getPriorityBadge(issue.priority)}</td>
                    <td className="px-6 py-4">{getStatusBadge(issue.status)}</td>
                    <td className="px-6 py-4 text-sm">{issue.reportedBy.name}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(issue.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/issues/${issue.id}`}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>
            <span className="text-sm text-gray-600">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-50"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}