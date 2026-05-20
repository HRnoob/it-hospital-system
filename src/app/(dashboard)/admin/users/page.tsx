'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit,
  Trash2,
  Key,
  ChevronLeft,
  ChevronRight,
  Search,
  UserPlus,
  ShieldAlert,
} from 'lucide-react'
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
      SUPERADMIN: 'bg-red-100 text-red-800',
      ADMIN: 'bg-yellow-100 text-yellow-800',
      VIEWER: 'bg-blue-100 text-blue-800',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[role as keyof typeof styles]}`}>
        {role}
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
          <p className="text-gray-500 mt-1">Kelola akses dan role pengguna sistem</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null)
            setForm({ name: '', email: '', password: '', role: 'VIEWER', isActive: true })
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4" />
          Tambah User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari user (nama atau email)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Memuat data...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Belum ada user
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user)
                          setForm({
                            name: user.name,
                            email: user.email,
                            password: '',
                            role: user.role,
                            isActive: user.isActive,
                          })
                          setShowModal(true)
                        }}
                        className="p-1 text-yellow-600 hover:text-yellow-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id, user.name)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Hapus"
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
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-50"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Tambah User Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SUPERADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              {editingUser && (
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Aktif</span>
                  </label>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}