import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum!'

export async function POST(
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

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string }
    const body = await request.json()

    if (!body.action || !body.description) {
      return NextResponse.json(
        { success: false, message: 'Action and description required' },
        { status: 400 }
      )
    }

    const timeline = await prisma.issueTimeline.create({
      data: {
        issueId: params.id,
        action: body.action,
        description: body.description,
        changedBy: decoded.name,
      },
    })

    return NextResponse.json({ success: true, data: timeline })
  } catch (error) {
    console.error('POST timeline error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}