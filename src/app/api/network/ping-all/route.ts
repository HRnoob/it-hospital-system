import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const targets = [
  { name: 'Google DNS', host: '8.8.8.8', category: 'Internet' },
  { name: 'Server SIMRS', host: '10.0.101.192', category: 'Server Aplikasi' },
  { name: 'Server Database', host: '10.0.101.191', category: 'Server Database' },
]

async function pingHost(host: string): Promise<{ status: string; latency: number | null }> {
  try {
    const isWindows = process.platform === 'win32'
    const pingCmd = isWindows
      ? `ping -n 2 ${host}`
      : `ping -c 2 ${host}`

    const { stdout } = await execAsync(pingCmd)

    let latency = null
    let status = 'DOWN'

    if (stdout.includes('time=') || stdout.includes('time<')) {
      const match = stdout.match(/time[=:]<?(\d+\.?\d*)/)
      if (match) latency = parseFloat(match[0].replace(/time[=:]<|ms/g, ''))
      status = latency && latency > 100 ? 'SLOW' : 'OK'
    } else if (stdout.includes('time<')) {
      const match = stdout.match(/time<(\d+)/)
      if (match) latency = parseInt(match[1])
      status = 'OK'
    } else if (stdout.includes('unreachable') || stdout.includes('timed out')) {
      status = 'DOWN'
    }

    return { status, latency }
  } catch (error) {
    return { status: 'DOWN', latency: null }
  }
}

export async function POST() {
  try {
    const results = await Promise.all(
      targets.map(async (target) => {
        const { status, latency } = await pingHost(target.host)
        return {
          ...target,
          status,
          latency,
          timestamp: new Date().toISOString(),
        }
      })
    )

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error('Ping all error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to ping targets' },
      { status: 500 }
    )
  }
}