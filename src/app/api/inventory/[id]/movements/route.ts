import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

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

    const movements = await prisma.assetMovement.findMany({
      where: { assetId: params.id },
      include: {
        fromLocation: true,
        toLocation: true,
        movedBy: { select: { name: true, email: true } },
      },
      orderBy: { movedAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: movements })
  } catch (error) {
    console.error('Get movements error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}