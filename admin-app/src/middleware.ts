import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Check if the path requires authentication (root page or API routes)
  // Exclude internal Next.js paths like /_next/
  if (!ADMIN_PASSWORD) {
    console.warn("ADMIN_PASSWORD environment variable not set. Skipping authentication.");
    return NextResponse.next();
  }

  if (pathname === '/' || pathname.startsWith('/api/')) {
    const providedPassword = searchParams.get('password');

    if (providedPassword !== ADMIN_PASSWORD) {
      // Respond with 401 Unauthorized
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  // Allow the request to proceed if authenticated or path doesn't require auth
  return NextResponse.next();
}

// Configure the matcher to run middleware only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /login (if you had a dedicated login page)
     * Apply to root ('/') and all API routes ('/api/:path*')
     */
    '/((?!_next/static|_next/image|favicon.ico).*)', // General matcher excluding static assets
    '/', // Explicitly match root
    '/api/:path*', // Match all API routes
   ],
   // Refine the matcher to be more specific if needed, e.g.:
   // matcher: ['/', '/api/:path*']
   // Be cautious with broad matchers like the one above, ensure it doesn't block necessary assets.
   // The provided matcher aims to protect the page and API while allowing static assets.
};
