import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum!'

// ========== GET All Kanban Cards ==========
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

    const cards = await prisma.kanbanCard.findMany({
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [
        { column: 'asc' },
        { position: 'asc' },
      ],
    })

    // Group by column
    const grouped = {
      TODO: cards.filter(c => c.column === 'TODO'),
      DOING: cards.filter(c => c.column === 'DOING'),
      DONE: cards.filter(c => c.column === 'DONE'),
    }

    return NextResponse.json({ success: true, data: grouped })
  } catch (error) {
    console.error('GET kanban error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// ========== POST Create Kanban Card ==========
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

    if (!body.title) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      )
    }

    // Get max position for the column
    const maxPosition = await prisma.kanbanCard.aggregate({
      where: { column: body.column || 'TODO' },
      _max: { position: true },
    })

    const card = await prisma.kanbanCard.create({
      data: {
        title: body.title,
        description: body.description || null,
        column: body.column || 'TODO',
        priority: body.priority || 'MEDIUM',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        assignedToId: body.assignedToId || null,
        labels: body.labels || [],
        position: (maxPosition._max.position || -1) + 1,
        relatedIssueId: body.relatedIssueId || null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: card })
  } catch (error) {
    console.error('POST kanban error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}