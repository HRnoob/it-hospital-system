'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface Asset {
  id: string
  name: string
  assetCode: string
}

export default function AddIssuePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    assetId: '',
    priority: 'MEDIUM',
    category: '',
  })

  useEffect(() => {
    // Fetch assets for dropdown
    fetch('/api/inventory?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAssets(data.data)
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!form.title || !form.description) {
      toast.error('Judul dan deskripsi wajib diisi')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Laporan kerusakan berhasil dibuat!')
        router.push(`/issues/${data.data.id}`)
      } else {
        toast.error(data.message || 'Gagal membuat laporan')
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
          href="/issues"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lapor Kerusakan</h1>
          <p className="text-gray-500 mt-1">Buat tiket baru untuk masalah IT</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-3xl">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Judul Masalah <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Printer tidak mau mencetak"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
              placeholder="Jelaskan detail masalah, kapan terjadi, dan langkah yang sudah dicoba..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Aset Terkait</label>
            <select
              value={form.assetId}
              onChange={(e) => setForm({ ...form, assetId: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Aset (Opsional)</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.assetCode} - {asset.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prioritas</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CRITICAL">Critical (2 jam SLA)</option>
              <option value="HIGH">High (8 jam SLA)</option>
              <option value="MEDIUM">Medium (24 jam SLA)</option>
              <option value="LOW">Low (72 jam SLA)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hardware, Software, Jaringan, dll"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Link
            href="/issues"
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
            {loading ? 'Menyimpan...' : 'Buat Tiket'}
          </button>
        </div>
      </form>
    </div>
  )
}