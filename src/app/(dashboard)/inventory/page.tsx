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
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(selectedCategory && { categoryId: selectedCategory }),
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
  }, [page, search, selectedCategory])

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
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
      DISPOSED: 'bg-red-100 text-red-800',
      LOST: 'bg-red-100 text-red-800',
    }
    const labels: Record<string, string> = {
      ACTIVE: 'Aktif',
      INACTIVE: 'Tidak Aktif',
      MAINTENANCE: 'Maintenance',
      DISPOSED: 'Dihapus',
      LOST: 'Hilang',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getConditionBadge = (condition: string) => {
    const styles: Record<string, string> = {
      EXCELLENT: 'bg-green-100 text-green-800',
      GOOD: 'bg-blue-100 text-blue-800',
      FAIR: 'bg-yellow-100 text-yellow-800',
      POOR: 'bg-orange-100 text-orange-800',
      BROKEN: 'bg-red-100 text-red-800',
    }
    const labels: Record<string, string> = {
      EXCELLENT: 'Sangat Baik',
      GOOD: 'Baik',
      FAIR: 'Cukup',
      POOR: 'Buruk',
      BROKEN: 'Rusak',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[condition] || 'bg-gray-100'}`}>
        {labels[condition] || condition}
      </span>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventaris Aset IT</h1>
          <p className="text-gray-500 mt-1">Kelola semua perangkat IT rumah sakit</p>
        </div>
        <Link
          href="/inventory/add"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Tambah Aset
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, kode, atau serial number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Kode</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nama Aset</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Lokasi</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Kondisi</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Belum ada data aset. Klik "Tambah Aset" untuk mulai.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">{asset.assetCode}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        {asset.brand && (
                          <p className="text-xs text-gray-500">{asset.brand} {asset.model}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{asset.category.name}</td>
                    <td className="px-6 py-4 text-sm">{asset.location?.name || '-'}</td>
                    <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                    <td className="px-6 py-4">{getConditionBadge(asset.condition)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/inventory/${asset.id}`}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/inventory/${asset.id}/edit`}
                          className="p-1 text-yellow-600 hover:text-yellow-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(asset.id)}
                          className="p-1 text-red-600 hover:text-red-800"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
              className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Hapus Aset</h2>
            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus aset ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}