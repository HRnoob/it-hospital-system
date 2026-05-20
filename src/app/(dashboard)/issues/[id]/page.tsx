'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Calendar, AlertCircle, Clock, CheckCircle, Plus } from 'lucide-react'
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
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [assignToId, setAssignToId] = useState('')
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchIssue()
    fetchUsers()
  }, [id])

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!issue) return null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/issues"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{issue.title}</h1>
            <p className="text-gray-500 font-mono text-sm mt-1">{issue.ticketNumber}</p>
          </div>
        </div>
        <button
          onClick={() => setShowStatusModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Update Status
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Deskripsi</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
          </div>

          {/* Resolution */}
          {issue.resolution && (
            <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-green-200">Resolusi</h2>
              <p className="text-gray-700">{issue.resolution}</p>
              {issue.resolvedAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Diselesaikan pada: {new Date(issue.resolvedAt).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Timeline Aktivitas</h2>
            <div className="space-y-4">
              {issue.timeline.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">{item.action}</p>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Informasi</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <div className="mt-1">{getStatusBadge(issue.status)}</div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Prioritas</p>
                <div className="mt-1">{getPriorityBadge(issue.priority)}</div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Kategori</p>
                <p className="text-sm">{issue.category || '-'}</p>
              </div>
              {issue.slaDeadline && (
                <div>
                  <p className="text-xs text-gray-500">SLA Deadline</p>
                  <p className={`text-sm ${issue.slaBreached ? 'text-red-600' : 'text-gray-700'}`}>
                    {new Date(issue.slaDeadline).toLocaleString('id-ID')}
                    {issue.slaBreached && ' (Terlewat)'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pelapor & Assignee */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Personil</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Dilaporkan oleh</p>
                  <p className="text-sm font-medium">{issue.reportedBy.name}</p>
                  <p className="text-xs text-gray-400">{issue.reportedBy.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(issue.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              {issue.assignedTo && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Ditugaskan kepada</p>
                    <p className="text-sm font-medium">{issue.assignedTo.name}</p>
                    <p className="text-xs text-gray-400">{issue.assignedTo.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Asset Info */}
          {issue.asset && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Aset Terkait</h2>
              <Link
                href={`/inventory/${issue.asset.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <p className="font-mono text-sm">{issue.asset.assetCode}</p>
                <p className="font-medium">{issue.asset.name}</p>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Update Tiket</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="WAITING_PARTS">Waiting Parts</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign Teknisi</label>
                <select
                  value={assignToId}
                  onChange={(e) => setAssignToId(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Tidak ditugaskan</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}