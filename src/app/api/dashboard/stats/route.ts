import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

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

    jwt.verify(token, JWT_SECRET)

    const [
      totalAssets,
      openIssues,
      inProgressIssues,
      todayCheck,
      criticalIssues,
      highIssues,
    ] = await Promise.all([
      // Total semua aset
      prisma.asset.count(),

      // OPEN ISSUES: status = OPEN
      prisma.issue.count({ 
        where: { 
          status: 'OPEN'  // ← FIX: pastikan status OPEN
        } 
      }),

      // IN PROGRESS ISSUES: status = IN_PROGRESS
      prisma.issue.count({ 
        where: { 
          status: 'IN_PROGRESS' 
        } 
      }),

      // Morning check hari ini (GLOBAL)
      prisma.morningCheck.count({
        where: {
          checkDate: new Date(),
        },
      }),

      // CRITICAL ISSUES: priority = CRITICAL dan status BELUM SELESAI
      prisma.issue.count({ 
        where: { 
          priority: 'CRITICAL',
          status: { 
            notIn: ['RESOLVED', 'CLOSED', 'CANCELLED']  // ← FIX: exclude status selesai
          } 
        } 
      }),

      // HIGH ISSUES: priority = HIGH dan status BELUM SELESAI
      prisma.issue.count({ 
        where: { 
          priority: 'HIGH',
          status: { 
            notIn: ['RESOLVED', 'CLOSED', 'CANCELLED']
          } 
        } 
      }),
    ])

    // ========== HITUNG UPTIME dari Morning Check (GLOBAL) ==========
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const morningChecks = await prisma.morningCheck.findMany({
      where: {
        checkDate: { gte: thirtyDaysAgo },
      },
      select: {
        pingGoogle: true,
        pingSimrs: true,
        pingDatabase: true,
      }
    })

    const totalDays = morningChecks.length
    const successfulDays = morningChecks.filter(
      check => check.pingGoogle === 'OK' && check.pingSimrs === 'OK' && check.pingDatabase === 'OK'
    ).length

    let uptime = 100
    if (totalDays > 0) {
      uptime = Math.round((successfulDays / totalDays) * 1000) / 10
    }

    return NextResponse.json({
      success: true,
      data: {
        totalAssets,
        openIssues,
        inProgressIssues,
        todayCheck: todayCheck > 0,
        criticalIssues,
        highIssues,
        uptime,
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