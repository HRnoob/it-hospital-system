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
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayMorningCheck = await prisma.morningCheck.findFirst({
      where: {
        checkDate: today
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
        slaDeadline: { 
          lte: twoHoursFromNow, 
          gte: new Date(),
          not: null 
        },
        slaBreached: false
      },
      take: 5
    })

    slaDeadlines.forEach(issue => {
      if (issue.slaDeadline) {
        const deadlineTime = new Date(issue.slaDeadline).getTime()
        const nowTime = new Date().getTime()
        const hoursLeft = Math.ceil((deadlineTime - nowTime) / (1000 * 60 * 60))
        
        notifications.push({
          id: `sla-${issue.id}`,
          type: 'warning',
          title: 'SLA Deadline Mendekat',
          message: `${issue.title} - Deadline dalam ${hoursLeft} jam`,
          action: `/issues/${issue.id}`,
          actionLabel: 'Lihat Detail'
        })
      }
    })

    // 4. Cek garansi aset yang akan habis dalam 30 hari
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const expiringWarranties = await prisma.asset.findMany({
      where: {
        warrantyExpiry: { 
          lte: thirtyDaysFromNow, 
          gte: new Date(),
          not: null
        }
      },
      include: { category: true },
      take: 5
    })

    expiringWarranties.forEach(asset => {
      if (asset.warrantyExpiry) {
        const daysLeft = Math.ceil((new Date(asset.warrantyExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        notifications.push({
          id: `warranty-${asset.id}`,
          type: 'info',
          title: 'Garansi Akan Habis',
          message: `${asset.name} - Garansi habis dalam ${daysLeft} hari`,
          action: `/inventory/${asset.id}`,
          actionLabel: 'Lihat Aset'
        })
      }
    })

    // 5. Cek ticket yang perlu di-eskalasi (pending L2)
    // Gunakan raw query atau restructure karena supportLevel belum terindex dengan baik
    const pendingEscalation = await prisma.issue.findMany({
      where: {
        status: 'OPEN',
        priority: { in: ['CRITICAL', 'HIGH'] },
      },
      include: {
        assignedTo: {
          select: { supportLevel: true, name: true }
        }
      },
      take: 5
    })

    // Filter di JavaScript (karena Prisma belum support nested where on enum)
    const filteredEscalations = pendingEscalation.filter(
      issue => issue.assignedTo?.supportLevel === 'L1'
    )

    filteredEscalations.forEach(issue => {
      notifications.push({
        id: `escalate-${issue.id}`,
        type: 'warning',
        title: 'Ticket Perlu Eskalasi',
        message: `${issue.title} - Butuh penanganan L2`,
        action: `/issues/${issue.id}`,
        actionLabel: 'Proses Ticket'
      })
    })

    return NextResponse.json({ success: true, data: notifications })
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ success: true, data: [] }, { status: 500 })
  }
}