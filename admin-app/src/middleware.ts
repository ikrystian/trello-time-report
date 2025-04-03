import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// Removed unused NextResponse import

// Define public routes using createRouteMatcher
// Note: API routes are included here as public. If specific API routes need protection,
// they should be removed from this list and handled differently (e.g., checking auth within the route handler).
const isPublicRoute = createRouteMatcher([
  '/', // Root landing page
  '/sign-in(.*)', // Sign-in routes
  '/sign-up(.*)', // Sign-up routes
  '/api/(.*)', // Treat all API routes as public in the middleware layer
]);

export default clerkMiddleware((auth, req) => {
  // Check if the route is NOT public. If it's not public, protect it.
  if (!isPublicRoute(req)) {
    auth.protect(); // Correct: Call protect directly on the auth object provided by the middleware
  }
  // For public routes or authenticated protected routes, the middleware implicitly allows the request to proceed.
  // No explicit NextResponse.next() is needed here after the protect() call.
});

export const config = {
  // Updated matcher to include API routes while excluding static files/internal paths
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
