import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum!'

// ========== PUT Update Card ==========
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const card = await prisma.kanbanCard.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        column: body.column,
        priority: body.priority,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        assignedToId: body.assignedToId,
        labels: body.labels,
        relatedIssueId: body.relatedIssueId,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: card })
  } catch (error) {
    console.error('PUT kanban error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// ========== DELETE Card ==========
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string }

    if (decoded.role !== 'SUPERADMIN' && decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    await prisma.kanbanCard.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE kanban error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}