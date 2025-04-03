import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// This server component handles the root path '/'
// It checks authentication status and redirects accordingly.
export default async function RootPage() {
  const { userId } = await auth();

  if (userId) {
    // If the user is logged in, redirect to the dashboard
    redirect('/dashboard');
  } else {
    // If the user is not logged in, redirect to the sign-in page
    redirect('/sign-in');
  }

  // This part should technically not be reached due to redirects
  return null;
}
