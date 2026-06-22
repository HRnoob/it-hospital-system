'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Move, X } from 'lucide-react'
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
  category: { id: string; name: string }
  location: { id: string; name: string } | null
  qrCodeUrl: string | null
  createdAt: string
}

interface Category {
  id: string
  name: string
}

interface Location {
  id: string
  name: string
}

export default function InventoryPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  
  // State untuk move modal
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [movingAsset, setMovingAsset] = useState<Asset | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [moveReason, setMoveReason] = useState('')
  const [moveNotes, setMoveNotes] = useState('')
  const [moving, setMoving] = useState(false)
  
  // Active tab
  const [activeTab, setActiveTab] = useState('all')

  // Ambil semua kategori untuk tabs
  useEffect(() => {
    fetch('/api/inventory/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.data)
        }
      })
      .catch(console.error)
    
    fetch('/api/inventory/locations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLocations(data.data)
        }
      })
      .catch(console.error)
  }, [])

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(activeTab !== 'all' && { categoryId: activeTab }),
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

  useEffect(() => {
    fetchAssets()
  }, [page, search, activeTab, statusFilter, conditionFilter])

  useEffect(() => {
    if (selectAll) {
      setSelectedAssets(assets.map(a => a.id))
    } else {
      setSelectedAssets([])
    }
  }, [selectAll, assets])

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

  const handleMove = async () => {
    if (!movingAsset || !selectedLocationId) {
      toast.error('Pilih lokasi tujuan')
      return
    }

    setMoving(true)
    try {
      const res = await fetch(`/api/inventory/${movingAsset.id}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toLocationId: selectedLocationId,
          reason: moveReason || 'Pemindahan Ruangan',
          notes: moveNotes || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        setShowMoveModal(false)
        setMovingAsset(null)
        setSelectedLocationId('')
        setMoveReason('')
        setMoveNotes('')
        fetchAssets()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Gagal memindahkan aset')
    } finally {
      setMoving(false)
    }
  }

  const handlePrintQRCode = async () => {
    if (selectedAssets.length === 0) {
      toast.error('Pilih aset terlebih dahulu')
      return
    }

    toast.loading('Menyiapkan QR Code...')
    try {
      const res = await fetch('/api/inventory/print-qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetIds: selectedAssets })
      })
      const html = await res.text()
      const printWindow = window.open()
      printWindow?.document.write(html)
      printWindow?.document.close()
      toast.dismiss()
      toast.success('QR Code siap dicetak')
    } catch (error) {
      toast.dismiss()
      toast.error('Gagal mencetak QR Code')
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

  const toggleAssetSelection = (id: string) => {
    setSelectedAssets(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
    setSelectAll(false)
  }

  // Tabs: "all" + semua kategori
  const tabs = [{ id: 'all', name: 'SEMUA', icon: '📦' }, ...categories.map(c => ({ id: c.id, name: c.name, icon: '📁' }))]

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
          <div className="flex gap-3">
            {selectedAssets.length > 0 && (
              <button
                onClick={handlePrintQRCode}
                className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg px-4 py-2 font-mono text-sm transition-all duration-300 text-green-500"
              >
                CETAK QR ({selectedAssets.length})
              </button>
            )}
            <Link
              href="/inventory/add"
              className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg px-4 py-2 font-mono text-sm transition-all duration-300 text-primary"
            >
              <Plus className="w-4 h-4" />
              ADD ASSET
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 font-mono text-sm transition-all duration-200
                ${activeTab === tab.id 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-muted-foreground hover:text-foreground'}
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
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
                <th className="text-left px-6 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider w-10">
                  <button onClick={() => setSelectAll(!selectAll)}>
                    {selectAll ? <span className="text-primary">☑</span> : <span className="text-muted-foreground">☐</span>}
                  </button>
                </th>
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
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground font-mono text-sm">LOADING DATA...</p>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-muted-foreground font-mono text-sm">NO ASSETS FOUND</p>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-secondary/30 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <button onClick={() => toggleAssetSelection(asset.id)}>
                        {selectedAssets.includes(asset.id) ? (
                          <span className="text-primary">☑</span>
                        ) : (
                          <span className="text-muted-foreground">☐</span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{asset.assetCode}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{asset.name}</p>
                      {asset.brand && (
                        <p className="text-xs font-mono text-muted-foreground">{asset.brand} {asset.model}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-foreground">{asset.category.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{asset.location?.name || '-'}</span>
                        <button
                          onClick={() => {
                            setMovingAsset(asset)
                            setSelectedLocationId(asset.location?.id || '')
                            setMoveReason('')
                            setMoveNotes('')
                            setShowMoveModal(true)
                          }}
                          className="p-1 text-primary hover:text-primary/80 transition-colors"
                          title="Pindahkan aset"
                        >
                          <Move className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
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

      {/* Move Modal */}
      {showMoveModal && movingAsset && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">Pindahkan Aset</h2>
              <button onClick={() => setShowMoveModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-secondary/30 rounded-lg">
              <p className="text-sm text-foreground font-medium">{movingAsset.name}</p>
              <p className="text-xs font-mono text-muted-foreground">{movingAsset.assetCode}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Lokasi saat ini: <span className="text-foreground">{movingAsset.location?.name || '-'}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-1">Lokasi Tujuan *</label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Pilih lokasi...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-1">Alasan Pemindahan</label>
                <select
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Pilih alasan...</option>
                  <option value="Pemindahan Ruangan">Pemindahan Ruangan</option>
                  <option value="Mutasi Karyawan">Mutasi Karyawan</option>
                  <option value="Perbaikan">Perbaikan</option>
                  <option value="Penggantian">Penggantian</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-1">Catatan (opsional)</label>
                <textarea
                  value={moveNotes}
                  onChange={(e) => setMoveNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Catatan tambahan..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-foreground"
              >
                BATAL
              </button>
              <button
                onClick={handleMove}
                disabled={moving || !selectedLocationId}
                className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary transition-colors disabled:opacity-50"
              >
                {moving ? 'MEMINDAHKAN...' : 'PINDAHKAN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}