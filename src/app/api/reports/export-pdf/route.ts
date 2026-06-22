import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { renderToStream } from '@react-pdf/renderer'
import PDFTemplate from '@/components/reports/PDFTemplate'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    jwt.verify(token, JWT_SECRET)

    const { type, startDate, endDate, data, settings } = await request.json()

    if (!data) {
      return NextResponse.json({ success: false, message: 'Data laporan tidak ditemukan' }, { status: 400 })
    }

    // Generate PDF
    const pdfStream = await renderToStream(
      PDFTemplate({ type, data, settings, startDate, endDate })
    )

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      pdfStream.on('data', (chunk) => chunks.push(chunk))
      pdfStream.on('end', () => resolve(Buffer.concat(chunks)))
      pdfStream.on('error', reject)
    })

    // Ubah Buffer ke Uint8Array biar NextResponse bisa terima
    const pdfUint8Array = new Uint8Array(pdfBuffer)

    return new NextResponse(pdfUint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="laporan-${type}-${startDate}-to-${endDate}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Export PDF error:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal export PDF' },
      { status: 500 }
    )
  }
}