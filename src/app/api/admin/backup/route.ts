import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { logActivity } from '@/lib/logger'
import { getRequestInfo } from '@/lib/request-info'

const execAsync = promisify(exec)
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

// Cari lokasi pg_dump
function getPgDumpPath(): string {
  const possiblePaths = [
    'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
  ]
  
  for (const pgPath of possiblePaths) {
    if (fs.existsSync(pgPath)) {
      return pgPath
    }
  }
  return 'pg_dump'
}

// POST: Create backup
export async function POST(request: Request) {
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

    const { ipAddress, userAgent } = getRequestInfo(request as any)

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(process.cwd(), 'backups')
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const backupFile = path.join(backupDir, `backup-${timestamp}.sql`)
    const dbUrl = process.env.DATABASE_URL || ''
    
    // Extract database info from DATABASE_URL
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
    if (!match) {
      return NextResponse.json({ success: false, message: 'Invalid DATABASE_URL format' }, { status: 500 })
    }
    
    const [, user, passwordEncoded, host, port, database] = match
    const password = decodeURIComponent(passwordEncoded)
    
    // Set password environment untuk pg_dump
    process.env.PGPASSWORD = password
    
    const pgDumpPath = getPgDumpPath()
    // Backup dengan format plain SQL (bukan custom)
    const command = `"${pgDumpPath}" -h ${host} -p ${port} -U ${user} -d ${database} --inserts -f "${backupFile}"`
    
    console.log('Backup command:', command)
    
    const { stdout, stderr } = await execAsync(command)
    
    if (stderr && !stderr.includes('NOTICE')) {
      console.error('Backup stderr:', stderr)
    }
    
    delete process.env.PGPASSWORD

    // Cek apakah file backup berhasil dibuat
    if (!fs.existsSync(backupFile)) {
      return NextResponse.json({ success: false, message: 'Gagal membuat file backup' }, { status: 500 })
    }

    const fileSize = fs.statSync(backupFile).size
    console.log(`Backup created: ${backupFile} (${fileSize} bytes)`)

    // Log backup activity
    await logActivity({
      userId: decoded.id,
      action: 'BACKUP',
      module: 'BACKUP',
      targetName: path.basename(backupFile),
      detail: { size: fileSize },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Backup berhasil dibuat',
      file: path.basename(backupFile),
      size: fileSize
    })
  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Gagal backup database' 
    }, { status: 500 })
  }
}

// GET: List backups
export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string }
    if (decoded.role !== 'SUPERADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({ success: true, data: [] })
    }

    const files = fs.readdirSync(backupDir).map(file => {
      const stat = fs.statSync(path.join(backupDir, file))
      return {
        name: file,
        size: stat.size,
        createdAt: stat.birthtime
      }
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ success: true, data: files })
  } catch (error) {
    console.error('GET backup error:', error)
    return NextResponse.json({ success: false, data: [] }, { status: 500 })
  }
}