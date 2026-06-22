'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Calendar, AlertCircle, Clock, CheckCircle, Plus, Trash2, Move } from 'lucide-react'
import toast from 'react-hot-toast'

interface Timeline {
  id: string
  action: string
  description: string
  changedBy: string
  createdAt: string
}

interface Issue {
  id: string
  ticketNumber: string
  title: string
  description: string
  status: string
  priority: string
  category: string | null
  resolution: string | null
  resolvedAt: string | null
  slaDeadline: string | null
  slaBreached: boolean
  createdAt: string
  asset: { id: string; name: string; assetCode: string } | null
  reportedBy: { id: string; name: string; email: string }
  assignedTo: { id: string; name: string; email: string } | null
  timeline: Timeline[]
}

export default function IssueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [assignToId, setAssignToId] = useState('')
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchUserRole()
    fetchIssue()
  }, [id])

  const fetchUserRole = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success) {
        setUserRole(data.data.role)
        // Only fetch users if role is SUPERADMIN or ADMIN
        if (data.data.role === 'SUPERADMIN' || data.data.role === 'ADMIN') {
          fetchUsers()
        }
      }
    } catch (error) {
      console.error('Failed to fetch user role')
    }
  }

  const fetchIssue = async () => {
    try {
      const res = await fetch(`/api/issues/${id}`)
      const data = await res.json()
      if (data.success) {
        setIssue(data.data)
        setNewStatus(data.data.status)
        setAssignToId(data.data.assignedTo?.id || '')
      } else {
        toast.error('Tiket tidak ditemukan')
        router.push('/issues')
      }
    } catch (error) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users?limit=100')
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } catch (error) {
      console.error('Failed to fetch users')
    }
  }

  // State untuk support level
  const [userSupportLevel, setUserSupportLevel] = useState<string>('')
  const [escalating, setEscalating] = useState(false)

  // Ambil support level user
  const fetchUserSupportLevel = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success) {
        setUserSupportLevel(data.data.supportLevel || 'L1')
      }
    } catch (error) {
      console.error('Failed to fetch support level')
    }
  }

  // Panggil di useEffect
  useEffect(() => {
    fetchUserSupportLevel()
  }, [])

  // Fungsi eskalasi
  const handleEscalate = async () => {
    setEscalating(true)
    try {
      const res = await fetch(`/api/issues/${id}/escalate`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        fetchIssue()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Gagal eskalasi ticket')
    } finally {
      setEscalating(false)
    }
  }

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assignedToId: assignToId || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Tiket berhasil diupdate')
        setShowStatusModal(false)
        fetchIssue()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Gagal mengupdate')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/issues/${id}`, { method: 'DELETE' })
      
      // Cek response status dulu
      if (!res.ok) {
        const text = await res.text()
        console.error('Delete failed:', res.status, text)
        toast.error(`Gagal menghapus: ${res.status}`)
        return
      }
      
      const data = await res.json()
      
      if (data.success) {
        toast.success('Tiket berhasil dihapus')
        router.push('/issues')
      } else {
        toast.error(data.message || 'Gagal menghapus')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Terjadi kesalahan saat menghapus')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      CRITICAL: 'bg-red-500/20 text-red-500 border border-red-500/30',
      HIGH: 'bg-orange-500/20 text-orange-500 border border-orange-500/30',
      MEDIUM: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
      LOW: 'bg-blue-500/20 text-blue-500 border border-blue-500/30',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-mono ${styles[priority] || 'bg-secondary text-muted-foreground'}`}>
        {priority}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      OPEN: 'bg-red-500/20 text-red-500 border border-red-500/30',
      IN_PROGRESS: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
      WAITING_PARTS: 'bg-orange-500/20 text-orange-500 border border-orange-500/30',
      RESOLVED: 'bg-green-500/20 text-green-500 border border-green-500/30',
      CLOSED: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
      CANCELLED: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    }
    const labels: Record<string, string> = {
      OPEN: 'OPEN',
      IN_PROGRESS: 'IN PROGRESS',
      WAITING_PARTS: 'WAITING PARTS',
      RESOLVED: 'RESOLVED',
      CLOSED: 'CLOSED',
      CANCELLED: 'CANCELLED',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-mono ${styles[status] || 'bg-secondary text-muted-foreground'}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!issue) return null

  return (
    <>
      <div>
        {/* Header Industrial */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/issues"
              className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{issue.title}</h1>
              <p className="text-muted-foreground font-mono text-sm mt-1">{issue.ticketNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary transition-all duration-300 font-mono text-sm"
            >
              UPDATE STATUS
            </button>
            
            {/* Tombol Eskalasi - hanya untuk user L1 */}
            {issue?.status !== 'RESOLVED' && issue?.status !== 'CLOSED' && (
              <button
                onClick={handleEscalate}
                disabled={escalating}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg text-orange-500 transition-all duration-300 font-mono text-sm disabled:opacity-50"
              >
                <AlertCircle className="w-4 h-4" />
                {escalating ? 'ESCALATING...' : 'ESCALATE TO L2'}
              </button>
            )}
            
            {(userRole === 'SUPERADMIN' || userRole === 'ADMIN') && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-red-500 transition-all duration-300 font-mono text-sm"
              >
                <Trash2 className="w-4 h-4" />
                HAPUS TIKET
              </button>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Deskripsi</h2>
              <p className="text-foreground/80 whitespace-pre-wrap">{issue.description}</p>
            </div>

            {/* Resolution */}
            {issue.resolution && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-green-500/30">Resolusi</h2>
                <p className="text-foreground/80">{issue.resolution}</p>
                {issue.resolvedAt && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Diselesaikan pada: {new Date(issue.resolvedAt).toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Timeline Aktivitas</h2>
              <div className="space-y-4">
                {issue.timeline.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-foreground">{item.action}</p>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Oleh: {item.changedBy}</span>
                        <span>{new Date(item.createdAt).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Informasi</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(issue.status)}</div>
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Prioritas</p>
                  <div className="mt-1">{getPriorityBadge(issue.priority)}</div>
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Kategori</p>
                  <p className="text-sm text-foreground">{issue.category || '-'}</p>
                </div>
                {issue.slaDeadline && (
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">SLA Deadline</p>
                    <p className={`text-sm ${issue.slaBreached ? 'text-red-500' : 'text-foreground'}`}>
                      {new Date(issue.slaDeadline).toLocaleString('id-ID')}
                      {issue.slaBreached && ' (Terlewat)'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Personil Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Personil</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">Dilaporkan oleh</p>
                    <p className="text-sm font-medium text-foreground">{issue.reportedBy.name}</p>
                    <p className="text-xs text-muted-foreground">{issue.reportedBy.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(issue.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                {issue.assignedTo && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Ditugaskan kepada</p>
                      <p className="text-sm font-medium text-foreground">{issue.assignedTo.name}</p>
                      <p className="text-xs text-muted-foreground">{issue.assignedTo.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Asset Card */}
            {issue.asset && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Aset Terkait</h2>
                <Link
                  href={`/inventory/${issue.asset.id}`}
                  className="block p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <p className="font-mono text-sm text-muted-foreground">{issue.asset.assetCode}</p>
                  <p className="font-medium text-foreground">{issue.asset.name}</p>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Update Tiket</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="WAITING_PARTS">WAITING PARTS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-1">Assign Teknisi</label>
                <select
                  value={assignToId}
                  onChange={(e) => setAssignToId(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  <option value="">Tidak ditugaskan</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-foreground"
              >
                Batal
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary transition-colors disabled:opacity-50 font-mono"
              >
                {updating ? 'MENYIMPAN...' : 'SIMPAN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Hapus Tiket</h2>
            <p className="text-muted-foreground mb-6">
              Apakah Anda yakin ingin menghapus tiket "{issue.title}"? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-foreground"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-red-500 transition-colors disabled:opacity-50 font-mono"
              >
                {deleting ? 'MENGHAPUS...' : 'HAPUS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}