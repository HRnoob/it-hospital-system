import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { logActivity } from '@/lib/logger'
import { getRequestInfo } from '@/lib/request-info'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

// ========== GET Morning Check hari ini (GLOBAL) ==========
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Cek apakah sudah ada morning check untuk hari ini (GLOBAL, bukan per user)
    const check = await prisma.morningCheck.findFirst({
      where: {
        checkDate: today,
      },
      include: {
        filledBy: {
          select: { name: true, email: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: check || null,
    })
  } catch (error) {
    console.error('GET morning check error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// ========== POST / PUT Morning Check (GLOBAL) ==========
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

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string; role: string }
    const body = await request.json()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Cek apakah sudah ada morning check untuk hari ini (GLOBAL)
    const existing = await prisma.morningCheck.findFirst({
      where: {
        checkDate: today,
      },
    })

    // Get IP and User Agent untuk logging
    const { ipAddress, userAgent } = getRequestInfo(request)

    if (existing) {
      // UPDATE: Jika sudah ada, update dengan data baru
      const updated = await prisma.morningCheck.update({
        where: { id: existing.id },
        data: {
          pingGoogle: body.pingGoogle,
          pingSimrs: body.pingSimrs,
          pingDatabase: body.pingDatabase,
          pingLatencyMs: body.pingLatencyMs,
          simrsStatus: body.simrsStatus,
          pacsStatus: body.pacsStatus,
          unifiedStatus: body.unifiedStatus,
          upsStatus: body.upsStatus,
          cableStatus: body.cableStatus,
          serverTempOk: body.serverTempOk,
          acStatus: body.acStatus,
          prtgAlertCount: body.prtgAlertCount,
          prtgAlerts: body.prtgAlerts,
          prtgNotes: body.prtgNotes,
          totalAP: body.totalAP,
          onlineAP: body.onlineAP,
          offlineAPList: body.offlineAPList,
          notes: body.notes,
          overallStatus: body.overallStatus,
          completedAt: new Date(),
          filledById: decoded.id, // Siapa yang terakhir update
        },
      })

      // Log update activity
      logActivity({
        userId: decoded.id,
        action: 'UPDATE',
        module: 'MORNING_CHECK',
        targetName: `Morning check ${today.toISOString().split('T')[0]}`,
        detail: { overallStatus: body.overallStatus },
        ipAddress,
        userAgent,
      }).catch(console.error)

      return NextResponse.json({ success: true, data: updated })
    } else {
      // CREATE: Buat baru
      const created = await prisma.morningCheck.create({
        data: {
          checkDate: today,
          filledById: decoded.id,
          pingGoogle: body.pingGoogle || 'UNCHECKED',
          pingSimrs: body.pingSimrs || 'UNCHECKED',
          pingDatabase: body.pingDatabase || 'UNCHECKED',
          pingLatencyMs: body.pingLatencyMs,
          simrsStatus: body.simrsStatus || 'UNCHECKED',
          pacsStatus: body.pacsStatus || 'UNCHECKED',
          unifiedStatus: body.unifiedStatus || 'UNCHECKED',
          upsStatus: body.upsStatus || 'UNCHECKED',
          cableStatus: body.cableStatus || 'UNCHECKED',
          serverTempOk: body.serverTempOk,
          acStatus: body.acStatus || 'UNCHECKED',
          prtgAlertCount: body.prtgAlertCount || 0,
          prtgAlerts: body.prtgAlerts,
          prtgNotes: body.prtgNotes,
          totalAP: body.totalAP || 0,
          onlineAP: body.onlineAP || 0,
          offlineAPList: body.offlineAPList,
          notes: body.notes,
          overallStatus: body.overallStatus || 'NORMAL',
          completedAt: new Date(),
        },
      })

      // Log create activity
      logActivity({
        userId: decoded.id,
        action: 'CREATE',
        module: 'MORNING_CHECK',
        targetName: `Morning check ${today.toISOString().split('T')[0]}`,
        detail: { overallStatus: body.overallStatus },
        ipAddress,
        userAgent,
      }).catch(console.error)

      return NextResponse.json({ success: true, data: created })
    }
  } catch (error) {
    console.error('POST morning check error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}