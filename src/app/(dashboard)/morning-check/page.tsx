'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Activity, Wifi, Server, Database, AlertTriangle, Zap, CheckCircle, XCircle, Clock } from 'lucide-react'

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
  const [radarActive, setRadarActive] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)

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

  useEffect(() => {
    fetch('/api/morning-check')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setExistingCheck(data.data)
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
    setRadarActive(true)
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
      setTimeout(() => setRadarActive(false), 1000)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK':
      case 'RUNNING':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'SLOW':
      case 'DEGRADED':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'DOWN':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      UNCHECKED: 'border-muted-foreground/30 text-muted-foreground',
      OK: 'border-green-500/50 text-green-500 bg-green-500/10',
      RUNNING: 'border-green-500/50 text-green-500 bg-green-500/10',
      SLOW: 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10',
      DEGRADED: 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10',
      DOWN: 'border-red-500/50 text-red-500 bg-red-500/10',
      ISSUE: 'border-orange-500/50 text-orange-500 bg-orange-500/10',
      CRITICAL: 'border-red-500/50 text-red-500 bg-red-500/10 animate-pulse',
    }
    const labels: Record<string, string> = {
      UNCHECKED: 'PENDING',
      OK: 'ONLINE',
      RUNNING: 'ACTIVE',
      SLOW: 'SLOW',
      DEGRADED: 'DEGRADED',
      DOWN: 'OFFLINE',
      ISSUE: 'ISSUE',
      CRITICAL: 'CRITICAL',
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-mono border ${styles[status] || styles.UNCHECKED}`}>
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
        setShowEditConfirm(false)
      } else {
        toast.error('Gagal menyimpan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleEditConfirm = () => {
    setExistingCheck(null)
    setShowEditConfirm(false)
  }

  const handleEditCancel = () => {
    setShowEditConfirm(false)
  }

  // Edit Confirm Modal
  if (showEditConfirm) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-foreground mb-4">Morning Check</h2>
          <p className="text-muted-foreground mb-6">Morning check hari ini sudah diisi. Lanjutkan edit?</p>
          <div className="flex gap-3 justify-end">
            <button onClick={handleEditCancel} className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-foreground font-mono">
              CANCEL
            </button>
            <button onClick={handleEditConfirm} className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary transition-colors font-mono">
              EDIT
            </button>
          </div>
        </div>
      </div>
    )
  }

  // View Existing Check (Read-only)
  if (existingCheck) {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Header Industrial */}
        <div className="mb-8 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">MORNING CHECK</h1>
            <span className="text-xs text-muted-foreground font-mono ml-auto">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <p className="text-muted-foreground font-mono text-sm mt-2 ml-4">
            Daily System Inspection — Pre-operation Checklist
          </p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-500 font-mono text-sm">
              CHECKLIST COMPLETED — {new Date(existingCheck.completedAt).toLocaleTimeString()}
            </p>
            <button
              onClick={() => setShowEditConfirm(true)}
              className="ml-auto text-xs font-mono text-green-500 hover:text-green-400 transition-colors"
            >
              [EDIT]
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wifi className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-mono font-bold tracking-wider text-primary">NETWORK STATUS</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span className="font-mono text-sm">Google DNS</span>
                  {getStatusBadge(existingCheck.pingGoogle)}
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span className="font-mono text-sm">SIMRS Server</span>
                  {getStatusBadge(existingCheck.pingSimrs)}
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span className="font-mono text-sm">Database Server</span>
                  {getStatusBadge(existingCheck.pingDatabase)}
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Server className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-mono font-bold tracking-wider text-primary">APPLICATION STATUS</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span className="font-mono text-sm">SIMRS</span>
                  {getStatusBadge(existingCheck.simrsStatus)}
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span className="font-mono text-sm">PACS</span>
                  {getStatusBadge(existingCheck.pacsStatus)}
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span className="font-mono text-sm">Unified</span>
                  {getStatusBadge(existingCheck.unifiedStatus)}
                </div>
              </div>
            </div>
          </div>

          {existingCheck.notes && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs font-mono text-muted-foreground mb-1">NOTES</p>
              <p className="text-sm text-foreground">{existingCheck.notes}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <span className="px-3 py-1 rounded text-xs font-mono bg-primary/10 text-primary">
              OVERALL: {existingCheck.overallStatus}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Form untuk create new check
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Industrial */}
      <div className="mb-8 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary rounded-full animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">MORNING CHECK</h1>
          <span className="text-xs text-muted-foreground font-mono ml-auto">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <p className="text-muted-foreground font-mono text-sm mt-2 ml-4">
          Daily System Inspection — Pre-operation Checklist
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Network Status Card */}
            <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-mono font-bold tracking-wider text-primary">NETWORK STATUS</h3>
                </div>
                <button
                  type="button"
                  onClick={handlePingAll}
                  disabled={pinging}
                  className="relative group px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-all duration-300"
                >
                  <div className={`absolute inset-0 rounded-lg bg-primary/20 transition-opacity duration-500 ${radarActive ? 'animate-ping opacity-100' : 'opacity-0'}`} />
                  <span className="relative text-xs font-mono flex items-center gap-1 text-foreground">
                    <Activity className={`w-3 h-3 ${pinging ? 'animate-spin' : ''}`} />
                    {pinging ? 'SCANNING...' : 'PING ALL'}
                  </span>
                </button>
              </div>
              <div className="space-y-3">
                {pingResults.map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <div>
                      <p className="font-mono text-sm font-medium text-foreground">{result.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">{result.host}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(result.status)}
                      {result.latency && (
                        <p className="text-xs font-mono text-muted-foreground mt-1">{result.latency} ms</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PRTG Recap Card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-mono font-bold tracking-wider text-primary">PRTG RECAP</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">ALERT COUNT</label>
                  <input
                    type="number"
                    value={form.prtgAlertCount}
                    onChange={(e) => setForm({ ...form, prtgAlertCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">NOTES</label>
                  <textarea
                    value={form.prtgNotes}
                    onChange={(e) => setForm({ ...form, prtgNotes: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    rows={3}
                    placeholder="Alert details from last night..."
                  />
                </div>
              </div>
            </div>

            {/* Server Room Card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Server className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-mono font-bold tracking-wider text-primary">SERVER ROOM</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">UPS</label>
                  <select
                    value={form.upsStatus}
                    onChange={(e) => setForm({ ...form, upsStatus: e.target.value as PhysicalStatus })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="UNCHECKED">PENDING</option>
                    <option value="OK">OK</option>
                    <option value="ISSUE">ISSUE</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">CABLES</label>
                  <select
                    value={form.cableStatus}
                    onChange={(e) => setForm({ ...form, cableStatus: e.target.value as PhysicalStatus })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="UNCHECKED">PENDING</option>
                    <option value="OK">OK</option>
                    <option value="ISSUE">ISSUE</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">AC</label>
                  <select
                    value={form.acStatus}
                    onChange={(e) => setForm({ ...form, acStatus: e.target.value as PhysicalStatus })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="UNCHECKED">PENDING</option>
                    <option value="OK">OK</option>
                    <option value="ISSUE">ISSUE</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div className="flex items-center justify-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.serverTempOk}
                      onChange={(e) => setForm({ ...form, serverTempOk: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-mono text-foreground">TEMP OK</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Application Status Card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-mono font-bold tracking-wider text-primary">APPLICATION STATUS</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">SIMRS</label>
                  <select
                    value={form.simrsStatus}
                    onChange={(e) => setForm({ ...form, simrsStatus: e.target.value as ServiceStatus })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="UNCHECKED">PENDING</option>
                    <option value="RUNNING">RUNNING</option>
                    <option value="DEGRADED">DEGRADED</option>
                    <option value="DOWN">DOWN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">PACS</label>
                  <select
                    value={form.pacsStatus}
                    onChange={(e) => setForm({ ...form, pacsStatus: e.target.value as ServiceStatus })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="UNCHECKED">PENDING</option>
                    <option value="RUNNING">RUNNING</option>
                    <option value="DEGRADED">DEGRADED</option>
                    <option value="DOWN">DOWN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">UNIFIED CONTROLLER</label>
                  <select
                    value={form.unifiedStatus}
                    onChange={(e) => setForm({ ...form, unifiedStatus: e.target.value as ServiceStatus })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="UNCHECKED">PENDING</option>
                    <option value="RUNNING">RUNNING</option>
                    <option value="DEGRADED">DEGRADED</option>
                    <option value="DOWN">DOWN</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Access Point Card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-mono font-bold tracking-wider text-primary">ACCESS POINT</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">TOTAL AP</label>
                  <input
                    type="number"
                    value={form.totalAP}
                    onChange={(e) => setForm({ ...form, totalAP: parseInt(e.target.value) || 0 })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">ONLINE</label>
                  <input
                    type="number"
                    value={form.onlineAP}
                    onChange={(e) => setForm({ ...form, onlineAP: parseInt(e.target.value) || 0 })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">OFFLINE AP (comma separated)</label>
                <input
                  type="text"
                  value={form.offlineAPList}
                  onChange={(e) => setForm({ ...form, offlineAPList: e.target.value })}
                  placeholder="AP_Lobby, AP_Ruangan_1"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>
            </div>

            {/* Notes & Submit Card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">GENERAL NOTES</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    rows={3}
                    placeholder="Important notes for today..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">OVERALL STATUS</label>
                  <select
                    value={form.overallStatus}
                    onChange={(e) => setForm({ ...form, overallStatus: e.target.value as OverallStatus })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="WARNING">WARNING</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg py-3 font-mono text-sm transition-all duration-300 text-primary"
                >
                  {loading ? 'SAVING...' : 'SAVE CHECKLIST'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}