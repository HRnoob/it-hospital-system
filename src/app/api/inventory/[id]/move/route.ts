import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { logActivity } from '@/lib/logger'
import { getRequestInfo } from '@/lib/request-info'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string; role: string }
    const body = await request.json()
    const { toLocationId, reason, notes } = body

    if (!toLocationId) {
      return NextResponse.json({ success: false, message: 'Lokasi tujuan wajib diisi' }, { status: 400 })
    }

    // Ambil aset
    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
      include: { location: true },
    })

    if (!asset) {
      return NextResponse.json({ success: false, message: 'Aset tidak ditemukan' }, { status: 404 })
    }

    const fromLocationId = asset.locationId
    const fromLocationName = asset.location?.name || 'Tidak ada lokasi'

    // Cek lokasi tujuan
    const toLocation = await prisma.location.findUnique({
      where: { id: toLocationId },
    })

    if (!toLocation) {
      return NextResponse.json({ success: false, message: 'Lokasi tujuan tidak ditemukan' }, { status: 404 })
    }

    // Update lokasi aset
    const updatedAsset = await prisma.asset.update({
      where: { id: params.id },
      data: { locationId: toLocationId },
      include: { location: true },
    })

    // Catat history perpindahan
    await prisma.assetMovement.create({
      data: {
        assetId: params.id,
        fromLocationId,
        toLocationId,
        movedById: decoded.id,
        reason: reason || 'Pemindahan Ruangan',
        notes: notes || null,
      },
    })

    // Log activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    logActivity({
      userId: decoded.id,
      action: 'MOVE',
      module: 'INVENTORY',
      targetId: asset.id,
      targetName: asset.name,
      detail: { 
        fromLocation: fromLocationName,
        toLocation: toLocation.name,
        reason: reason || 'Pemindahan Ruangan'
      },
      ipAddress,
      userAgent,
    }).catch(console.error)

    return NextResponse.json({ 
      success: true, 
      data: updatedAsset,
      message: `Aset berhasil dipindahkan dari ${fromLocationName} ke ${toLocation.name}`
    })
  } catch (error) {
    console.error('Move asset error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}