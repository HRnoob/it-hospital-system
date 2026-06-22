import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { logActivity } from '@/lib/logger'
import { getRequestInfo } from '@/lib/request-info'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const token = cookieStore.get('accessToken')?.value

  // Log logout activity jika token ada
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string }
      const { ipAddress, userAgent } = getRequestInfo(request)

      await logActivity({
        userId: decoded.id,
        action: 'LOGOUT',
        module: 'AUTH',
        targetName: decoded.email,
        ipAddress,
        userAgent,
      })
    } catch (error) {
      console.error('Logout log error:', error)
    }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('accessToken')
  response.cookies.delete('refreshToken')

  return response
}