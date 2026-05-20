'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Location {
  id: string
  name: string
}

export default function AddAssetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  const [form, setForm] = useState({
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    categoryId: '',
    locationId: '',
    assignedTo: '',
    status: 'ACTIVE',
    condition: 'GOOD',
    purchaseDate: '',
    warrantyExpiry: '',
    purchasePrice: '',
    vendor: '',
    vendorContact: '',
    ipAddress: '',
    macAddress: '',
    osVersion: '',
    notes: '',
    rustdeskId: '',
    guacamoleId: '',
  })

  useEffect(() => {
    // Fetch categories and locations
    Promise.all([
      fetch('/api/inventory/categories').then(res => res.json()),
      fetch('/api/inventory/locations').then(res => res.json()),
    ]).then(([categoriesData, locationsData]) => {
      if (categoriesData.success) setCategories(categoriesData.data)
      if (locationsData.success) setLocations(locationsData.data)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Aset berhasil ditambahkan!')
        router.push('/inventory')
      } else {
        toast.error(data.message || 'Gagal menambahkan aset')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/inventory"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tambah Aset Baru</h1>
          <p className="text-gray-500 mt-1">Masukkan data perangkat IT baru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Informasi Dasar</h2>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nama Aset <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: PC Admin Lt.2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Merek</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Dell, HP, Epson"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: OptiPlex 3080, ProBook 450"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Serial Number</label>
            <input
              type="text"
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Serial number perangkat"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lokasi</label>
            <select
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Lokasi</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ditugaskan Kepada</label>
            <input
              type="text"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama pengguna / staf"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Tidak Aktif</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="DISPOSED">Dihapus</option>
              <option value="LOST">Hilang</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kondisi</label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EXCELLENT">Sangat Baik</option>
              <option value="GOOD">Baik</option>
              <option value="FAIR">Cukup</option>
              <option value="POOR">Buruk</option>
              <option value="BROKEN">Rusak</option>
            </select>
          </div>

          {/* Purchase Info */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mt-4 mb-4 pb-2 border-b">Informasi Pembelian</h2>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Pembelian</label>
            <input
              type="date"
              value={form.purchaseDate}
              onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Masa Garansi</label>
            <input
              type="date"
              value={form.warrantyExpiry}
              onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Harga Beli</label>
            <input
              type="number"
              value={form.purchasePrice}
              onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Vendor</label>
            <input
              type="text"
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama vendor/supplier"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kontak Vendor</label>
            <input
              type="text"
              value={form.vendorContact}
              onChange={(e) => setForm({ ...form, vendorContact: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Telepon/Email vendor"
            />
          </div>

          {/* Network Info */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mt-4 mb-4 pb-2 border-b">Informasi Jaringan</h2>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">IP Address</label>
            <input
              type="text"
              value={form.ipAddress}
              onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="192.168.1.100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">MAC Address</label>
            <input
              type="text"
              value={form.macAddress}
              onChange={(e) => setForm({ ...form, macAddress: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="XX:XX:XX:XX:XX:XX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">OS Version</label>
            <input
              type="text"
              value={form.osVersion}
              onChange={(e) => setForm({ ...form, osVersion: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Windows 11 Pro, Ubuntu 22.04"
            />
          </div>

          {/* Remote Access */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mt-4 mb-4 pb-2 border-b">Remote Access</h2>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">RustDesk ID</label>
            <input
              type="text"
              value={form.rustdeskId}
              onChange={(e) => setForm({ ...form, rustdeskId: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ID perangkat di RustDesk"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Guacamole ID</label>
            <input
              type="text"
              value={form.guacamoleId}
              onChange={(e) => setForm({ ...form, guacamoleId: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Connection ID di Guacamole"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Catatan</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Catatan tambahan..."
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Link
            href="/inventory"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Simpan Aset'}
          </button>
        </div>
      </form>
    </div>
  )
}