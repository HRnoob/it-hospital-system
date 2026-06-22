'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Wifi, Server, Calendar, User, MapPin, QrCode, Printer, ExternalLink, Move } from 'lucide-react'
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
  qrCodeUrl: string | null
  rustdeskId: string | null
  guacamoleId: string | null
  issues: any[]
  maintenanceLogs: any[]
}

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [generatingQR, setGeneratingQR] = useState(false)

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

  // Tambahkan state untuk movements
  const [movements, setMovements] = useState<any[]>([])
  const [loadingMovements, setLoadingMovements] = useState(false)

  // Fetch movements
  const fetchMovements = async () => {
    setLoadingMovements(true)
    try {
      const res = await fetch(`/api/inventory/${id}/movements`)
      const data = await res.json()
      if (data.success) {
        setMovements(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch movements')
    } finally {
      setLoadingMovements(false)
    }
  }

  // Panggil di useEffect
  useEffect(() => {
    fetchAsset()
    fetchMovements()
  }, [id])

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Aset berhasil dihapus')
        router.push('/inventory')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Gagal menghapus')
    }
  }

    const handleGenerateQR = async () => {
      setGeneratingQR(true)
      try {
        const res = await fetch(`/api/inventory/${id}/generate-qr`, { method: 'POST' })
        const data = await res.json()
        if (data.success) {
          toast.success('QR Code berhasil digenerate')
          fetchAsset() // refresh data
        } else {
          toast.error(data.message || 'Gagal generate QR Code')
        }
      } catch (error) {
        toast.error('Terjadi kesalahan')
      } finally {
        setGeneratingQR(false)
      }
    }

  const handlePrintQR = () => {
    if (!asset?.qrCodeUrl) {
      toast.error('QR Code belum tersedia')
      return
    }

    const printWindow = window.open()
    printWindow?.document.write(`
      <html>
        <head>
          <title>Cetak QR - ${asset.assetCode}</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              font-family: 'Courier New', monospace;
            }
            .qr-container {
              text-align: center;
            }
            .qr-container img {
              width: 300px;
              height: 300px;
            }
            .asset-code {
              font-size: 14px;
              font-weight: bold;
              margin-top: 10px;
            }
            .asset-name {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${window.location.origin}${asset.qrCodeUrl}" />
            <div class="asset-code">${asset.assetCode}</div>
            <div class="asset-name">${asset.name}</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            }
          <\/script>
        </body>
      </html>
    `)
    printWindow?.document.close()
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-3">Loading asset data...</p>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Asset not found</p>
        <Link href="/inventory" className="mt-4 inline-block text-primary hover:underline">
          Back to Inventory
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
            <Link href="/inventory" className="p-2 hover:bg-secondary/50 rounded-lg transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{asset.name}</h1>
              <p className="text-muted-foreground font-mono text-sm mt-1">{asset.assetCode}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/inventory/${asset.id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-lg text-yellow-500 transition">
              <Edit className="w-4 h-4" />
              EDIT
            </Link>
            <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-destructive/20 hover:bg-destructive/30 border border-destructive/50 rounded-lg text-destructive transition">
              <Trash2 className="w-4 h-4" />
              DELETE
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Informasi Dasar</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Kategori</p>
                  <p className="font-medium text-foreground">{asset.category.name}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Lokasi</p>
                  <p className="font-medium text-foreground">{asset.location?.name || '-'}</p>
                  {asset.location?.floor && (
                    <p className="text-xs text-muted-foreground">Lantai {asset.location.floor}, {asset.location.building}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Status</p>
                  <div>{getStatusBadge(asset.status)}</div>
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Kondisi</p>
                  <div>{getConditionBadge(asset.condition)}</div>
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Ditugaskan Kepada</p>
                  <p className="font-medium text-foreground">{asset.assignedTo || '-'}</p>
                </div>
              </div>
            </div>

            {/* Spesifikasi Card */}
            {(asset.brand || asset.model || asset.serialNumber || asset.osVersion) && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Spesifikasi</h2>
                <div className="grid grid-cols-2 gap-4">
                  {asset.brand && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Merek</p>
                      <p className="font-medium text-foreground">{asset.brand}</p>
                    </div>
                  )}
                  {asset.model && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Model</p>
                      <p className="font-medium text-foreground">{asset.model}</p>
                    </div>
                  )}
                  {asset.serialNumber && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Serial Number</p>
                      <p className="font-mono text-sm text-foreground">{asset.serialNumber}</p>
                    </div>
                  )}
                  {asset.osVersion && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">OS Version</p>
                      <p className="font-medium text-foreground">{asset.osVersion}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Network Info Card */}
            {(asset.ipAddress || asset.macAddress) && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-primary" />
                  Informasi Jaringan
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {asset.ipAddress && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">IP Address</p>
                      <p className="font-mono text-sm text-foreground">{asset.ipAddress}</p>
                    </div>
                  )}
                  {asset.macAddress && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">MAC Address</p>
                      <p className="font-mono text-sm text-foreground">{asset.macAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Purchase Info Card */}
            {(asset.purchaseDate || asset.warrantyExpiry || asset.vendor) && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Informasi Pembelian
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {asset.purchaseDate && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Tanggal Beli</p>
                      <p className="font-medium text-foreground">{new Date(asset.purchaseDate).toLocaleDateString('id-ID')}</p>
                    </div>
                  )}
                  {asset.warrantyExpiry && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Masa Garansi</p>
                      <p className="font-medium text-foreground">{new Date(asset.warrantyExpiry).toLocaleDateString('id-ID')}</p>
                    </div>
                  )}
                  {asset.purchasePrice && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Harga Beli</p>
                      <p className="font-medium text-foreground">Rp {asset.purchasePrice.toLocaleString('id-ID')}</p>
                    </div>
                  )}
                  {asset.vendor && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Vendor</p>
                      <p className="font-medium text-foreground">{asset.vendor}</p>
                      {asset.vendorContact && (
                        <p className="text-xs text-muted-foreground">{asset.vendorContact}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes Card */}
            {asset.notes && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Catatan</h2>
                <p className="text-foreground/80 whitespace-pre-wrap">{asset.notes}</p>
              </div>
            )}
          </div>

          {/* Riwayat Pemindahan Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
              <Move className="w-4 h-4 text-primary" />
              Riwayat Pemindahan
            </h2>
            
            {loadingMovements ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                <p className="text-xs text-muted-foreground mt-2">Memuat data...</p>
              </div>
            ) : movements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada riwayat pemindahan
              </p>
            ) : (
              <div className="space-y-3">
                {movements.map((movement) => (
                  <div key={movement.id} className="relative pl-4 pb-3 border-l-2 border-border last:pb-0">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {movement.fromLocation?.name || '-'} → {movement.toLocation?.name || '-'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Alasan: {movement.reason || '-'}
                        </p>
                        {movement.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Catatan: {movement.notes}
                          </p>
                        )}
                        <p className="text-xs font-mono text-muted-foreground mt-1">
                          Oleh: {movement.movedBy?.name} • {new Date(movement.movedAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Remote Access Card */}
            {(asset.rustdeskId || asset.guacamoleId) && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" />
                  Remote Access
                </h2>
                <div className="flex flex-col gap-3">
                  {asset.rustdeskId && (
                    <button
                      onClick={() => window.open(`rustdesk://connect/${asset.rustdeskId}`, '_blank')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg text-orange-500 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      RUSTDESK
                    </button>
                  )}
                  {asset.guacamoleId && (
                    <button
                      onClick={() => window.open(`/guacamole/#/client/${asset.guacamoleId}`, '_blank')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-500 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      GUACAMOLE
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* QR Code Card */}
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4 text-primary" />
                QR CODE
              </h2>
              
              {asset.qrCodeUrl ? (
                <>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img 
                      src={asset.qrCodeUrl} 
                      alt={asset.assetCode}
                      className="w-48 h-48 mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-3 break-all">
                    {asset.assetCode}
                  </p>
                  <button
                    onClick={handlePrintQR}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg py-2 font-mono text-sm transition-all duration-300 text-primary"
                  >
                    <Printer className="w-4 h-4" />
                    CETAK QR CODE
                  </button>
                </>
              ) : (
                <div className="bg-secondary/30 rounded-lg p-8 text-center">
                  <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm mb-3">QR Code belum tersedia</p>
                  <button
                    onClick={handleGenerateQR}
                    disabled={generatingQR}
                    className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary font-mono text-sm transition disabled:opacity-50"
                  >
                    {generatingQR ? 'GENERATING...' : 'GENERATE QR CODE'}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Statistik</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Total Kerusakan</p>
                  <p className="text-2xl font-bold text-foreground">{asset.issues?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">Total Maintenance</p>
                  <p className="text-2xl font-bold text-foreground">{asset.maintenanceLogs?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Delete Asset</h2>
            <p className="text-muted-foreground mb-6">Apakah Anda yakin ingin menghapus aset "{asset.name}"? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-foreground">
                CANCEL
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-destructive/20 hover:bg-destructive/30 border border-destructive/50 rounded-lg text-destructive transition-colors">
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}