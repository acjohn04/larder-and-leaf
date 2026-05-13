import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js 16 "proxy" — replaces the deprecated middleware.ts convention.
 *
 * This is a lightweight UX redirect layer. It checks for an Auth.js
 * session cookie and bounces unauthenticated visitors to /login.
 *
 * Real authorization is still enforced inside every server action and
 * API route via `requireAuth()`.  The proxy is defense-in-depth for UX,
 * not the sole security boundary.
 */
export function proxy(request: NextRequest) {
  console.log(`[proxy] ${request.method} ${request.nextUrl.pathname} | DEMO_MODE=${process.env.DEMO_MODE}`)

  // Demo mode: skip all auth checks, go straight to the app.
  if (process.env.DEMO_MODE === 'true') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Always allow the login page itself.
  if (pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  // Auth.js sets different cookie names depending on the environment:
  //   development → "authjs.session-token"
  //   production  → "__Secure-authjs.session-token"
  const hasSession =
    request.cookies.has('authjs.session-token') ||
    request.cookies.has('__Secure-authjs.session-token')

  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
