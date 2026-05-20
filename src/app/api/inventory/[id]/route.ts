import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum!'

// ========== GET Asset by ID ==========
export async function GET(
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

    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        location: true,
        issues: {
          include: {
            reportedBy: { select: { name: true } },
            assignedTo: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        maintenanceLogs: {
          include: {
            doneBy: { select: { name: true } },
            schedule: true,
          },
          orderBy: { performedAt: 'desc' },
          take: 10,
        },
        photos: true,
      },
    })

    if (!asset) {
      return NextResponse.json(
        { success: false, message: 'Asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: asset })
  } catch (error) {
    console.error('GET asset error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// ========== PUT Update Asset ==========
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

    // Helper function untuk parse number
    const parseNumber = (value: any): number | null => {
      if (!value || value === '') return null
      const num = parseFloat(value)
      return isNaN(num) ? null : num
    }

    // Helper function untuk parse date
    const parseDate = (value: any): Date | null => {
      if (!value || value === '') return null
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date
    }

    const asset = await prisma.asset.update({
      where: { id: params.id },
      data: {
        name: body.name,
        brand: body.brand || null,
        model: body.model || null,
        serialNumber: body.serialNumber || null,
        categoryId: body.categoryId,
        locationId: body.locationId || null,
        assignedTo: body.assignedTo || null,
        status: body.status,
        condition: body.condition,
        purchaseDate: parseDate(body.purchaseDate),
        warrantyExpiry: parseDate(body.warrantyExpiry),
        purchasePrice: parseNumber(body.purchasePrice),
        vendor: body.vendor || null,
        vendorContact: body.vendorContact || null,
        ipAddress: body.ipAddress || null,
        macAddress: body.macAddress || null,
        osVersion: body.osVersion || null,
        notes: body.notes || null,
        rustdeskId: body.rustdeskId || null,
        guacamoleId: body.guacamoleId || null,
      },
      include: {
        category: true,
        location: true,
      },
    })

    return NextResponse.json({ success: true, data: asset })
  } catch (error) {
    console.error('PUT asset error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// ========== DELETE Asset ==========
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

    await prisma.asset.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE asset error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}