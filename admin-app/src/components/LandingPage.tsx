'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import LandingPageContent from './LandingPageContent';

export default function LandingPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user has been logged out
    if (searchParams.has('logged_out')) {
      // Show toast notification
      toast.success('Wylogowano pomyślnie', {
        description: 'Dziękujemy za korzystanie z Trello Time Report',
        duration: 3000,
      });
    }
  }, [searchParams]);

  return <LandingPageContent />;
}
