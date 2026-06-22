import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Tidak terautentikasi' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      email: string
      name: string
      role: string
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        supportLevel: true,  // ← INI HARUS ADA
        avatar: true,
        isActive: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 401 }
      )
    }

    console.log('User support level:', user.supportLevel)  // ← TAMBAHKAN LOG

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { success: false, message: 'Token tidak valid' },
      { status: 401 }
    )
  }
}