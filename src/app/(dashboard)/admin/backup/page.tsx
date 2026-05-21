'use client'

import { useState, useEffect } from 'react'
import { Download, Trash2, Database, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface BackupFile {
  name: string
  size: number
  createdAt: string
}

export default function BackupPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [backups, setBackups] = useState<BackupFile[]>([])
  const [loading, setLoading] = useState(false)
  const [backingUp, setBackingUp] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

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
          fetchBackups()
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

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/admin/backup')
      const data = await res.json()
      if (data.success) {
        setBackups(data.data)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar backup')
    } finally {
      setLoading(false)
    }
  }

  const handleBackup = async () => {
    setBackingUp(true)
    try {
      const res = await fetch('/api/admin/backup', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        fetchBackups()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Gagal membuat backup')
    } finally {
      setBackingUp(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
              <h1 className="text-3xl font-bold tracking-tight text-foreground">DATABASE BACKUP</h1>
            </div>
            <p className="text-muted-foreground font-mono text-sm mt-2 ml-4">
              Backup & Restore — Data Protection
            </p>
          </div>
          <button
            onClick={handleBackup}
            disabled={backingUp}
            className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg px-4 py-2 font-mono text-sm transition-all duration-300 text-primary"
          >
            <Database className="w-4 h-4" />
            {backingUp ? 'BACKING UP...' : 'CREATE BACKUP'}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-500 font-mono">
          💾 Backup akan disimpan dalam folder <code className="bg-blue-500/20 px-1 rounded">/backups</code> 
          dengan format file SQL. Backup dapat digunakan untuk restore database jika diperlukan.
        </p>
      </div>

      {/* Backup List */}
      <div className="bg-card border border-border rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">FILE NAME</th>
              <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">SIZE</th>
              <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">CREATED AT</th>
              <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground font-mono text-sm">LOADING DATA...</p>
                </td>
              </tr>
            ) : backups.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <p className="text-muted-foreground font-mono text-sm">NO BACKUPS FOUND</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Click "CREATE BACKUP" to create your first backup</p>
                </td>
              </tr>
            ) : (
              backups.map((backup) => (
                <tr key={backup.name} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-foreground">{backup.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-muted-foreground">{formatSize(backup.size)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(backup.createdAt).toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <a
                        href={`/api/admin/backup/download?file=${encodeURIComponent(backup.name)}`}
                        className="p-1 text-primary hover:text-primary/80 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {/* handle delete */}}
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
      </div>
    </div>
  )
}