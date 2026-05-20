import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum!'

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

    const devices = await prisma.asset.findMany({
      where: {
        OR: [
          { rustdeskId: { not: null } },
          { guacamoleId: { not: null } },
        ],
      },
      include: {
        category: true,
        location: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: devices })
  } catch (error) {
    console.error('GET remote devices error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}