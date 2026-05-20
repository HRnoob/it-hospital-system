import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }

    const [totalAssets, openIssues, inProgressIssues, todayCheck] = await Promise.all([
      prisma.asset.count(),
      prisma.issue.count({ where: { status: 'OPEN' } }),
      prisma.issue.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.morningCheck.count({
        where: {
          checkDate: new Date(),
          filledById: decoded.id,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalAssets,
        openIssues,
        inProgressIssues,
        todayCheck: todayCheck > 0,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}