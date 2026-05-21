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
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    jwt.verify(token, JWT_SECRET)

    const notifications = []

    // 1. Cek morning check hari ini
    const todayMorningCheck = await prisma.morningCheck.findFirst({
      where: {
        checkDate: new Date()
      }
    })

    if (!todayMorningCheck) {
      notifications.push({
        id: 'morning-check',
        type: 'warning',
        title: 'Morning Check Belum Diisi',
        message: 'Silakan isi morning check hari ini',
        action: '/morning-check',
        actionLabel: 'Isi Sekarang'
      })
    }

    // 2. Cek issue critical yang belum resolved
    const criticalIssues = await prisma.issue.findMany({
      where: {
        priority: 'CRITICAL',
        status: { notIn: ['RESOLVED', 'CLOSED'] }
      },
      take: 5
    })

    criticalIssues.forEach(issue => {
      notifications.push({
        id: `critical-issue-${issue.id}`,
        type: 'critical',
        title: 'Critical Issue',
        message: issue.title,
        action: `/issues/${issue.id}`,
        actionLabel: 'Lihat Detail'
      })
    })

    // 3. Cek SLA deadline (issue yang akan lewat dalam 2 jam)
    const twoHoursFromNow = new Date()
    twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2)

    const slaDeadlines = await prisma.issue.findMany({
      where: {
        status: { notIn: ['RESOLVED', 'CLOSED'] },
        slaDeadline: { lte: twoHoursFromNow, gte: new Date() },
        slaBreached: false
      },
      take: 5
    })

    slaDeadlines.forEach(issue => {
      notifications.push({
        id: `sla-${issue.id}`,
        type: 'warning',
        title: 'SLA Deadline Mendekat',
        message: `${issue.title} - Deadline dalam ${Math.ceil((new Date(issue.slaDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60))} jam`,
        action: `/issues/${issue.id}`,
        actionLabel: 'Lihat Detail'
      })
    })

    // 4. Cek garansi aset yang akan habis dalam 30 hari
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const expiringWarranties = await prisma.asset.findMany({
      where: {
        warrantyExpiry: { lte: thirtyDaysFromNow, gte: new Date() }
      },
      include: { category: true },
      take: 5
    })

    expiringWarranties.forEach(asset => {
      const daysLeft = Math.ceil((new Date(asset.warrantyExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      notifications.push({
        id: `warranty-${asset.id}`,
        type: 'info',
        title: 'Garansi Akan Habis',
        message: `${asset.name} - Garansi habis dalam ${daysLeft} hari`,
        action: `/inventory/${asset.id}`,
        actionLabel: 'Lihat Aset'
      })
    })

    return NextResponse.json({ success: true, data: notifications })
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ success: true, data: [] }, { status: 500 })
  }
}