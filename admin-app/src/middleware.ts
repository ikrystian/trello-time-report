import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
// Removed unused imports: NextRequest, matchLocale, Negotiator, locales

// Removed unused getLocale function

// Define public routes using createRouteMatcher
const isPublicRoute = createRouteMatcher([
  '/', // Root landing page
  '/sign-in(.*)', // Sign-in routes
  '/sign-up(.*)', // Sign-up routes
  '/api/(.*)', // Allow all API routes for now (adjust if needed)
]);

export default clerkMiddleware((auth, request) => {
  // --- Debugging Log ---
  const path = request.nextUrl.pathname;
  console.log(`Middleware triggered for path: ${path}`);
  console.log("Middleware - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Loaded" : "MISSING");
  // --- End Debugging Log ---

  // Check if the route is public BEFORE i18n logic
  if (isPublicRoute(request)) {
    console.log(`Path ${path} is public.`);
    // Allow public route access - Clerk handles its own routes like sign-in
    // We will add back i18n redirection for root/missing locale later
    return NextResponse.next(); // Proceed without protection
  }

  // If it's not a public route, protect it
  console.log(`Path ${path} is protected. Running auth.protect().`);
  auth.protect(); // Protect the route - Call protect on the auth object directly

  // If protected and authenticated, proceed
  return NextResponse.next();
});

export const config = {
  // Matcher remains the same
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/'],
};
