import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

const QR_CODES_DIR = path.join(process.cwd(), 'public', 'qrcodes')

// Pastikan folder qrcodes ada
if (!fs.existsSync(QR_CODES_DIR)) {
  fs.mkdirSync(QR_CODES_DIR, { recursive: true })
}

export async function generateQRCode(assetCode: string, assetId: string): Promise<string> {
  const appUrl = process.env.APP_URL || 'http://localhost:3005'
  const qrData = `${appUrl}/inventory/${assetId}`
  const fileName = `${assetCode}.png`
  const filePath = path.join(QR_CODES_DIR, fileName)
  const publicPath = `/qrcodes/${fileName}`

  console.log('Generating QR Code...')
  console.log('  QR Data:', qrData)
  console.log('  File Path:', filePath)

  try {
    await QRCode.toFile(filePath, qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    
    // Verifikasi file benar-benar ada
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      console.log('✅ QR Code created:', publicPath, `(${stats.size} bytes)`)
    } else {
      console.error('❌ File not found after generation!')
      throw new Error('File not created')
    }
    
    return publicPath
  } catch (error) {
    console.error('❌ QR Code generation failed:', error)
    throw error
  }
}