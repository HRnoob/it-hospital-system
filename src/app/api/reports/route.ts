import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    jwt.verify(token, JWT_SECRET)
    const body = await request.json()
    const { type, startDate, endDate } = body

    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    let data = {}

    switch (type) {
      // =============================================
      // 1. LAPORAN HARIAN
      // =============================================
      case 'daily_summary': {
        const morningCheck = await prisma.morningCheck.findFirst({
          where: { checkDate: start },
          include: { filledBy: { select: { name: true } } },
        })

        const dailyIssues = await prisma.issue.findMany({
          where: { createdAt: { gte: start, lte: end } },
          include: {
            asset: { select: { name: true, assetCode: true } },
            reportedBy: { select: { name: true } },
            assignedTo: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        })

        data = { morningCheck, issues: dailyIssues, totalIssues: dailyIssues.length }
        break
      }

      // =============================================
      // 2. LAPORAN BULANAN (DENGAN GRAFIK)
      // =============================================
      case 'monthly_summary': {
        const [
          totalAssets,
          openIssues,
          resolvedIssues,
          totalMorningChecks,
          issuesByPriority,
          issuesByStatus,
        ] = await Promise.all([
          prisma.asset.count(),
          prisma.issue.count({ where: { status: 'OPEN' } }),
          prisma.issue.count({
            where: {
              status: 'RESOLVED',
              resolvedAt: { gte: start, lte: end },
            },
          }),
          prisma.morningCheck.count({
            where: { checkDate: { gte: start, lte: end } },
          }),
          prisma.issue.groupBy({
            by: ['priority'],
            where: { createdAt: { gte: start, lte: end } },
            _count: true,
          }),
          prisma.issue.groupBy({
            by: ['status'],
            where: { createdAt: { gte: start, lte: end } },
            _count: true,
          }),
        ])

        // 🔥 TREN ISSUE PER HARI (Raw Query)
        const issuesTrendRaw = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
          SELECT DATE("createdAt") as date, COUNT(*) as count
          FROM issues
          WHERE "createdAt" BETWEEN ${start} AND ${end}
          GROUP BY DATE("createdAt")
          ORDER BY DATE("createdAt") DESC
          LIMIT 7
        `

        // 🔥 Konversi BigInt ke Number
        const issuesTrend = issuesTrendRaw.map((item) => ({
          date: item.date,
          count: Number(item.count),
        }))

        // 🔥 RATA-RATA WAKTU PENYELESAIAN (dalam jam)
        const avgResolutionResult = await prisma.$queryRaw<{ avg_hours: number }[]>`
          SELECT AVG(EXTRACT(EPOCH FROM ("resolvedAt" - "createdAt")) / 3600) as avg_hours
          FROM issues
          WHERE "resolvedAt" IS NOT NULL
            AND "createdAt" BETWEEN ${start} AND ${end}
        `
        const avgResolutionHours = avgResolutionResult[0]?.avg_hours || 0

        data = {
          totalAssets,
          openIssues,
          resolvedIssues,
          totalMorningChecks,
          issuesByPriority,
          issuesByStatus,
          issuesTrend: issuesTrend || [],
          avgResolutionTime: Math.round(Number(avgResolutionHours) * 10) / 10,
          period: { startDate, endDate },
        }
        break
      }

      // =============================================
      // 3. LAPORAN INVENTARIS
      // =============================================
      case 'asset_report': {
        // Ambil SEMUA aset + relasi kategori & lokasi
        const assets = await prisma.asset.findMany({
          include: {
            category: true,
            location: true,
          },
          orderBy: [
            { category: { name: 'asc' } }, // Urut berdasarkan kategori ASC
            { name: 'asc' },
          ],
        })

        // 🔥 Hitung total per kategori
        const categoryCount: Record<string, { category: any; count: number }> = {}
        for (const asset of assets) {
          if (asset.categoryId && asset.category) {
            if (!categoryCount[asset.categoryId]) {
              categoryCount[asset.categoryId] = { category: asset.category, count: 0 }
            }
            categoryCount[asset.categoryId].count++
          }
        }
        const assetsByCategory = Object.values(categoryCount).map((item) => ({
          categoryId: item.category.id,
          category: item.category,
          count: item.count,
        }))

        // 🔥 Hitung total per status
        const statusCount: Record<string, number> = {}
        for (const asset of assets) {
          statusCount[asset.status] = (statusCount[asset.status] || 0) + 1
        }
        const assetsByStatus = Object.entries(statusCount).map(([status, count]) => ({
          status,
          count,
        }))

        data = {
          assets,
          assetsByCategory,
          assetsByStatus,
          totalAssets: assets.length,
        }
        break
      }

      // =============================================
      // 4. LAPORAN KERUSAKAN
      // =============================================
      case 'issue_report': {
        const issueList = await prisma.issue.findMany({
          where: { createdAt: { gte: start, lte: end } },
          include: {
            asset: { select: { name: true, assetCode: true } },
            reportedBy: { select: { name: true } },
            assignedTo: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        })

        data = {
          issues: issueList,
          totalIssues: issueList.length,
          period: { startDate, endDate },
        }
        break
      }

      default:
        data = { message: 'Unknown report type' }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}