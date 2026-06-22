import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { logActivity } from '@/lib/logger'
import { getRequestInfo } from '@/lib/request-info'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string; role: string; supportLevel: string }

    // TODO: FIX LATER - BYPASS DULU
    // if (decoded.supportLevel !== 'L1') {
    //   return NextResponse.json({ success: false, message: 'Only L1 support can escalate tickets' }, { status: 403 })
    // }

    // Cek ticket
    const issue = await prisma.issue.findUnique({
      where: { id: params.id },
      include: { assignedTo: true }
    })

    if (!issue) {
      return NextResponse.json({ success: false, message: 'Issue not found' }, { status: 404 })
    }

    // Cari user L2 yang available
    const l2User = await prisma.user.findFirst({
      where: {
        supportLevel: 'L2',
        isActive: true,
        role: { in: ['ADMIN', 'SUPERADMIN'] }
      }
    })

    if (!l2User) {
      return NextResponse.json({ success: false, message: 'No L2 support available' }, { status: 404 })
    }

    // Update ticket: assign ke L2, tambah priority jika perlu
    const updated = await prisma.issue.update({
      where: { id: params.id },
      data: {
        assignedToId: l2User.id,
        priority: issue.priority === 'LOW' ? 'MEDIUM' : issue.priority,
      }
    })

    // Tambah timeline
    await prisma.issueTimeline.create({
      data: {
        issueId: params.id,
        action: 'ESCALATED TO L2',
        description: `Ticket di-eskalasi dari L1 (${decoded.name}) ke L2 (${l2User.name})`,
        changedBy: decoded.name,
      }
    })

    // Log activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    logActivity({
      userId: decoded.id,
      action: 'ESCALATE',
      module: 'ISSUE',
      targetId: issue.id,
      targetName: issue.title,
      detail: { from: 'L1', to: 'L2', assignedTo: l2User.name },
      ipAddress,
      userAgent,
    }).catch(console.error)

    return NextResponse.json({ success: true, data: updated, message: `Ticket di-eskalasi ke ${l2User.name}` })
  } catch (error) {
    console.error('Escalate error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}