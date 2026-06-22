import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import * as XLSX from 'xlsx'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    jwt.verify(token, JWT_SECRET)

    const { type, startDate, endDate } = await request.json()

    let data = []
    let filename = ''

    switch (type) {
      case 'assets':
        const assets = await prisma.asset.findMany({
          include: { category: true, location: true }
        })
        data = assets.map(a => ({
          'Kode Aset': a.assetCode,
          'Nama Aset': a.name,
          'Merek': a.brand || '-',
          'Model': a.model || '-',
          'Serial Number': a.serialNumber || '-',
          'Kategori': a.category?.name || '-',
          'Lokasi': a.location?.name || '-',
          'Status': a.status,
          'Kondisi': a.condition,
          'IP Address': a.ipAddress || '-',
          'Ditugaskan Kepada': a.assignedTo || '-'
        }))
        filename = `inventory-${new Date().toISOString().split('T')[0]}.xlsx`
        break

      case 'issues':
        const issues = await prisma.issue.findMany({
          where: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          },
          include: { asset: true, reportedBy: true, assignedTo: true }
        })
        data = issues.map(i => ({
          'No Tiket': i.ticketNumber,
          'Judul': i.title,
          'Prioritas': i.priority,
          'Status': i.status,
          'Aset': i.asset?.name || '-',
          'Pelapor': i.reportedBy?.name || '-',
          'Teknisi': i.assignedTo?.name || '-',
          'Tanggal Dibuat': new Date(i.createdAt).toLocaleDateString('id-ID'),
          'Tanggal Selesai': i.resolvedAt ? new Date(i.resolvedAt).toLocaleDateString('id-ID') : '-'
        }))
        filename = `issues-${startDate}-to-${endDate}.xlsx`
        break

      default:
        return NextResponse.json({ success: false, message: 'Invalid export type' }, { status: 400 })
    }

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}