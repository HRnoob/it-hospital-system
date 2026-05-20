import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum!'

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { group: 'asc' },
    })

    const grouped = settings.reduce((acc: any, setting) => {
      const group = setting.group || 'general'
      if (!acc[group]) acc[group] = []
      acc[group].push(setting)
      return acc
    }, {})

    return NextResponse.json({ success: true, data: grouped })
  } catch (error) {
    console.error('GET settings error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    if (decoded.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { settings } = body

    for (const setting of settings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          label: setting.label,
          group: setting.group,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT settings error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}