'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Trash2, Database, ShieldAlert, Upload, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

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
  const [restoring, setRestoring] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)

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

  const handleRestore = async () => {
    if (!selectedFile) {
      toast.error('Pilih file backup terlebih dahulu')
      return
    }

    setRestoring(true)
    const formData = new FormData()
    formData.append('backupFile', selectedFile)

    try {
      const res = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Database berhasil direstore')
        setSelectedFile(null)
        setShowRestoreConfirm(false)
        // Refresh halaman setelah restore
        setTimeout(() => window.location.reload(), 1500)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Gagal restore database')
    } finally {
      setRestoring(false)
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

      {/* Restore Section */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          RESTORE DATABASE
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-mono text-muted-foreground mb-1">Pilih File Backup (.sql atau .dump)</label>
            <input
              type="file"
              accept=".sql,.dump"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-mono file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
            />
          </div>
          <button
            onClick={() => setShowRestoreConfirm(true)}
            disabled={!selectedFile || restoring}
            className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg px-6 py-2 font-mono text-sm transition-all duration-300 text-red-500 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {restoring ? 'RESTORING...' : 'RESTORE'}
          </button>
        </div>
        
        <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-500">
            ⚠️ PERINGATAN: Restore akan MENIMPA semua data yang ada saat ini dengan data dari file backup. 
            Pastikan Anda telah melakukan backup terbaru sebelum melanjutkan.
          </p>
        </div>
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Konfirmasi Restore
            </h2>
            <p className="text-muted-foreground mb-4">
              Anda yakin ingin merestorasi database dari file <strong className="text-foreground">{selectedFile?.name}</strong>?
            </p>
            <p className="text-red-500 text-sm mb-6">
              ⚠️ TINDAKAN INI TIDAK DAPAT DIBATALKAN! Semua data saat ini akan ditimpa.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRestoreConfirm(false)
                  setSelectedFile(null)
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-foreground"
              >
                Batal
              </button>
              <button
                onClick={handleRestore}
                disabled={restoring}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-red-500 transition-colors disabled:opacity-50"
              >
                {restoring ? 'RESTORING...' : 'YA, RESTORE SEKARANG'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}