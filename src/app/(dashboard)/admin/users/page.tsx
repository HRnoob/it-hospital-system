'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Key, ChevronLeft, ChevronRight, Search, UserPlus, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER',
    isActive: true,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (userRole === 'SUPERADMIN') {
      fetchUsers()
    }
  }, [page, search, userRole])

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

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
      })
      const res = await fetch(`/api/users?${params}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
        setTotalPages(data.pagination.totalPages)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Gagal memuat data user')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'

      const payload = editingUser
        ? { name: form.name, email: form.email, role: form.role, isActive: form.isActive }
        : { name: form.name, email: form.email, password: form.password, role: form.role }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(editingUser ? 'User berhasil diupdate' : 'User berhasil ditambahkan')
        setShowModal(false)
        setEditingUser(null)
        setForm({ name: '', email: '', password: '', role: 'VIEWER', isActive: true })
        fetchUsers()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Gagal menyimpan')
    }
  }

  const handleResetPassword = async (userId: string, userName: string) => {
    const newPassword = prompt(`Reset password untuk ${userName}?`, 'password123')
    if (newPassword) {
      try {
        const res = await fetch(`/api/users/${userId}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success(`Password ${userName} berhasil direset`)
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error('Gagal reset password')
      }
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (confirm(`Hapus user ${userName}?`)) {
      try {
        const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
        const data = await res.json()
        if (data.success) {
          toast.success('User berhasil dihapus')
          fetchUsers()
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error('Gagal menghapus')
      }
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      SUPERADMIN: 'bg-red-500/20 text-red-500 border border-red-500/30',
      ADMIN: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
      VIEWER: 'bg-blue-500/20 text-blue-500 border border-blue-500/30',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-mono ${styles[role as keyof typeof styles]}`}>
        {role}
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
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-12 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-destructive">ACCESS DENIED</h2>
        <p className="text-destructive/80 mt-2 font-mono">Halaman ini hanya dapat diakses oleh SUPERADMIN.</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 bg-destructive/20 hover:bg-destructive/30 border border-destructive/50 rounded-lg text-destructive transition-colors">
          BACK TO DASHBOARD
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header Industrial */}
      <div className="mb-8 border-b border-border pb-4">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full animate-pulse" />
              <h1 className="text-3xl font-bold tracking-tight text-foreground">USER MANAGEMENT</h1>
            </div>
            <p className="text-muted-foreground font-mono text-sm mt-2 ml-4">
              Access Control — Role Management
            </p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null)
              setForm({ name: '', email: '', password: '', role: 'VIEWER', isActive: true })
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg px-4 py-2 font-mono text-sm transition-all duration-300 text-primary"
          >
            <UserPlus className="w-4 h-4" />
            ADD USER
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-xl shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari user (nama atau email)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground/50 font-mono text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">NAME</th>
              <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">EMAIL</th>
              <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">ROLE</th>
              <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">STATUS</th>
              <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground font-mono text-sm">LOADING DATA...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-muted-foreground font-mono text-sm">NO USERS FOUND</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/30 transition-colors duration-150">
                  <td className="px-6 py-4 font-medium text-foreground">{user.name}</td>
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-mono ${user.isActive ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                      {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user)
                          setForm({ name: user.name, email: user.email, password: '', role: user.role, isActive: user.isActive })
                          setShowModal(true)
                        }}
                        className="p-1 text-yellow-500 hover:text-yellow-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id, user.name)}
                        className="p-1 text-primary hover:text-primary/80 transition-colors"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-1 text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-border">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-1 border border-border rounded-lg disabled:opacity-50 hover:bg-secondary transition-colors font-mono text-sm text-foreground">
              <ChevronLeft className="w-4 h-4" /> PREV
            </button>
            <span className="text-sm font-mono text-muted-foreground">PAGE {page} OF {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-1 border border-border rounded-lg disabled:opacity-50 hover:bg-secondary transition-colors font-mono text-sm text-foreground">
              NEXT <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-foreground mb-4">{editingUser ? 'EDIT USER' : 'ADD NEW USER'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">NAME</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground font-mono" />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">EMAIL</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground font-mono" />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">PASSWORD</label>
                  <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground font-mono" />
                </div>
              )}
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">ROLE</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground font-mono">
                  <option value="SUPERADMIN">SUPERADMIN</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>
              {editingUser && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <label className="text-sm font-mono text-foreground">ACTIVE</label>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-mono text-foreground">CANCEL</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary transition-colors font-mono">SAVE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}