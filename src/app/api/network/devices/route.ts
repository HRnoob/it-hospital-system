import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

async function pingHost(host: string): Promise<{ status: string; latency: number | null }> {
  try {
    const isWindows = process.platform === 'win32'
    const pingCmd = isWindows ? `ping -n 1 ${host}` : `ping -c 1 ${host}`
    const { stdout } = await execAsync(pingCmd)
    
    let latency = null
    let status = 'OFFLINE'
    
    if (stdout.includes('time=') || stdout.includes('time<')) {
      const match = stdout.match(/time[=:]<?(\d+\.?\d*)/)
      if (match) latency = parseFloat(match[1])
      status = 'ONLINE'
    }
    return { status, latency }
  } catch {
    return { status: 'OFFLINE', latency: null }
  }
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('accessToken')?.value
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    
    jwt.verify(token, JWT_SECRET)
    
    // Ambil device dengan IP address dari tabel asset
    const devices = await prisma.asset.findMany({
      where: {
        ipAddress: { not: null },
        category: {
          name: { in: ['Switch', 'Router', 'Access Point', 'Server'] }
        }
      },
      select: {
        id: true,
        name: true,
        ipAddress: true,
        category: { select: { name: true } }
      },
      take: 5
    })
    
    // Ping setiap device
    const devicesWithStatus = await Promise.all(
      devices.map(async (device) => {
        const { status, latency } = await pingHost(device.ipAddress!)
        return {
          id: device.id,
          name: device.name,
          ipAddress: device.ipAddress,
          category: device.category.name,
          status,
          latency
        }
      })
    )
    
    return NextResponse.json({ success: true, data: devicesWithStatus })
  } catch (error) {
    console.error('GET network devices error:', error)
    return NextResponse.json({ success: false, data: [] }, { status: 500 })
  }
}