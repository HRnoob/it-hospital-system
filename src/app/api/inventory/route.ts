import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum!'

// ========== GET All Assets ==========
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
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const locationId = searchParams.get('locationId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetCode: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId) where.categoryId = categoryId
    if (locationId) where.locationId = locationId
    if (status) where.status = status

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          location: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.asset.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET inventory error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// ========== POST Create Asset ==========
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

    // Validasi required field
    if (!body.name || !body.categoryId) {
      return NextResponse.json(
        { success: false, message: 'Nama aset dan kategori wajib diisi' },
        { status: 400 }
      )
    }

    // Generate asset code
    const category = await prisma.assetCategory.findUnique({
      where: { id: body.categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Kategori tidak ditemukan' },
        { status: 400 }
      )
    }

    const year = new Date().getFullYear()
    const prefix = category.name.substring(0, 3).toUpperCase()
    
    const lastAsset = await prisma.asset.findFirst({
      where: { assetCode: { startsWith: `${prefix}-${year}` } },
      orderBy: { assetCode: 'desc' },
    })

    let sequence = 1
    if (lastAsset) {
      const lastSeq = parseInt(lastAsset.assetCode.split('-')[2])
      sequence = lastSeq + 1
    }
    
    const assetCode = `${prefix}-${year}-${String(sequence).padStart(3, '0')}`

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

    const asset = await prisma.asset.create({
      data: {
        assetCode,
        name: body.name,
        brand: body.brand || null,
        model: body.model || null,
        serialNumber: body.serialNumber || null,
        categoryId: body.categoryId,
        locationId: body.locationId || null,
        assignedTo: body.assignedTo || null,
        status: body.status || 'ACTIVE',
        condition: body.condition || 'GOOD',
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
    console.error('POST inventory error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}