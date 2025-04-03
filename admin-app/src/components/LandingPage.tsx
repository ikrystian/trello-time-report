'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
// Import the component AND the dictionary type it expects
import LandingPageContent, { type LandingPageContentDictionary } from './LandingPageContent';

// No need for a separate LandingPageDictionary type here anymore

// Define the props type for LandingPage using the imported type
// We also need the toast part of the dictionary now
interface LandingPageProps {
  dictionary: LandingPageContentDictionary & {
    toast: { loggedOutTitle: string; loggedOutDescription: string; };
  };
  // Remove lang: string;
}

export default function LandingPage({ dictionary }: LandingPageProps) { // Remove lang from props
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user has been logged out
    if (searchParams.has('logged_out')) {
      // Use dictionary for toast messages
      const toastTitle = dictionary.toast.loggedOutTitle;
      const toastDescription = dictionary.toast.loggedOutDescription;

      // Show toast notification
      toast.success(toastTitle, {
        description: toastDescription,
        duration: 3000,
      });
    }
  }, [searchParams, dictionary]); // Use dictionary in dependency array

  // Pass only the dictionary down to the content component
  return <LandingPageContent dictionary={dictionary} />; // Remove lang prop
}
