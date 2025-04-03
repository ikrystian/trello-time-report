import { clerkMiddleware } from "@clerk/nextjs/server"; // Changed to clerkMiddleware based on error suggestion

// This simplified setup relies on environment variables for configuration
// See: https://clerk.com/docs/references/nextjs/auth-middleware#configuring-public-and-ignored-routes
export default clerkMiddleware(); // Changed to clerkMiddleware

export const config = {
  // Protects all routes, including api/trpc.
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
