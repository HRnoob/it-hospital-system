import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

// ========== GET Issue by ID ==========
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    jwt.verify(token, JWT_SECRET)

    const issue = await prisma.issue.findUnique({
      where: { id: params.id },
      include: {
        asset: { select: { id: true, name: true, assetCode: true } },
        reportedBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        timeline: { orderBy: { createdAt: 'asc' } },
        photos: true,
      },
    })

    if (!issue) {
      return NextResponse.json({ success: false, message: 'Issue not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: issue })
  } catch (error) {
    console.error('GET issue error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

// ========== PUT Update Issue ==========
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string; role: string }
    const body = await request.json()

    const oldIssue = await prisma.issue.findUnique({
      where: { id: params.id },
    })

    if (!oldIssue) {
      return NextResponse.json({ success: false, message: 'Issue not found' }, { status: 404 })
    }

    // Track changes for timeline
    const changes: string[] = []

    if (body.status && body.status !== oldIssue.status) {
      changes.push(`Status berubah dari ${oldIssue.status} menjadi ${body.status}`)
    }
    
    if (body.assignedToId !== undefined && body.assignedToId !== oldIssue.assignedToId) {
      if (body.assignedToId) {
        const assignedUser = await prisma.user.findUnique({
          where: { id: body.assignedToId },
          select: { name: true },
        })
        changes.push(`Ditugaskan kepada ${assignedUser?.name || 'Unknown'}`)
      } else {
        changes.push(`Ditugaskan dihapus`)
      }
    }

    if (body.priority && body.priority !== oldIssue.priority) {
      changes.push(`Prioritas berubah dari ${oldIssue.priority} menjadi ${body.priority}`)
    }

    const updateData: any = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId || null
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.resolution !== undefined) updateData.resolution = body.resolution
    if (body.status === 'RESOLVED' || body.status === 'CLOSED') {
      updateData.resolvedAt = new Date()
    }

    const issue = await prisma.issue.update({
      where: { id: params.id },
      data: updateData,
      include: {
        asset: { select: { name: true } },
        reportedBy: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
    })

    // Add timeline entry if there are changes
    if (changes.length > 0) {
      await prisma.issueTimeline.create({
        data: {
          issueId: params.id,
          action: 'Update Tiket',
          description: changes.join(', '),
          changedBy: decoded.name,
        },
      })
    }

    return NextResponse.json({ success: true, data: issue })
  } catch (error) {
    console.error('PUT issue error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

// ========== DELETE Issue (Hanya SUPERADMIN & ADMIN) ==========
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string }

    // Hanya SUPERADMIN dan ADMIN yang bisa hapus
    if (decoded.role !== 'SUPERADMIN' && decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only Admin can delete issues' },
        { status: 403 }
      )
    }

    // Cek apakah issue ada
    const issue = await prisma.issue.findUnique({
      where: { id: params.id },
    })

    if (!issue) {
      return NextResponse.json({ success: false, message: 'Issue not found' }, { status: 404 })
    }

    // Hapus relasi terkait dulu (timeline & photos)
    await prisma.issueTimeline.deleteMany({
      where: { issueId: params.id },
    })

    await prisma.issuePhoto.deleteMany({
      where: { issueId: params.id },
    })

    // Kemudian hapus issue
    await prisma.issue.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Issue deleted successfully' })
  } catch (error) {
    console.error('DELETE issue error:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}