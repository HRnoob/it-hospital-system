'use client'

import { useState } from 'react'
import { FileText, Download, Calendar, Printer, TrendingUp, Package, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

interface ReportData {
  morningCheck?: any
  issues?: any[]
  totalIssues?: number
  totalAssets?: number
  openIssues?: number
  resolvedIssues?: number
  totalMorningChecks?: number
  issuesByPriority?: { priority: string; _count: number }[]
  issuesByStatus?: { status: string; _count: number }[]
  assets?: any[]
  assetsByCategory?: any[]
  assetsByStatus?: any[]
  period?: { startDate: string; endDate: string }
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState('daily_summary')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [generated, setGenerated] = useState(false)

  const reportTypes = [
    { id: 'daily_summary', name: 'Laporan Harian', icon: Calendar, description: 'Ringkasan morning check dan issues hari ini' },
    { id: 'monthly_summary', name: 'Laporan Bulanan', icon: TrendingUp, description: 'Statistik lengkap performa IT bulanan' },
    { id: 'asset_report', name: 'Laporan Inventaris', icon: Package, description: 'Daftar lengkap semua aset IT' },
    { id: 'issue_report', name: 'Laporan Kerusakan', icon: AlertCircle, description: 'Detail semua tiket kerusakan' },
  ]

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportType,
          startDate,
          endDate,
        }),
      })
      const result = await res.json()
      if (result.success) {
        setReportData(result.data)
        setGenerated(true)
        toast.success('Laporan berhasil digenerate')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Gagal generate laporan')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    toast.success('Fitur PDF akan segera hadir!')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportExcel = async () => {
    toast.loading('Menyiapkan file Excel...')
    try {
      let exportType = 'assets'
      if (reportType === 'issue_report') exportType = 'issues'
      else if (reportType === 'asset_report') exportType = 'assets'
      else exportType = 'issues'
      
      const res = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: exportType,
          startDate,
          endDate 
        }),
      })
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}-${startDate}-to-${endDate}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.dismiss()
      toast.success('Export Excel berhasil')
    } catch (error) {
      toast.dismiss()
      toast.error('Gagal export Excel')
    }
  }

  const currentReport = reportTypes.find(r => r.id === reportType)

  return (
    <div>
      {/* Header */}
      <div className="mb-8 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary rounded-full animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">REPORTS & ANALYTICS</h1>
          <span className="text-xs text-muted-foreground font-mono ml-auto">
            Export · Print · Share
          </span>
        </div>
        <p className="text-muted-foreground font-mono text-sm mt-2 ml-4">
          Data Visualization — Performance Metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Report Selector */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Jenis Laporan</h2>
            <div className="space-y-3">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setReportType(type.id)
                    setGenerated(false)
                    setReportData(null)
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    reportType === type.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-secondary/30 border border-border hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <type.icon className={`w-5 h-5 mt-0.5 ${
                      reportType === type.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div>
                      <p className={`font-medium ${
                        reportType === type.id ? 'text-primary' : 'text-foreground'
                      }`}>
                        {type.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <label className="block text-sm font-mono text-muted-foreground mb-2">Periode Laporan</label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-muted-foreground">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-6 bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary font-mono py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'GENERATING...' : 'GENERATE REPORT'}
            </button>

            {generated && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleExportPDF}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-mono text-sm text-foreground"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-mono text-sm text-foreground"
                >
                  <Printer className="w-4 h-4" />
                  PRINT
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-mono text-sm text-foreground"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  EXCEL
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-2">
          {!generated ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">Belum Ada Laporan</h3>
              <p className="text-muted-foreground mt-1 font-mono text-sm">
                Pilih jenis laporan dan periode, lalu klik "Generate Report"
              </p>
            </div>
          ) : (
            <div className="space-y-6" id="report-content">
              {/* Report Header */}
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <h2 className="text-2xl font-bold text-foreground">IT Hospital System</h2>
                <p className="text-muted-foreground mt-1 font-mono">Laporan {currentReport?.name}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Periode: {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dicetak: {new Date().toLocaleString('id-ID')}
                </p>
              </div>

              {/* Daily Summary Report */}
              {reportType === 'daily_summary' && reportData && (
                <>
                  {reportData.morningCheck && (
                    <div className="bg-card border border-border rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Morning Checklist</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-mono text-muted-foreground">Status Jaringan</p>
                          <p className="text-sm text-foreground">Internet: {reportData.morningCheck.pingGoogle}</p>
                          <p className="text-sm text-foreground">SIMRS: {reportData.morningCheck.pingSimrs}</p>
                          <p className="text-sm text-foreground">Database: {reportData.morningCheck.pingDatabase}</p>
                        </div>
                        <div>
                          <p className="text-xs font-mono text-muted-foreground">Status Aplikasi</p>
                          <p className="text-sm text-foreground">SIMRS: {reportData.morningCheck.simrsStatus}</p>
                          <p className="text-sm text-foreground">PACS: {reportData.morningCheck.pacsStatus}</p>
                        </div>
                      </div>
                      {reportData.morningCheck.notes && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs font-mono text-muted-foreground">Catatan</p>
                          <p className="text-sm text-foreground">{reportData.morningCheck.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                      Laporan Kerusakan Hari Ini ({reportData.totalIssues} tiket)
                    </h3>
                    {reportData.issues && reportData.issues.length > 0 ? (
                      <div className="space-y-3">
                        {reportData.issues.map((issue: any) => (
                          <div key={issue.id} className="p-3 bg-secondary/30 rounded-lg border border-border">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-foreground">{issue.title}</p>
                                <p className="text-xs font-mono text-muted-foreground mt-1">{issue.ticketNumber}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-mono ${
                                issue.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                                issue.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                                'bg-yellow-500/20 text-yellow-500'
                              }`}>
                                {issue.priority}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mt-2">{issue.description}</p>
                            {issue.asset && (
                              <p className="text-xs font-mono text-muted-foreground mt-1">Aset: {issue.asset.name}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4 font-mono">Tidak ada laporan kerusakan hari ini</p>
                    )}
                  </div>
                </>
              )}

              {/* Monthly Summary Report */}
              {reportType === 'monthly_summary' && reportData && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-xl p-6 text-center">
                      <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-foreground">{reportData.totalAssets || 0}</p>
                      <p className="text-xs font-mono text-muted-foreground">Total Aset</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 text-center">
                      <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                      <p className="text-2xl font-bold text-foreground">{reportData.openIssues || 0}</p>
                      <p className="text-xs font-mono text-muted-foreground">Issues Open</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 text-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-foreground">{reportData.resolvedIssues || 0}</p>
                      <p className="text-xs font-mono text-muted-foreground">Issues Resolved</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 text-center">
                      <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-foreground">{reportData.totalMorningChecks || 0}</p>
                      <p className="text-xs font-mono text-muted-foreground">Morning Check</p>
                    </div>
                  </div>

                  {reportData.issuesByPriority && reportData.issuesByPriority.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Issues by Priority</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={reportData.issuesByPriority}
                            dataKey="_count"
                            nameKey="priority"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {reportData.issuesByPriority.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}

              {/* Asset Report */}
              {reportType === 'asset_report' && reportData && (
                <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
                  <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                    Daftar Aset ({reportData.totalAssets} item)
                  </h3>
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-mono text-muted-foreground">Kode</th>
                        <th className="px-3 py-2 text-left text-xs font-mono text-muted-foreground">Nama</th>
                        <th className="px-3 py-2 text-left text-xs font-mono text-muted-foreground">Kategori</th>
                        <th className="px-3 py-2 text-left text-xs font-mono text-muted-foreground">Lokasi</th>
                        <th className="px-3 py-2 text-left text-xs font-mono text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {reportData.assets?.map((asset: any) => (
                        <tr key={asset.id}>
                          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{asset.assetCode}</td>
                          <td className="px-3 py-2 text-foreground">{asset.name}</td>
                          <td className="px-3 py-2 text-foreground">{asset.category?.name}</td>
                          <td className="px-3 py-2 text-foreground">{asset.location?.name || '-'}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                              asset.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' :
                              asset.status === 'MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-red-500/20 text-red-500'
                            }`}>
                              {asset.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Issue Report */}
              {reportType === 'issue_report' && reportData && (
                <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
                  <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                    Daftar Kerusakan ({reportData.totalIssues} tiket)
                  </h3>
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-mono text-muted-foreground">Tiket</th>
                        <th className="px-3 py-2 text-left text-xs font-mono text-muted-foreground">Judul</th>
                        <th className="px-3 py-2 text-left text-xs font-mono text-muted-foreground">Prioritas</th>
                        <th className="px-3 py-2 text-left text-xs font-mono text-muted-foreground">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-mono text-muted-foreground">Pelapor</th>
                        <th className="px-3 py-2 text-left text-xs font-mono text-muted-foreground">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {reportData.issues?.map((issue: any) => (
                        <tr key={issue.id}>
                          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{issue.ticketNumber}</td>
                          <td className="px-3 py-2 text-foreground">{issue.title}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                              issue.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                              issue.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {issue.priority}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-foreground">{issue.status}</td>
                          <td className="px-3 py-2 text-foreground">{issue.reportedBy?.name}</td>
                          <td className="px-3 py-2 text-foreground">{new Date(issue.createdAt).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #report-content, #report-content * {
            visibility: visible;
          }
          #report-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          button, .sidebar, .print-hide {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}