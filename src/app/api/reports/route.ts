import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum!'

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
        // Morning check
        const morningCheck = await prisma.morningCheck.findFirst({
          where: {
            checkDate: start,
          },
          include: {
            filledBy: { select: { name: true } },
          },
        })

        // Issues hari itu
        const issues = await prisma.issue.findMany({
          where: {
            createdAt: { gte: start, lte: end },
          },
          include: {
            asset: { select: { name: true, assetCode: true } },
            reportedBy: { select: { name: true } },
          },
        })

        data = { morningCheck, issues, totalIssues: issues.length }
        break

      case 'monthly_summary':
        // Statistik bulanan
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
            where: {
              checkDate: { gte: start, lte: end },
            },
          }),
        ])

        // Issues by priority
        const issuesByPriority = await prisma.issue.groupBy({
          by: ['priority'],
          where: { createdAt: { gte: start, lte: end } },
          _count: true,
        })

        // Issues by status
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
        // Laporan inventaris
        const assets = await prisma.asset.findMany({
          include: {
            category: true,
            location: true,
          },
          orderBy: { createdAt: 'desc' },
        })

        const assetsByCategory = await prisma.asset.groupBy({
          by: ['categoryId'],
          _count: true,
          include: {
            category: true,
          },
        })

        const assetsByStatus = await prisma.asset.groupBy({
          by: ['status'],
          _count: true,
        })

        data = { assets, assetsByCategory, assetsByStatus, totalAssets: assets.length }
        break

      case 'issue_report':
        // Laporan kerusakan
        const issueList = await prisma.issue.findMany({
          where: {
            createdAt: { gte: start, lte: end },
          },
          include: {
            asset: { select: { name: true, assetCode: true } },
            reportedBy: { select: { name: true } },
            assignedTo: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        })

        const avgResolutionTime = await prisma.issue.aggregate({
          where: {
            resolvedAt: { not: null },
            createdAt: { gte: start, lte: end },
          },
          _avg: {
            resolvedAt: true,
          },
        })

        data = {
          issues: issueList,
          totalIssues: issueList.length,
          avgResolutionTime: avgResolutionTime._avg.resolvedAt,
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