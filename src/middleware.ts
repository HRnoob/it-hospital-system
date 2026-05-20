import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Route yang perlu login
const protectedRoutes = [
  '/dashboard',
  '/morning-check',
  '/inventory',
  '/issues',
  '/kanban',
  '/reports',
  '/remote',
  '/admin',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page and API
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Static files
  if (pathname.includes('/_next') || pathname.includes('/favicon.ico')) {
    return NextResponse.next()
  }

  // Check if route needs authentication
  const needsAuth = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (!needsAuth && pathname !== '/') {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get('accessToken')?.value

  // If no token and needs auth, redirect to login
  if (!token && needsAuth) {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  // If no token and root path, redirect to login
  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If token exists, assume it's valid (verifikasi akan dilakukan di API)
  // Redirect from login to dashboard if authenticated
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}