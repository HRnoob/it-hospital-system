import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { writeFile } from 'fs/promises'
import { logActivity } from '@/lib/logger'
import { getRequestInfo } from '@/lib/request-info'

const execAsync = promisify(exec)
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

// Cari lokasi psql
function getPsqlPath(): string {
  const possiblePaths = [
    'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe',
    'C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe',
    'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe',
    'C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe',
  ]
  
  for (const pgPath of possiblePaths) {
    if (fs.existsSync(pgPath)) {
      return pgPath
    }
  }
  return 'psql'
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string }
    if (decoded.role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const { ipAddress, userAgent } = getRequestInfo(request)
    const formData = await request.formData()
    const file = formData.get('backupFile') as File

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
    }

    // Cek ekstensi file (hanya .sql)
    const fileName = file.name
    const fileExt = path.extname(fileName).toLowerCase()
    if (fileExt !== '.sql') {
      return NextResponse.json({ success: false, message: 'Invalid file format. Use .sql file' }, { status: 400 })
    }

    // Simpan file sementara
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const tempFilePath = path.join(tempDir, `restore-${Date.now()}.sql`)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(tempFilePath, buffer)

    // Extract database info dari DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || ''
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
    if (!match) {
      return NextResponse.json({ success: false, message: 'Invalid DATABASE_URL format' }, { status: 500 })
    }

    const [, user, passwordEncoded, host, port, database] = match
    const password = decodeURIComponent(passwordEncoded)
    process.env.PGPASSWORD = password

    const psqlPath = getPsqlPath()
    
    // Perintah restore untuk file .sql
    const command = `"${psqlPath}" -h ${host} -p ${port} -U ${user} -d ${database} -f "${tempFilePath}"`

    console.log('Restore command:', command)

    const { stdout, stderr } = await execAsync(command)
    
    delete process.env.PGPASSWORD

    // Hapus file temporary
    fs.unlinkSync(tempFilePath)

    // Log restore activity
    await logActivity({
      userId: decoded.id,
      action: 'RESTORE',
      module: 'BACKUP',
      targetName: fileName,
      detail: { success: true },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Database restored successfully',
      output: stdout,
      error: stderr
    })
  } catch (error) {
    console.error('Restore error:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Restore failed' },
      { status: 500 }
    )
  }
}