'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

export default function EditAssetPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
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
    Promise.all([
      fetch('/api/inventory/categories').then(res => res.json()),
      fetch('/api/inventory/locations').then(res => res.json()),
      fetch(`/api/inventory/${id}`).then(res => res.json()),
    ]).then(([categoriesData, locationsData, assetData]) => {
      if (categoriesData.success) setCategories(categoriesData.data)
      if (locationsData.success) setLocations(locationsData.data)
      
      if (assetData.success) {
        const asset = assetData.data
        setForm({
          name: asset.name || '',
          brand: asset.brand || '',
          model: asset.model || '',
          serialNumber: asset.serialNumber || '',
          categoryId: asset.categoryId || '',
          locationId: asset.locationId || '',
          assignedTo: asset.assignedTo || '',
          status: asset.status || 'ACTIVE',
          condition: asset.condition || 'GOOD',
          purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
          warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : '',
          purchasePrice: asset.purchasePrice || '',
          vendor: asset.vendor || '',
          vendorContact: asset.vendorContact || '',
          ipAddress: asset.ipAddress || '',
          macAddress: asset.macAddress || '',
          osVersion: asset.osVersion || '',
          notes: asset.notes || '',
          rustdeskId: asset.rustdeskId || '',
          guacamoleId: asset.guacamoleId || '',
        })
      }
      setFetching(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Aset berhasil diupdate!')
        router.push('/inventory')
      } else {
        toast.error(data.message || 'Gagal mengupdate aset')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-3">Memuat data...</p>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-800">Edit Aset</h1>
          <p className="text-gray-500 mt-1">Ubah data perangkat IT</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Informasi Dasar</h2>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nama Aset</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Serial Number</label>
            <input
              type="text"
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Vendor</label>
            <input
              type="text"
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kontak Vendor</label>
            <input
              type="text"
              value={form.vendorContact}
              onChange={(e) => setForm({ ...form, vendorContact: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mt-4 mb-4 pb-2 border-b">Informasi Jaringan & Remote</h2>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">IP Address</label>
            <input
              type="text"
              value={form.ipAddress}
              onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">MAC Address</label>
            <input
              type="text"
              value={form.macAddress}
              onChange={(e) => setForm({ ...form, macAddress: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">OS Version</label>
            <input
              type="text"
              value={form.osVersion}
              onChange={(e) => setForm({ ...form, osVersion: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">RustDesk ID</label>
            <input
              type="text"
              value={form.rustdeskId}
              onChange={(e) => setForm({ ...form, rustdeskId: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Guacamole ID</label>
            <input
              type="text"
              value={form.guacamoleId}
              onChange={(e) => setForm({ ...form, guacamoleId: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Catatan</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

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
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  )
}