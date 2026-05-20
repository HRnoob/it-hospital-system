'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

type PingStatus = 'UNCHECKED' | 'OK' | 'SLOW' | 'DOWN'
type ServiceStatus = 'UNCHECKED' | 'RUNNING' | 'DEGRADED' | 'DOWN'
type PhysicalStatus = 'UNCHECKED' | 'OK' | 'ISSUE' | 'CRITICAL'
type OverallStatus = 'NORMAL' | 'WARNING' | 'CRITICAL'

interface PingResult {
  name: string
  host: string
  status: PingStatus
  latency: number | null
}

export default function MorningCheckPage() {
  const [loading, setLoading] = useState(false)
  const [pinging, setPinging] = useState(false)
  const [existingCheck, setExistingCheck] = useState<any>(null)

  // Form state
  const [pingResults, setPingResults] = useState<PingResult[]>([
    { name: 'Google DNS', host: '8.8.8.8', status: 'UNCHECKED', latency: null },
    { name: 'Server SIMRS', host: '10.0.101.192', status: 'UNCHECKED', latency: null },
    { name: 'Server Database', host: '10.0.101.191', status: 'UNCHECKED', latency: null },
  ])

  const [form, setForm] = useState({
    simrsStatus: 'UNCHECKED' as ServiceStatus,
    pacsStatus: 'UNCHECKED' as ServiceStatus,
    unifiedStatus: 'UNCHECKED' as ServiceStatus,
    upsStatus: 'UNCHECKED' as PhysicalStatus,
    cableStatus: 'UNCHECKED' as PhysicalStatus,
    serverTempOk: false,
    acStatus: 'UNCHECKED' as PhysicalStatus,
    prtgAlertCount: 0,
    prtgNotes: '',
    totalAP: 0,
    onlineAP: 0,
    offlineAPList: '',
    notes: '',
    overallStatus: 'NORMAL' as OverallStatus,
  })

  // Load existing check today
  useEffect(() => {
    fetch('/api/morning-check')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setExistingCheck(data.data)
          // Pre-fill form dengan data yang sudah ada
          if (data.data.pingLatencyMs) {
            const latency = data.data.pingLatencyMs as any
            setPingResults([
              { name: 'Google DNS', host: '8.8.8.8', status: data.data.pingGoogle, latency: latency.google },
              { name: 'Server SIMRS', host: '10.0.101.192', status: data.data.pingSimrs, latency: latency.simrs },
              { name: 'Server Database', host: '10.0.101.191', status: data.data.pingDatabase, latency: latency.db },
            ])
          }
          setForm({
            simrsStatus: data.data.simrsStatus,
            pacsStatus: data.data.pacsStatus,
            unifiedStatus: data.data.unifiedStatus,
            upsStatus: data.data.upsStatus,
            cableStatus: data.data.cableStatus,
            serverTempOk: data.data.serverTempOk || false,
            acStatus: data.data.acStatus,
            prtgAlertCount: data.data.prtgAlertCount,
            prtgNotes: data.data.prtgNotes || '',
            totalAP: data.data.totalAP,
            onlineAP: data.data.onlineAP,
            offlineAPList: data.data.offlineAPList ? JSON.stringify(data.data.offlineAPList) : '',
            notes: data.data.notes || '',
            overallStatus: data.data.overallStatus,
          })
        }
      })
      .catch(console.error)
  }, [])

  const handlePingAll = async () => {
    setPinging(true)
    setPingResults(prev => prev.map(p => ({ ...p, status: 'UNCHECKED', latency: null })))

    try {
      const res = await fetch('/api/network/ping-all', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        const newResults = pingResults.map(result => {
          const found = data.data.find((r: any) => r.host === result.host)
          if (found) {
            return {
              ...result,
              status: found.status as PingStatus,
              latency: found.latency,
            }
          }
          return result
        })
        setPingResults(newResults)
        toast.success('Ping selesai!')
      }
    } catch (error) {
      toast.error('Gagal melakukan ping')
    } finally {
      setPinging(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      UNCHECKED: 'bg-gray-200 text-gray-600',
      OK: 'bg-green-500 text-white',
      RUNNING: 'bg-green-500 text-white',
      SLOW: 'bg-yellow-500 text-white',
      DEGRADED: 'bg-yellow-500 text-white',
      DOWN: 'bg-red-500 text-white',
      ISSUE: 'bg-orange-500 text-white',
      CRITICAL: 'bg-red-500 text-white',
    }
    const labels: Record<string, string> = {
      UNCHECKED: 'Belum Cek',
      OK: 'OK',
      RUNNING: 'Running',
      SLOW: 'Lambat',
      DEGRADED: 'Terdegradasi',
      DOWN: 'Down',
      ISSUE: 'Bermasalah',
      CRITICAL: 'Kritis',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || 'bg-gray-500 text-white'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const pingLatencyMs: Record<string, number | null> = {}
    pingResults.forEach(r => {
      if (r.name === 'Google DNS') pingLatencyMs.google = r.latency
      if (r.name === 'Server SIMRS') pingLatencyMs.simrs = r.latency
      if (r.name === 'Server Database') pingLatencyMs.db = r.latency
    })

    let offlineAPListArray = []
    try {
      offlineAPListArray = form.offlineAPList ? JSON.parse(form.offlineAPList) : []
    } catch {
      offlineAPListArray = form.offlineAPList.split(',').map(s => s.trim()).filter(Boolean)
    }

    const payload = {
      ...form,
      pingGoogle: pingResults[0].status,
      pingSimrs: pingResults[1].status,
      pingDatabase: pingResults[2].status,
      pingLatencyMs,
      offlineAPList: offlineAPListArray,
    }

    try {
      const res = await fetch('/api/morning-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Morning check berhasil disimpan!')
        setExistingCheck(data.data)
      } else {
        toast.error('Gagal menyimpan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  // Tampilkan view existing jika sudah ada
  if (existingCheck) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">✅ Morning check hari ini sudah diisi pada {new Date(existingCheck.completedAt).toLocaleTimeString()}</p>
          <button
            onClick={() => setExistingCheck(null)}
            className="mt-2 text-sm text-green-600 hover:text-green-800"
          >
            Edit / Isi ulang
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Morning Checklist - {new Date().toLocaleDateString('id-ID')}</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold mb-2">🌐 Status Jaringan</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>Google DNS: {getStatusBadge(existingCheck.pingGoogle)}</div>
                <div>SIMRS: {getStatusBadge(existingCheck.pingSimrs)}</div>
                <div>Database: {getStatusBadge(existingCheck.pingDatabase)}</div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-2">📱 Status Aplikasi</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>SIMRS: {getStatusBadge(existingCheck.simrsStatus)}</div>
                <div>PACS: {getStatusBadge(existingCheck.pacsStatus)}</div>
                <div>Unified: {getStatusBadge(existingCheck.unifiedStatus)}</div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-2">🖥️ Server Room</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>UPS: {getStatusBadge(existingCheck.upsStatus)}</div>
                <div>Kabel: {getStatusBadge(existingCheck.cableStatus)}</div>
                <div>AC: {getStatusBadge(existingCheck.acStatus)}</div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-2">📝 Catatan</h2>
              <p className="text-gray-600">{existingCheck.notes || '-'}</p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                Overall Status: {getStatusBadge(existingCheck.overallStatus)}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Morning Checklist</h1>
        <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Pengecekan Jaringan */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">🌐 Pengecekan Jaringan</h2>
          <div className="space-y-3">
            {pingResults.map((result, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{result.name}</p>
                  <p className="text-xs text-gray-500">{result.host}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(result.status)}
                  {result.latency && (
                    <p className="text-xs text-gray-500 mt-1">{result.latency} ms</p>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handlePingAll}
              disabled={pinging}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {pinging ? 'Pinging...' : 'Ping Sekarang'}
            </button>
          </div>
        </div>

        {/* Section 2: Status Aplikasi */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📱 Status Aplikasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">SIMRS</label>
              <select
                value={form.simrsStatus}
                onChange={(e) => setForm({ ...form, simrsStatus: e.target.value as ServiceStatus })}
                className="w-full p-2 border rounded"
              >
                <option value="UNCHECKED">Belum Cek</option>
                <option value="RUNNING">Running</option>
                <option value="DEGRADED">Degraded</option>
                <option value="DOWN">Down</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PACS Radiologi</label>
              <select
                value={form.pacsStatus}
                onChange={(e) => setForm({ ...form, pacsStatus: e.target.value as ServiceStatus })}
                className="w-full p-2 border rounded"
              >
                <option value="UNCHECKED">Belum Cek</option>
                <option value="RUNNING">Running</option>
                <option value="DEGRADED">Degraded</option>
                <option value="DOWN">Down</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unified Controller</label>
              <select
                value={form.unifiedStatus}
                onChange={(e) => setForm({ ...form, unifiedStatus: e.target.value as ServiceStatus })}
                className="w-full p-2 border rounded"
              >
                <option value="UNCHECKED">Belum Cek</option>
                <option value="RUNNING">Running</option>
                <option value="DEGRADED">Degraded</option>
                <option value="DOWN">Down</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: PRTG Recap */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📊 PRTG Recap (Semalam)</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Jumlah Alert</label>
              <input
                type="number"
                value={form.prtgAlertCount}
                onChange={(e) => setForm({ ...form, prtgAlertCount: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Catatan PRTG</label>
              <textarea
                value={form.prtgNotes}
                onChange={(e) => setForm({ ...form, prtgNotes: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Catatan dari alert PRTG semalam..."
              />
            </div>
          </div>
        </div>

        {/* Section 4: Access Point */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📶 Status Access Point</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total AP</label>
              <input
                type="number"
                value={form.totalAP}
                onChange={(e) => setForm({ ...form, totalAP: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">AP Online</label>
              <input
                type="number"
                value={form.onlineAP}
                onChange={(e) => setForm({ ...form, onlineAP: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">AP Offline (pisah dengan koma)</label>
            <input
              type="text"
              value={form.offlineAPList}
              onChange={(e) => setForm({ ...form, offlineAPList: e.target.value })}
              placeholder="Contoh: AP_Lobby, AP_Ruangan_1"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Section 5: Server Room Physical */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">🖥️ Server Room Physical</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">UPS</label>
              <select
                value={form.upsStatus}
                onChange={(e) => setForm({ ...form, upsStatus: e.target.value as PhysicalStatus })}
                className="w-full p-2 border rounded"
              >
                <option value="UNCHECKED">Belum Cek</option>
                <option value="OK">OK</option>
                <option value="ISSUE">Issue</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kondisi Kabel</label>
              <select
                value={form.cableStatus}
                onChange={(e) => setForm({ ...form, cableStatus: e.target.value as PhysicalStatus })}
                className="w-full p-2 border rounded"
              >
                <option value="UNCHECKED">Belum Cek</option>
                <option value="OK">OK</option>
                <option value="ISSUE">Issue</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">AC</label>
              <select
                value={form.acStatus}
                onChange={(e) => setForm({ ...form, acStatus: e.target.value as PhysicalStatus })}
                className="w-full p-2 border rounded"
              >
                <option value="UNCHECKED">Belum Cek</option>
                <option value="OK">OK</option>
                <option value="ISSUE">Issue</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.serverTempOk}
                  onChange={(e) => setForm({ ...form, serverTempOk: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Suhu Server Normal</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 6: Overall */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📝 Catatan & Status</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Catatan Umum</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Catatan penting hari ini..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Overall Status</label>
              <select
                value={form.overallStatus}
                onChange={(e) => setForm({ ...form, overallStatus: e.target.value as OverallStatus })}
                className="w-full p-2 border rounded"
              >
                <option value="NORMAL">Normal</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Morning Check'}
          </button>
        </div>
      </form>
    </div>
  )
}