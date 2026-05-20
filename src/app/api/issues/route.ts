import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum!'

// Helper untuk generate ticket number
async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const lastTicket = await prisma.issue.findFirst({
    where: { ticketNumber: { startsWith: `TKT-${year}` } },
    orderBy: { ticketNumber: 'desc' },
  })
  
  let sequence = 1
  if (lastTicket) {
    const lastSeq = parseInt(lastTicket.ticketNumber.split('-')[2])
    sequence = lastSeq + 1
  }
  
  return `TKT-${year}-${String(sequence).padStart(4, '0')}`
}

// ========== GET All Issues ==========
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assetId = searchParams.get('assetId')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}

    if (status) where.status = status
    if (priority) where.priority = priority
    if (assetId) where.assetId = assetId
    
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take: limit,
        include: {
          asset: {
            select: { name: true, assetCode: true },
          },
          reportedBy: {
            select: { name: true },
          },
          assignedTo: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.issue.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: issues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET issues error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// ========== POST Create Issue ==========
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

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
    const body = await request.json()

    if (!body.title || !body.description) {
      return NextResponse.json(
        { success: false, message: 'Judul dan deskripsi wajib diisi' },
        { status: 400 }
      )
    }

    const ticketNumber = await generateTicketNumber()

    // Calculate SLA deadline based on priority
    const slaHours = {
      CRITICAL: 2,
      HIGH: 8,
      MEDIUM: 24,
      LOW: 72,
    }
    const hours = slaHours[body.priority as keyof typeof slaHours] || 24
    const slaDeadline = new Date()
    slaDeadline.setHours(slaDeadline.getHours() + hours)

    const issue = await prisma.issue.create({
      data: {
        ticketNumber,
        title: body.title,
        description: body.description,
        assetId: body.assetId || null,
        priority: body.priority || 'MEDIUM',
        status: 'OPEN',
        category: body.category,
        reportedById: decoded.id,
        slaDeadline,
      },
      include: {
        asset: {
          select: { name: true, assetCode: true },
        },
        reportedBy: {
          select: { name: true },
        },
      },
    })

    // Add timeline entry
    await prisma.issueTimeline.create({
      data: {
        issueId: issue.id,
        action: 'Tiket Dibuka',
        description: `Tiket ${ticketNumber} dibuat oleh ${decoded.id}`,
        changedBy: decoded.id,
      },
    })

    return NextResponse.json({ success: true, data: issue })
  } catch (error) {
    console.error('POST issue error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}