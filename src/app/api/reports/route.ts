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
      case 'daily_summary':
        const morningCheck = await prisma.morningCheck.findFirst({
          where: { checkDate: start },
          include: { filledBy: { select: { name: true } } },
        })

        const issues = await prisma.issue.findMany({
          where: { createdAt: { gte: start, lte: end } },
          include: {
            asset: { select: { name: true, assetCode: true } },
            reportedBy: { select: { name: true } },
          },
        })

        data = { morningCheck, issues, totalIssues: issues.length }
        break

      case 'monthly_summary':
        const [totalAssets, openIssues, resolvedIssues, totalMorningChecks] = await Promise.all([
          prisma.asset.count(),
          prisma.issue.count({ where: { status: { not: 'RESOLVED' } } }),
          prisma.issue.count({
            where: {
              status: 'RESOLVED',
              resolvedAt: { gte: start, lte: end },
            },
          }),
          prisma.morningCheck.count({
            where: { checkDate: { gte: start, lte: end } },
          }),
        ])

        const issuesByPriority = await prisma.issue.groupBy({
          by: ['priority'],
          where: { createdAt: { gte: start, lte: end } },
          _count: true,
        })

        const issuesByStatus = await prisma.issue.groupBy({
          by: ['status'],
          where: { createdAt: { gte: start, lte: end } },
          _count: true,
        })

        data = {
          totalAssets,
          openIssues,
          resolvedIssues,
          totalMorningChecks,
          issuesByPriority,
          issuesByStatus,
          period: { startDate, endDate },
        }
        break

      case 'asset_report':
        const assets = await prisma.asset.findMany({
          include: { category: true, location: true },
          orderBy: { createdAt: 'desc' },
        })

        // Hitung per kategori (manual)
        const categoryMap: Record<string, { category: any; count: number }> = {}
        for (const asset of assets) {
          if (asset.categoryId && asset.category) {
            if (!categoryMap[asset.categoryId]) {
              categoryMap[asset.categoryId] = { category: asset.category, count: 0 }
            }
            categoryMap[asset.categoryId].count++
          }
        }
        const assetsByCategory = Object.values(categoryMap).map(item => ({
          categoryId: item.category.id,
          category: item.category,
          _count: { count: item.count },
        }))

        // Hitung per status
        const statusMap: Record<string, number> = {}
        for (const asset of assets) {
          statusMap[asset.status] = (statusMap[asset.status] || 0) + 1
        }
        const assetsByStatus = Object.entries(statusMap).map(([status, count]) => ({
          status,
          _count: { count },
        }))

        data = { assets, assetsByCategory, assetsByStatus, totalAssets: assets.length }
        break

      case 'issue_report':
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