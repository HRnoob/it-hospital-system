'use client'

import { useState, useEffect } from 'react'
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
  issuesTrend?: { date: string; count: number }[]   // ← TAMBAH
  avgResolutionTime?: number                         // ← TAMBAH
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState('daily_summary')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [generated, setGenerated] = useState(false)
  const [settings, setSettings] = useState<any>({})

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSettings(data.data)
      })
      .catch(console.error)
  }, [])

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

  const handlePrint = () => {
    const printContent = document.getElementById('report-content')
    if (!printContent) {
      toast.error('Konten laporan tidak ditemukan')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Popup blocker menghalangi print')
      return
    }

    const hospitalName = settings?.identity?.find((s: any) => s.key === 'hospital_name')?.value || 'IT Hospital System'
    const hospitalAddress = settings?.identity?.find((s: any) => s.key === 'hospital_address')?.value || ''
    const hospitalPhone = settings?.identity?.find((s: any) => s.key === 'hospital_phone')?.value || ''
    const hospitalEmail = settings?.identity?.find((s: any) => s.key === 'hospital_email')?.value || ''
    const reportHeader = settings?.report?.find((s: any) => s.key === 'report_header_text')?.value || 'LAPORAN IT RUMAH SAKIT'
    const currentReportName = reportTypes.find(r => r.id === reportType)?.name || 'Laporan'

    // Clone konten asli (biar gak ngerusak halaman asli)
    const originalContent = printContent.cloneNode(true) as HTMLElement

    // Hapus tombol-tombol dan elemen yang gak perlu di clone
    const removeElements = originalContent.querySelectorAll('button, .no-print, .print-hide, .sticky, .fixed, .sidebar, nav, aside, .animate-pulse, .bg-primary\\/20, .bg-primary\\/10')
    removeElements.forEach(el => el.remove())

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan IT Hospital System</title>
          <meta charset="UTF-8">
          <style>
            /* Reset total */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', Arial, sans-serif;
              padding: 20px;
              font-size: 11pt;
              line-height: 1.4;
              background: white;
            }
            /* Kop surat - SEKALI AJA */
            .kop-surat {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #000;
            }
            .kop-surat h1 {
              font-size: 18pt;
              font-weight: bold;
              margin: 0;
              text-transform: uppercase;
            }
            .kop-surat .alamat {
              font-size: 9pt;
              margin: 5px 0;
            }
            .kop-surat .kontak {
              font-size: 9pt;
            }
            /* Judul laporan */
            .judul-laporan {
              text-align: center;
              margin: 15px 0;
            }
            .judul-laporan h2 {
              font-size: 14pt;
              font-weight: bold;
              text-decoration: underline;
            }
            .periode {
              text-align: center;
              font-size: 10pt;
              margin: 5px 0;
            }
            /* Tabel */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th, td {
              border: 1px solid #000;
              padding: 6px 8px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .section-title {
              font-size: 12pt;
              font-weight: bold;
              margin: 10px 0 5px 0;
              padding-bottom: 3px;
              border-bottom: 1px solid #000;
            }
            /* FORCE WARNA HITAM BUAT SEMUA TEKS */
            body, p, span, div, li, td, th, h1, h2, h3, h4, .text-foreground, .text-muted-foreground,
            .text-primary, .text-destructive, .text-gray-500, .text-gray-600, .text-gray-700,
            .text-green-500, .text-red-500, .text-yellow-500, .text-blue-500, .text-orange-500 {
              color: #000000 !important;
            }
            /* Hapus background warna dari badge */
            span[class*="bg-red"], span[class*="bg-yellow"], span[class*="bg-green"], span[class*="bg-blue"],
            .bg-red-500\\/20, .bg-green-500\\/20, .bg-yellow-500\\/20, .bg-blue-500\\/20,
            .bg-primary\\/20, .bg-destructive\\/20 {
              background: white !important;
              border: 1px solid #ccc !important;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #ccc;
              font-size: 9pt;
            }
            hr {
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <!-- Kop surat (cuma 1x, dari settings) -->
          <div class="kop-surat">
            <h1>${hospitalName}</h1>
            <div class="alamat">${hospitalAddress}</div>
            <div class="kontak">Telp: ${hospitalPhone} | Email: ${hospitalEmail}</div>
          </div>
          
          <div class="judul-laporan">
            <h2>${reportHeader}</h2>
          </div>
          
          <div class="periode">
            Jenis Laporan: ${currentReportName}<br>
            Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}<br>
            Dicetak: ${new Date().toLocaleString('id-ID')}
          </div>
          
          <!-- Konten laporan (sudah bersih tanpa dobel) -->
          ${originalContent.innerHTML}
          
          <div class="footer">
            Dokumen ini adalah laporan resmi IT - Dicetak oleh sistem
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
    printWindow.document.close()
  }

  const handleExportPDF = () => {
    const printContent = document.getElementById('report-content')
    if (!printContent) {
      toast.error('Konten laporan tidak ditemukan')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Popup blocker menghalangi print')
      return
    }

    const hospitalName = settings?.identity?.find((s: any) => s.key === 'hospital_name')?.value || 'IT Hospital System'
    const hospitalAddress = settings?.identity?.find((s: any) => s.key === 'hospital_address')?.value || ''
    const hospitalPhone = settings?.identity?.find((s: any) => s.key === 'hospital_phone')?.value || ''
    const hospitalEmail = settings?.identity?.find((s: any) => s.key === 'hospital_email')?.value || ''
    const reportHeader = settings?.report?.find((s: any) => s.key === 'report_header_text')?.value || 'LAPORAN IT RUMAH SAKIT'
    const currentReportName = reportTypes.find(r => r.id === reportType)?.name || 'Laporan'

    const cloneContent = printContent.cloneNode(true) as HTMLElement
    const remove = cloneContent.querySelectorAll('button, .no-print, .print-hide, .sticky, .fixed, .sidebar, nav, aside, .animate-pulse, .bg-primary\\/20, .bg-primary\\/10')
    remove.forEach(el => el.remove())

    // =============================================
    // 1. LAPORAN BULANAN (DENGAN GRAFIK)
    // =============================================
    if (reportType === 'monthly_summary' && reportData) {
      const { totalAssets, openIssues, resolvedIssues, totalMorningChecks, issuesByPriority, issuesTrend, avgResolutionTime } = reportData

      // Generate baris untuk Pie Chart (prioritas)
      let pieRows = ''
      const priorityColors: Record<string, string> = {
        CRITICAL: '#dc2626',
        HIGH: '#f97316',
        MEDIUM: '#eab308',
        LOW: '#0ea5e9',
      }
      issuesByPriority?.forEach((item: any) => {
        const color = priorityColors[item.priority] || '#888'
        pieRows += `
          <div style="display:flex;align-items:center;margin:4px 0;font-size:9pt;">
            <span style="display:inline-block;width:12px;height:12px;background:${color};border-radius:50%;margin-right:8px;"></span>
            <span style="flex:1;">${item.priority}</span>
            <span style="font-weight:bold;">${item._count}</span>
          </div>
        `
      })

      let trendRows = ''
      if (issuesTrend && issuesTrend.length > 0) {
        const maxCount = Math.max(...issuesTrend.map((item: any) => item.count), 1)
        issuesTrend.forEach((item: any) => {
          const percentage = Math.min((item.count / maxCount) * 100, 100)
          trendRows += `
            <div style="display:flex;align-items:center;margin:5px 0;font-size:9pt;">
              <span style="width:90px;font-weight:500;">${new Date(item.date).toLocaleDateString('id-ID')}</span>
              <div style="flex:1;background:#e5e7eb;height:16px;border-radius:4px;margin:0 10px;overflow:hidden;">
                <div style="width:${percentage}%;background:linear-gradient(90deg, #3b82f6, #60a5fa);height:100%;border-radius:4px;"></div>
              </div>
              <span style="font-weight:bold;width:30px;text-align:right;font-size:10pt;">${item.count}</span>
            </div>
          `
        })
      } else {
        trendRows = '<p style="font-size:9pt;color:#666;">Belum ada data issue</p>'
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Bulanan - IT Hospital System</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', Arial, sans-serif; padding: 20px; font-size: 11pt; line-height: 1.4; background: white; }
            .kop-surat { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #000; }
            .kop-surat h1 { font-size: 18pt; font-weight: bold; text-transform: uppercase; }
            .kop-surat .alamat { font-size: 9pt; margin: 5px 0; }
            .kop-surat .kontak { font-size: 9pt; }
            .judul-laporan { text-align: center; margin: 15px 0; }
            .judul-laporan h2 { font-size: 14pt; font-weight: bold; text-decoration: underline; }
            .periode { text-align: center; font-size: 10pt; margin: 5px 0 15px 0; }
            .summary-grid { display: flex; justify-content: space-around; margin: 15px 0; padding: 10px; background: #f5f5f5; border: 1px solid #ccc; }
            .summary-item { text-align: center; }
            .summary-number { font-size: 16pt; font-weight: bold; }
            .summary-label { font-size: 9pt; color: #555; }
            .section-title { font-size: 12pt; font-weight: bold; margin: 15px 0 8px 0; padding-bottom: 3px; border-bottom: 1px solid #000; }
            
            /* ===== CSS BUAT BAR CHART ===== */
            .bar-container {
              background: #f0f0f0;
              height: 14px;
              border-radius: 4px;
              overflow: hidden;
            }
            .bar-fill {
              background: linear-gradient(90deg, #3b82f6, #60a5fa);
              height: 100%;
              border-radius: 4px;
            }
            /* ===== SAMPAI SINI ===== */

            .footer { text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 9pt; }
          </style>
        </head>
        <body>
          <div class="kop-surat">
            <h1>${hospitalName}</h1>
            <div class="alamat">${hospitalAddress}</div>
            <div class="kontak">Telp: ${hospitalPhone} | Email: ${hospitalEmail}</div>
          </div>
          <div class="judul-laporan">
            <h2>${reportHeader}</h2>
          </div>
          <div class="periode">
            Jenis Laporan: Laporan Bulanan<br>
            Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}<br>
            Dicetak: ${new Date().toLocaleString('id-ID')}
          </div>

          <!-- SUMMARY -->
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-number">${totalAssets || 0}</div>
              <div class="summary-label">Total Aset</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${openIssues || 0}</div>
              <div class="summary-label">Issues Open</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${resolvedIssues || 0}</div>
              <div class="summary-label">Issues Resolved</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${totalMorningChecks || 0}</div>
              <div class="summary-label">Morning Check</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${avgResolutionTime || 0} jam</div>
              <div class="summary-label">Rata-rata Resolusi</div>
            </div>
          </div>

          <!-- PRIORITAS (PIE CHART VERSION) -->
          <div class="section-title">Distribusi Prioritas</div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;padding:5px 0;">
            ${pieRows}
          </div>

          <!-- TREN ISSUE (BAR CHART VERSION) -->
          <div class="section-title">Tren Issue</div>
          <div style="padding:5px 0;">
            ${trendRows || '<p style="font-size:9pt;color:#666;">Belum ada data issue</p>'}
          </div>

          <div class="footer">${reportFooter}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          <\/script>
        </body>
        </html>
      `)
      printWindow.document.close()
      return
    }

    // =============================================
    // 2. LAPORAN INVENTARIS (KELOMPOK PER KATEGORI)
    // =============================================
    if (reportType === 'asset_report' && reportData) {
      const { assets, totalAssets } = reportData

      // Group aset per kategori
      const groupedAssets: Record<string, any[]> = {}
      assets?.forEach((asset: any) => {
        const catName = asset.category?.name || 'Lainnya'
        if (!groupedAssets[catName]) groupedAssets[catName] = []
        groupedAssets[catName].push(asset)
      })

      let categoryTables = ''
      Object.keys(groupedAssets).forEach((catName) => {
        const items = groupedAssets[catName]
        let rows = ''
        items.forEach((item: any) => {
          rows += `
            <tr>
              <td style="border:1px solid #000;padding:4px 6px;font-size:9pt;font-family:monospace;">${item.assetCode}</td>
              <td style="border:1px solid #000;padding:4px 6px;font-size:9pt;">${item.name}</td>
              <td style="border:1px solid #000;padding:4px 6px;font-size:9pt;">${item.location?.name || '-'}</td>
              <td style="border:1px solid #000;padding:4px 6px;font-size:9pt;">${item.status}</td>
              <td style="border:1px solid #000;padding:4px 6px;font-size:9pt;">${item.condition}</td>
            </tr>
          `
        })
        categoryTables += `
          <div style="margin-top:12px;">
            <div style="font-weight:bold;font-size:11pt;background:#e0e0e0;padding:4px 8px;border:1px solid #000;border-bottom:none;">
              ${catName} (${items.length})
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="border:1px solid #000;padding:4px 6px;font-size:9pt;background:#f0f0f0;width:15%;">Kode</th>
                  <th style="border:1px solid #000;padding:4px 6px;font-size:9pt;background:#f0f0f0;width:35%;">Nama Aset</th>
                  <th style="border:1px solid #000;padding:4px 6px;font-size:9pt;background:#f0f0f0;width:20%;">Lokasi</th>
                  <th style="border:1px solid #000;padding:4px 6px;font-size:9pt;background:#f0f0f0;width:15%;">Status</th>
                  <th style="border:1px solid #000;padding:4px 6px;font-size:9pt;background:#f0f0f0;width:15%;">Kondisi</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        `
      })

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Inventaris - IT Hospital System</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', Arial, sans-serif; padding: 20px; font-size: 11pt; line-height: 1.4; background: white; }
            .kop-surat { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #000; }
            .kop-surat h1 { font-size: 18pt; font-weight: bold; text-transform: uppercase; }
            .kop-surat .alamat { font-size: 9pt; margin: 5px 0; }
            .kop-surat .kontak { font-size: 9pt; }
            .judul-laporan { text-align: center; margin: 15px 0; }
            .judul-laporan h2 { font-size: 14pt; font-weight: bold; text-decoration: underline; }
            .periode { text-align: center; font-size: 10pt; margin: 5px 0 15px 0; }
            .summary-grid { display: flex; justify-content: space-around; margin: 15px 0; padding: 10px; background: #f5f5f5; border: 1px solid #ccc; }
            .summary-item { text-align: center; }
            .summary-number { font-size: 16pt; font-weight: bold; }
            .summary-label { font-size: 9pt; color: #555; }
            .footer { text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 9pt; }
          </style>
        </head>
        <body>
          <div class="kop-surat">
            <h1>${hospitalName}</h1>
            <div class="alamat">${hospitalAddress}</div>
            <div class="kontak">Telp: ${hospitalPhone} | Email: ${hospitalEmail}</div>
          </div>
          <div class="judul-laporan">
            <h2>${reportHeader}</h2>
          </div>
          <div class="periode">
            Jenis Laporan: Laporan Inventaris<br>
            Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}<br>
            Dicetak: ${new Date().toLocaleString('id-ID')}
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-number">${totalAssets || 0}</div>
              <div class="summary-label">Total Aset</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${Object.keys(groupedAssets).length}</div>
              <div class="summary-label">Kategori</div>
            </div>
          </div>

          ${categoryTables}

          <div class="footer">${reportFooter}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          <\/script>
        </body>
        </html>
      `)
      printWindow.document.close()
      return
    }

    // =============================================
    // 3. LAPORAN HARIAN & KERUSAKAN (TETAP)
    // =============================================
    const issues = [...(reportData?.issues || [])].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const totalIssues = issues.length
    const resolvedIssues = issues.filter((i: any) => i.status === 'RESOLVED' || i.status === 'CLOSED').length
    const unresolvedIssues = totalIssues - resolvedIssues
    const criticalIssues = issues.filter((i: any) => i.priority === 'CRITICAL').length

    let tableRows = ''
    issues.forEach((issue: any, idx: number) => {
      const badgeColor = issue.priority === 'CRITICAL' ? 'badge-critical' :
                        issue.priority === 'HIGH' ? 'badge-high' :
                        issue.priority === 'MEDIUM' ? 'badge-medium' : 'badge-low'
      const bgColor = idx % 2 === 0 ? '#f9f9f9' : '#ffffff'
      tableRows += `
        <tr style="background-color: ${bgColor};">
          <td style="border:1px solid #000;padding:6px 8px;font-size:9pt;font-family:monospace;">${issue.ticketNumber}</td>
          <td style="border:1px solid #000;padding:6px 8px;font-size:9pt;">${issue.title}</td>
          <td style="border:1px solid #000;padding:6px 8px;font-size:9pt;text-align:center;">
            <span class="${badgeColor}">${issue.priority}</span>
          </td>
          <td style="border:1px solid #000;padding:6px 8px;font-size:9pt;">${issue.status}</td>
          <td style="border:1px solid #000;padding:6px 8px;font-size:9pt;">${new Date(issue.createdAt).toLocaleDateString('id-ID')}</td>
          <td style="border:1px solid #000;padding:6px 8px;font-size:9pt;">${issue.assignedTo?.name || '-'}</td>
        </tr>
      `
    })

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan IT Hospital System</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', Arial, sans-serif; padding: 20px; font-size: 11pt; line-height: 1.4; background: white; }
            .kop-surat { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #000; }
            .kop-surat h1 { font-size: 18pt; font-weight: bold; text-transform: uppercase; }
            .kop-surat .alamat { font-size: 9pt; margin: 5px 0; }
            .kop-surat .kontak { font-size: 9pt; }
            .judul-laporan { text-align: center; margin: 15px 0; }
            .judul-laporan h2 { font-size: 14pt; font-weight: bold; text-decoration: underline; }
            .periode { text-align: center; font-size: 10pt; margin: 5px 0 15px 0; }
            .summary-grid { display: flex; justify-content: space-around; margin: 15px 0; padding: 10px; background: #f5f5f5; border: 1px solid #ccc; }
            .summary-item { text-align: center; }
            .summary-number { font-size: 16pt; font-weight: bold; }
            .summary-label { font-size: 9pt; color: #555; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; vertical-align: top; }
            th { background-color: #e0e0e0; font-weight: bold; }
            .badge-critical { background: #fee2e2; border: 1px solid #dc2626; color: #b91c1c; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 9pt; }
            .badge-high { background: #ffedd5; border: 1px solid #f97316; color: #c2410c; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 9pt; }
            .badge-medium { background: #fef9c3; border: 1px solid #eab308; color: #854d0e; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 9pt; }
            .badge-low { background: #e0f2fe; border: 1px solid #0ea5e9; color: #0369a1; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 9pt; }
            .footer { text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 9pt; }
          </style>
        </head>
        <body>
          <div class="kop-surat">
            <h1>${hospitalName}</h1>
            <div class="alamat">${hospitalAddress}</div>
            <div class="kontak">Telp: ${hospitalPhone} | Email: ${hospitalEmail}</div>
          </div>
          <div class="judul-laporan">
            <h2>${reportHeader}</h2>
          </div>
          <div class="periode">
            Jenis Laporan: ${currentReportName}<br>
            Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}<br>
            Dicetak: ${new Date().toLocaleString('id-ID')}
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-number">${totalIssues}</div>
              <div class="summary-label">Total Tiket</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${resolvedIssues}</div>
              <div class="summary-label">Selesai</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${unresolvedIssues}</div>
              <div class="summary-label">Belum Selesai</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${criticalIssues}</div>
              <div class="summary-label">Critical</div>
            </div>
          </div>

          <h3 style="margin:10px 0 5px 0;font-size:12pt;">Daftar Tiket (${totalIssues} tiket)</h3>
          
          <table>
            <thead>
              <tr>
                <th style="width:13%;">Tiket</th>
                <th style="width:37%;">Judul</th>
                <th style="width:12%;text-align:center;">Prioritas</th>
                <th style="width:13%;">Status</th>
                <th style="width:13%;">Tanggal</th>
                <th style="width:12%;">Teknisi</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <div class="footer">${reportFooter}</div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          <\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
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

  const getSettingValue = (group: string, key: string) => {
    return settings[group]?.find((s: any) => s.key === key)?.value || ''
  }

  const hospitalName = getSettingValue('identity', 'hospital_name') || 'IT Hospital System'
  const hospitalAddress = getSettingValue('identity', 'hospital_address') || ''
  const hospitalPhone = getSettingValue('identity', 'hospital_phone') || ''
  const hospitalEmail = getSettingValue('identity', 'hospital_email') || ''
  const reportHeader = getSettingValue('report', 'report_header_text') || 'LAPORAN IT RUMAH SAKIT'
  const reportFooter = getSettingValue('report', 'report_footer_text') || 'Dokumen ini adalah laporan resmi IT'

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
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-mono text-sm text-foreground"
                >
                  <Printer className="w-4 h-4" />
                  PRINT
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors font-mono text-sm text-foreground"
                >
                  <Download className="w-4 h-4" />
                  PDF
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
                      Laporan Kerusakan ({reportData.totalIssues} tiket)
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
            margin: 0;
            padding: 20px;
          }
          button, .sidebar, .print-hide {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}