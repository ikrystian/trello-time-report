import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LandingPage from '@/components/LandingPage';

// This server component handles the root path '/'
// It checks authentication status and redirects to dashboard only if user is logged in
export default async function RootPage() {
  const { userId } = await auth();

  // If the user is logged in, redirect to the dashboard
  if (userId) {
    redirect('/dashboard');
  }

  // If not logged in, show the landing page (no redirect to sign-in)
  return <LandingPage />;
}
