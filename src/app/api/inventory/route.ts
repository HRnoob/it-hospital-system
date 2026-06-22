import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { generateQRCode } from '@/lib/qrcode'
import { logActivity } from '@/lib/logger'
import { getRequestInfo } from '@/lib/request-info'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

// Helper untuk parse number
function parseNumber(value: any): number | null {
  if (!value || value === '') return null
  const num = parseFloat(value)
  return isNaN(num) ? null : num
}

// Helper untuk parse date
function parseDate(value: any): Date | null {
  if (!value || value === '') return null
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date
}

// Helper untuk generate asset code
async function generateAssetCode(categoryId: string): Promise<string> {
  const category = await prisma.assetCategory.findUnique({
    where: { id: categoryId },
  })

  if (!category) {
    throw new Error('Category not found')
  }

  const year = new Date().getFullYear()
  const prefix = category.name.substring(0, 3).toUpperCase()
  
  const lastAsset = await prisma.asset.findFirst({
    where: { assetCode: { startsWith: `${prefix}-${year}` } },
    orderBy: { assetCode: 'desc' },
  })

  let sequence = 1
  if (lastAsset) {
    const parts = lastAsset.assetCode.split('-')
    const lastSeq = parseInt(parts[2])
    sequence = lastSeq + 1
  }
  
  return `${prefix}-${year}-${String(sequence).padStart(3, '0')}`
}

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
    const condition = searchParams.get('condition')
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
    if (condition) where.condition = condition

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

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string; role: string }
    const body = await request.json()

    // Validasi required field
    if (!body.name || !body.categoryId) {
      return NextResponse.json(
        { success: false, message: 'Nama aset dan kategori wajib diisi' },
        { status: 400 }
      )
    }

    // Generate asset code
    let assetCode: string
    try {
      assetCode = await generateAssetCode(body.categoryId)
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Kategori tidak ditemukan' },
        { status: 400 }
      )
    }

    // Create asset tanpa QR dulu untuk dapat ID
    const newAsset = await prisma.asset.create({
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
    })

    // Generate QR Code
    let qrCodeUrl = ''
    try {
      qrCodeUrl = await generateQRCode(assetCode, newAsset.id)
      await prisma.asset.update({
        where: { id: newAsset.id },
        data: { qrCodeUrl },
      })
    } catch (error) {
      console.error('QR Code generation failed:', error)
      // QR gagal, tapi asset tetap tersimpan
    }

    // Fetch final asset dengan relasi
    const asset = await prisma.asset.findUnique({
      where: { id: newAsset.id },
      include: {
        category: true,
        location: true,
      },
    })

    // Log activity (setelah asset berhasil dibuat)
    const { ipAddress, userAgent } = getRequestInfo(request)
    logActivity({
      userId: decoded.id,
      action: 'CREATE',
      module: 'INVENTORY',
      targetId: asset?.id,
      targetName: asset?.name,
      detail: { assetCode: asset?.assetCode },
      ipAddress,
      userAgent,
    }).catch(console.error)

    return NextResponse.json({ success: true, data: asset })
  } catch (error) {
    console.error('POST inventory error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}