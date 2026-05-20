'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Wifi, Server, Calendar, User, MapPin, Barcode, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

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
  location: { name: string; floor: string | null; building: string | null } | null
  assignedTo: string | null
  purchaseDate: string | null
  warrantyExpiry: string | null
  purchasePrice: number | null
  vendor: string | null
  vendorContact: string | null
  ipAddress: string | null
  macAddress: string | null
  osVersion: string | null
  notes: string | null
  rustdeskId: string | null
  guacamoleId: string | null
  issues: any[]
  maintenanceLogs: any[]
}

export default function AssetDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchAsset()
  }, [id])

  const fetchAsset = async () => {
    try {
      const res = await fetch(`/api/inventory/${id}`)
      const data = await res.json()
      if (data.success) {
        setAsset(data.data)
      } else {
        toast.error('Aset tidak ditemukan')
      }
    } catch (error) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Aset berhasil dihapus')
        window.location.href = '/inventory'
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Gagal menghapus')
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-3">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aset tidak ditemukan</p>
        <Link href="/inventory" className="mt-4 inline-block text-blue-600 hover:underline">
          Kembali ke daftar aset
        </Link>
      </div>
    )
  }

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/inventory"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{asset.name}</h1>
              <p className="text-gray-500 font-mono text-sm mt-1">{asset.assetCode}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/inventory/${asset.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Informasi Dasar</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Kategori</p>
                  <p className="font-medium">{asset.category.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lokasi</p>
                  <p className="font-medium">{asset.location?.name || '-'}</p>
                  {asset.location?.floor && (
                    <p className="text-xs text-gray-400">Lantai {asset.location.floor}, {asset.location.building}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <div>{getStatusBadge(asset.status)}</div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Kondisi</p>
                  <div>{getConditionBadge(asset.condition)}</div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ditugaskan Kepada</p>
                  <p className="font-medium">{asset.assignedTo || '-'}</p>
                </div>
              </div>
            </div>

            {/* Spesifikasi Card */}
            {(asset.brand || asset.model || asset.serialNumber || asset.osVersion) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Spesifikasi</h2>
                <div className="grid grid-cols-2 gap-4">
                  {asset.brand && (
                    <div>
                      <p className="text-xs text-gray-500">Merek</p>
                      <p className="font-medium">{asset.brand}</p>
                    </div>
                  )}
                  {asset.model && (
                    <div>
                      <p className="text-xs text-gray-500">Model</p>
                      <p className="font-medium">{asset.model}</p>
                    </div>
                  )}
                  {asset.serialNumber && (
                    <div>
                      <p className="text-xs text-gray-500">Serial Number</p>
                      <p className="font-mono text-sm">{asset.serialNumber}</p>
                    </div>
                  )}
                  {asset.osVersion && (
                    <div>
                      <p className="text-xs text-gray-500">OS Version</p>
                      <p className="font-medium">{asset.osVersion}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Network Info Card */}
            {(asset.ipAddress || asset.macAddress) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Informasi Jaringan
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {asset.ipAddress && (
                    <div>
                      <p className="text-xs text-gray-500">IP Address</p>
                      <p className="font-mono text-sm">{asset.ipAddress}</p>
                    </div>
                  )}
                  {asset.macAddress && (
                    <div>
                      <p className="text-xs text-gray-500">MAC Address</p>
                      <p className="font-mono text-sm">{asset.macAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Purchase Info Card */}
            {(asset.purchaseDate || asset.warrantyExpiry || asset.vendor) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Informasi Pembelian
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {asset.purchaseDate && (
                    <div>
                      <p className="text-xs text-gray-500">Tanggal Beli</p>
                      <p className="font-medium">{new Date(asset.purchaseDate).toLocaleDateString('id-ID')}</p>
                    </div>
                  )}
                  {asset.warrantyExpiry && (
                    <div>
                      <p className="text-xs text-gray-500">Masa Garansi</p>
                      <p className="font-medium">{new Date(asset.warrantyExpiry).toLocaleDateString('id-ID')}</p>
                    </div>
                  )}
                  {asset.purchasePrice && (
                    <div>
                      <p className="text-xs text-gray-500">Harga Beli</p>
                      <p className="font-medium">Rp {asset.purchasePrice.toLocaleString('id-ID')}</p>
                    </div>
                  )}
                  {asset.vendor && (
                    <div>
                      <p className="text-xs text-gray-500">Vendor</p>
                      <p className="font-medium">{asset.vendor}</p>
                      {asset.vendorContact && (
                        <p className="text-xs text-gray-400">{asset.vendorContact}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes Card */}
            {asset.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Catatan</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{asset.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Remote Access Card */}
            {(asset.rustdeskId || asset.guacamoleId) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Remote Access
                </h2>
                <div className="flex flex-col gap-3">
                  {asset.rustdeskId && (
                    <button
                      onClick={() => window.open(`rustdesk://connect/${asset.rustdeskId}`, '_blank')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                      RustDesk
                    </button>
                  )}
                  {asset.guacamoleId && (
                    <button
                      onClick={() => window.open(`/guacamole/#/client/${asset.guacamoleId}`, '_blank')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Guacamole
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* QR Code Card */}
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b flex items-center justify-center gap-2">
                <Barcode className="w-4 h-4" />
                QR Code
              </h2>
              <div className="bg-gray-100 rounded-lg p-4 mb-3">
                <p className="text-xs text-gray-500 font-mono break-all">{asset.assetCode}</p>
              </div>
              <button
                onClick={() => {
                  alert(`Scan QR untuk detail aset: ${asset.assetCode}\nURL: ${window.location.href}`)
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Cetak QR Code
              </button>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Statistik</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Total Kerusakan</p>
                  <p className="text-2xl font-bold">{asset.issues?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Maintenance</p>
                  <p className="text-2xl font-bold">{asset.maintenanceLogs?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Hapus Aset</h2>
            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus aset "{asset.name}"? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}