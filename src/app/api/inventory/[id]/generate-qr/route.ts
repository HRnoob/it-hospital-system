import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateQRCode } from '@/lib/qrcode'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

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

    jwt.verify(token, JWT_SECRET)

    const asset = await prisma.asset.findUnique({
      where: { id: params.id }
    })

    if (!asset) {
      return NextResponse.json({ success: false, message: 'Asset not found' }, { status: 404 })
    }

    // Generate QR Code
    const qrCodeUrl = await generateQRCode(asset.assetCode, asset.id)

    // Update database
    await prisma.asset.update({
      where: { id: params.id },
      data: { qrCodeUrl }
    })

    // Verifikasi file benar-benar bisa diakses
    const filePath = path.join(process.cwd(), 'public', 'qrcodes', `${asset.assetCode}.png`)
    const fileExists = fs.existsSync(filePath)

    return NextResponse.json({ 
      success: true, 
      qrCodeUrl,
      fileExists,
      filePath
    })
  } catch (error) {
    console.error('Generate QR error:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Server error' 
    }, { status: 500 })
  }
}