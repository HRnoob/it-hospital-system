import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum!'

export async function GET() {
  try {
    const categories = await prisma.assetCategory.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

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

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string }

    if (decoded.role !== 'SUPERADMIN' && decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const category = await prisma.assetCategory.create({
      data: {
        name: body.name,
        icon: body.icon,
        description: body.description,
      },
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('POST category error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}