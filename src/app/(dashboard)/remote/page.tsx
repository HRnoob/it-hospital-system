'use client'

import { useState, useEffect } from 'react'
import { Monitor, Wifi, WifiOff, ExternalLink, Search, MapPin, Cpu } from 'lucide-react'
import toast from 'react-hot-toast'

interface RemoteDevice {
  id: string
  name: string
  assetCode: string
  rustdeskId: string | null
  guacamoleId: string | null
  ipAddress: string | null
  location: { name: string } | null
  category: { name: string }
  status: string
}

export default function RemotePage() {
  const [devices, setDevices] = useState<RemoteDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/remote/devices')
      const data = await res.json()
      if (data.success) {
        setDevices(data.data)
        // Cek status online untuk devices dengan IP
        checkOnlineStatus(data.data)
      }
    } catch (error) {
      toast.error('Gagal memuat daftar device')
    } finally {
      setLoading(false)
    }
  }

  const checkOnlineStatus = async (deviceList: RemoteDevice[]) => {
    const statusMap: Record<string, boolean> = {}
    
    for (const device of deviceList) {
      if (device.ipAddress) {
        try {
          const res = await fetch('/api/network/ping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host: device.ipAddress }),
          })
          const data = await res.json()
          statusMap[device.id] = data.data?.status === 'OK'
        } catch {
          statusMap[device.id] = false
        }
      } else {
        statusMap[device.id] = true // Default true jika tidak ada IP
      }
    }
    setOnlineStatus(statusMap)
  }

  const handleRustDeskConnect = (rustdeskId: string, deviceName: string) => {
    // Log session (opsional)
    console.log(`Remote access to ${deviceName} via RustDesk at ${new Date().toISOString()}`)
    
    // Buka RustDesk client
    window.open(`rustdesk://connect/${rustdeskId}`, '_blank')
    
    toast.success(`Menghubungkan ke ${deviceName}...`)
  }

  const handleGuacamoleConnect = (guacamoleId: string, deviceName: string) => {
    const guacamoleUrl = process.env.NEXT_PUBLIC_GUACAMOLE_URL || 'http://localhost:8082'
    
    // Log session
    console.log(`Remote access to ${deviceName} via Guacamole at ${new Date().toISOString()}`)
    
    // Buka Guacamole web client
    window.open(`${guacamoleUrl}/guacamole/#/client/${guacamoleId}`, '_blank')
    
    toast.success(`Membuka session remote untuk ${deviceName}...`)
  }

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(search.toLowerCase()) ||
    device.assetCode.toLowerCase().includes(search.toLowerCase()) ||
    device.location?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary rounded-full animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight">REMOTE ACCESS</h1>
          <span className="text-xs text-muted-foreground font-mono ml-auto">
            <span className="text-green-500">●</span> {devices.length} devices
          </span>
        </div>
        <p className="text-muted-foreground font-mono text-sm mt-2 ml-4">
          Secure Remote Control — RustDesk · Guacamole
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari device (nama, kode, lokasi)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredDevices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Tidak Ada Device Remote</h3>
          <p className="text-gray-400 mt-1">
            Tambahkan RustDesk ID atau Guacamole ID pada halaman Inventaris
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <div key={device.id} className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition">
              {/* Status Badge */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-gray-500" />
                  <span className="font-mono text-xs text-gray-400">{device.assetCode}</span>
                </div>
                <div className="flex items-center gap-1">
                  {device.ipAddress ? (
                    onlineStatus[device.id] ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <Wifi className="w-3 h-3" />
                        Online
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-xs">
                        <WifiOff className="w-3 h-3" />
                        Offline
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-gray-400">No IP</span>
                  )}
                </div>
              </div>

              {/* Device Info */}
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{device.name}</h3>
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3 h-3" />
                  <span>{device.category.name}</span>
                </div>
                {device.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{device.location.name}</span>
                  </div>
                )}
                {device.ipAddress && (
                  <div className="font-mono text-xs text-gray-400">
                    IP: {device.ipAddress}
                  </div>
                )}
              </div>

              {/* Remote Buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t">
                {device.rustdeskId && (
                  <button
                    onClick={() => handleRustDeskConnect(device.rustdeskId!, device.name)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    RustDesk
                  </button>
                )}
                {device.guacamoleId && (
                  <button
                    onClick={() => handleGuacamoleConnect(device.guacamoleId!, device.name)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Guacamole
                  </button>
                )}
              </div>

              {/* No Remote Config */}
              {!device.rustdeskId && !device.guacamoleId && (
                <div className="text-center py-2 text-xs text-gray-400 bg-gray-50 rounded">
                  Belum dikonfigurasi untuk remote
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Informasi Remote Access</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• <strong>RustDesk</strong>: Membuka aplikasi RustDesk client (harus terinstall)</li>
          <li>• <strong>Guacamole</strong>: Membuka session RDP/SSH via browser</li>
          <li>• Status online/offline berdasarkan ping ke IP address device</li>
          <li>• Pastikan device sudah dikonfigurasi RustDesk ID atau Guacamole ID di halaman Inventaris</li>
        </ul>
      </div>
    </div>
  )
}