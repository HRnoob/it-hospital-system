'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Asset {
  id: string
  assetCode: string
  name: string
  brand: string | null
  model: string | null
  serialNumber: string | null
  status: string
  condition: string
  category: { name: string }
  location: { name: string } | null
  createdAt: string
}

export default function InventoryPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(statusFilter && { status: statusFilter }),
        ...(conditionFilter && { condition: conditionFilter }),
      })
      const res = await fetch(`/api/inventory?${params}`)
      const data = await res.json()
      if (data.success) {
        setAssets(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    const res = await fetch('/api/inventory/categories')
    const data = await res.json()
    if (data.success) setCategories(data.data)
  }

  useEffect(() => {
    fetchAssets()
    fetchCategories()
  }, [page, search, selectedCategory, statusFilter, conditionFilter])

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Aset berhasil dihapus')
        fetchAssets()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Gagal menghapus')
    } finally {
      setShowDeleteModal(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-500/20 text-green-500 border border-green-500/30',
      INACTIVE: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
      MAINTENANCE: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
      DISPOSED: 'bg-red-500/20 text-red-500 border border-red-500/30',
      LOST: 'bg-red-500/20 text-red-500 border border-red-500/30',
    }
    const labels: Record<string, string> = {
      ACTIVE: 'ACTIVE',
      INACTIVE: 'INACTIVE',
      MAINTENANCE: 'MAINTENANCE',
      DISPOSED: 'DISPOSED',
      LOST: 'LOST',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-mono ${styles[status] || 'bg-secondary text-muted-foreground'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getConditionBadge = (condition: string) => {
    const styles: Record<string, string> = {
      EXCELLENT: 'bg-green-500/20 text-green-500 border border-green-500/30',
      GOOD: 'bg-blue-500/20 text-blue-500 border border-blue-500/30',
      FAIR: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
      POOR: 'bg-orange-500/20 text-orange-500 border border-orange-500/30',
      BROKEN: 'bg-red-500/20 text-red-500 border border-red-500/30',
    }
    const labels: Record<string, string> = {
      EXCELLENT: 'EXCELLENT',
      GOOD: 'GOOD',
      FAIR: 'FAIR',
      POOR: 'POOR',
      BROKEN: 'BROKEN',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-mono ${styles[condition] || 'bg-secondary text-muted-foreground'}`}>
        {labels[condition] || condition}
      </span>
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
              <h1 className="text-3xl font-bold tracking-tight text-foreground">INVENTORY DATABASE</h1>
            </div>
            <p className="text-muted-foreground font-mono text-sm mt-2 ml-4">
              Asset Management — Real-time Tracking
            </p>
          </div>
          <Link
            href="/inventory/add"
            className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg px-4 py-2 font-mono text-sm transition-all duration-300 text-primary"
          >
            <Plus className="w-4 h-4" />
            ADD ASSET
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama, kode, atau serial number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground/50 font-mono text-sm"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground font-mono text-sm"
          >
            <option value="">ALL CATEGORIES</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground font-mono text-sm"
          >
            <option value="">ALL STATUS</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground font-mono text-sm"
          >
            <option value="">ALL CONDITION</option>
            <option value="EXCELLENT">EXCELLENT</option>
            <option value="GOOD">GOOD</option>
            <option value="FAIR">FAIR</option>
            <option value="POOR">POOR</option>
            <option value="BROKEN">BROKEN</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">CODE</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">ASSET NAME</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">CATEGORY</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">LOCATION</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">STATUS</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">CONDITION</th>
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground font-mono text-sm">LOADING DATA...</p>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-muted-foreground font-mono text-sm">NO ASSETS FOUND</p>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-secondary/30 transition-colors duration-150">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{asset.assetCode}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{asset.name}</p>
                      {asset.brand && (
                        <p className="text-xs font-mono text-muted-foreground">{asset.brand} {asset.model}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-foreground">{asset.category.name}</td>
                    <td className="px-6 py-4 text-foreground">{asset.location?.name || '-'}</td>
                    <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                    <td className="px-6 py-4">{getConditionBadge(asset.condition)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link href={`/inventory/${asset.id}`} className="p-1 text-primary hover:text-primary/80 transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/inventory/${asset.id}/edit`} className="p-1 text-yellow-500 hover:text-yellow-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setShowDeleteModal(asset.id)} className="p-1 text-destructive hover:text-destructive/80 transition-colors">
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Delete Asset</h2>
            <p className="text-muted-foreground mb-6">Apakah Anda yakin ingin menghapus aset ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-foreground">
                CANCEL
              </button>
              <button onClick={() => handleDelete(showDeleteModal)} className="px-4 py-2 bg-destructive/20 hover:bg-destructive/30 border border-destructive/50 rounded-lg text-destructive transition-colors">
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}