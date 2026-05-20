'use client'

import { useState } from 'react'
import { FileText, Download, Calendar, Printer, TrendingUp, Package, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
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
    // TODO: Implement PDF export with jsPDF or @react-pdf/renderer
  }

  const handlePrint = () => {
    window.print()
  }

  const currentReport = reportTypes.find(r => r.id === reportType)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Laporan & Analitik</h1>
        <p className="text-gray-500 mt-1">Generate dan export laporan IT rumah sakit</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Report Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Jenis Laporan</h2>
            <div className="space-y-3">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setReportType(type.id)
                    setGenerated(false)
                    setReportData(null)
                  }}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    reportType === type.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <type.icon className={`w-5 h-5 mt-0.5 ${
                      reportType === type.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className={`font-medium ${
                        reportType === type.id ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {type.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <label className="block text-sm font-medium mb-2">Periode Laporan</label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Laporan'}
            </button>

            {generated && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleExportPDF}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-2">
          {!generated ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Belum Ada Laporan</h3>
              <p className="text-gray-400 mt-1">
                Pilih jenis laporan dan periode, lalu klik "Generate Laporan"
              </p>
            </div>
          ) : (
            <div className="space-y-6" id="report-content">
              {/* Report Header */}
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">IT Hospital System</h2>
                <p className="text-gray-500 mt-1">Laporan {currentReport?.name}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Periode: {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Dicetak: {new Date().toLocaleString('id-ID')}
                </p>
              </div>

              {/* Daily Summary Report */}
              {reportType === 'daily_summary' && reportData && (
                <>
                  {/* Morning Check */}
                  {reportData.morningCheck && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Morning Checklist</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Status Jaringan</p>
                          <p className="text-sm">Internet: {reportData.morningCheck.pingGoogle}</p>
                          <p className="text-sm">SIMRS: {reportData.morningCheck.pingSimrs}</p>
                          <p className="text-sm">Database: {reportData.morningCheck.pingDatabase}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Status Aplikasi</p>
                          <p className="text-sm">SIMRS: {reportData.morningCheck.simrsStatus}</p>
                          <p className="text-sm">PACS: {reportData.morningCheck.pacsStatus}</p>
                        </div>
                      </div>
                      {reportData.morningCheck.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500">Catatan</p>
                          <p className="text-sm">{reportData.morningCheck.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Issues Today */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
                      Laporan Kerusakan Hari Ini ({reportData.totalIssues} tiket)
                    </h3>
                    {reportData.issues && reportData.issues.length > 0 ? (
                      <div className="space-y-3">
                        {reportData.issues.map((issue: any) => (
                          <div key={issue.id} className="p-3 bg-gray-50 rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{issue.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{issue.ticketNumber}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                issue.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                issue.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {issue.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{issue.description}</p>
                            {issue.asset && (
                              <p className="text-xs text-gray-400 mt-1">Aset: {issue.asset.name}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">Tidak ada laporan kerusakan hari ini</p>
                    )}
                  </div>
                </>
              )}

              {/* Monthly Summary Report */}
              {reportType === 'monthly_summary' && reportData && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                      <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{reportData.totalAssets || 0}</p>
                      <p className="text-xs text-gray-500">Total Aset</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{reportData.openIssues || 0}</p>
                      <p className="text-xs text-gray-500">Issues Open</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{reportData.resolvedIssues || 0}</p>
                      <p className="text-xs text-gray-500">Issues Resolved</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                      <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{reportData.totalMorningChecks || 0}</p>
                      <p className="text-xs text-gray-500">Morning Check</p>
                    </div>
                  </div>

                  {/* Issues by Priority Chart */}
                  {reportData.issuesByPriority && reportData.issuesByPriority.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold mb-4">Issues by Priority</h3>
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
                <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
                  <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
                    Daftar Aset ({reportData.totalAssets} item)
                  </h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Kode</th>
                        <th className="px-3 py-2 text-left">Nama</th>
                        <th className="px-3 py-2 text-left">Kategori</th>
                        <th className="px-3 py-2 text-left">Lokasi</th>
                        <th className="px-3 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reportData.assets?.map((asset: any) => (
                        <tr key={asset.id}>
                          <td className="px-3 py-2 font-mono text-xs">{asset.assetCode}</td>
                          <td className="px-3 py-2">{asset.name}</td>
                          <td className="px-3 py-2">{asset.category?.name}</td>
                          <td className="px-3 py-2">{asset.location?.name || '-'}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              asset.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              asset.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
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
                <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
                  <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
                    Daftar Kerusakan ({reportData.totalIssues} tiket)
                  </h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Tiket</th>
                        <th className="px-3 py-2 text-left">Judul</th>
                        <th className="px-3 py-2 text-left">Prioritas</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-left">Pelapor</th>
                        <th className="px-3 py-2 text-left">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reportData.issues?.map((issue: any) => (
                        <tr key={issue.id}>
                          <td className="px-3 py-2 font-mono text-xs">{issue.ticketNumber}</td>
                          <td className="px-3 py-2">{issue.title}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              issue.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                              issue.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {issue.priority}
                            </span>
                          </td>
                          <td className="px-3 py-2">{issue.status}</td>
                          <td className="px-3 py-2">{issue.reportedBy?.name}</td>
                          <td className="px-3 py-2">{new Date(issue.createdAt).toLocaleDateString('id-ID')}</td>
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