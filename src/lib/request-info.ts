import { NextRequest } from 'next/server'

export function getRequestInfo(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') 
    || request.headers.get('x-real-ip') 
    || request.ip 
    || 'Unknown'
  
  const userAgent = request.headers.get('user-agent') || 'Unknown'
  
  return { ipAddress, userAgent }
}