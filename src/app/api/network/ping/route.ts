import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { host } = await request.json()

    if (!host) {
      return NextResponse.json(
        { success: false, message: 'Host is required' },
        { status: 400 }
      )
    }

    const isWindows = process.platform === 'win32'
    const pingCmd = isWindows
      ? `ping -n 1 ${host}`
      : `ping -c 1 ${host}`

    const { stdout } = await execAsync(pingCmd)

    let latency = null
    let status = 'DOWN'

    if (stdout.includes('time=') || stdout.includes('time<')) {
      const match = stdout.match(/time[=:]<?(\d+\.?\d*)/)
      if (match) latency = parseFloat(match[1])
      status = 'OK'
    } else if (stdout.includes('unreachable') || stdout.includes('timed out')) {
      status = 'DOWN'
    }

    return NextResponse.json({
      success: true,
      data: {
        host,
        status,
        latency,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: {
        host: error instanceof Error ? error.message : 'unknown',
        status: 'DOWN',
        latency: null,
        timestamp: new Date().toISOString(),
      },
    })
  }
}