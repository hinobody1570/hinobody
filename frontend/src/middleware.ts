import { NextRequest, NextResponse } from 'next/server';

// Middleware - no locale in URL, just pass through
// Locale is handled via localStorage/cookie in the app
export default function middleware(request: NextRequest) {
  // Just pass through - no locale handling needed
  return NextResponse.next();
}

export const config = {
  // Match all pathnames except static files and API routes
  matcher: [
    // Match all paths except Next.js internals and static files
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};

