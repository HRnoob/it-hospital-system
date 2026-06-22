import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    jwt.verify(token, JWT_SECRET)

    const { assetIds } = await request.json()

    if (!assetIds || assetIds.length === 0) {
      return NextResponse.json({ success: false, message: 'No assets selected' }, { status: 400 })
    }

    const assets = await prisma.asset.findMany({
      where: { id: { in: assetIds } },
      select: { 
        id: true, 
        assetCode: true, 
        name: true, 
        qrCodeUrl: true,
        location: { select: { name: true } } 
      }
    })

    // Generate HTML for printing
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cetak QR Code - IT Hospital System</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            background: white;
          }
          .qr-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .qr-card {
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            page-break-inside: avoid;
          }
          .qr-card img {
            width: 200px;
            height: 200px;
            margin: 0 auto;
          }
          .asset-code {
            font-weight: bold;
            font-size: 14px;
            margin-top: 10px;
            font-family: monospace;
          }
          .asset-name {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          .asset-location {
            font-size: 10px;
            color: #999;
            margin-top: 3px;
          }
          @media print {
            .qr-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            .qr-card {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="qr-grid">
          ${assets.map(asset => `
            <div class="qr-card">
              <img src="${process.env.APP_URL || 'http://localhost:3005'}${asset.qrCodeUrl || `/qrcodes/${asset.assetCode}.png`}" />
              <div class="asset-code">${asset.assetCode}</div>
              <div class="asset-name">${asset.name}</div>
              <div class="asset-location">${asset.location?.name || '-'}</div>
            </div>
          `).join('')}
        </div>
        <script>
          window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }
        <\/script>
      </body>
      </html>
    `

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    console.error('Print QR error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}