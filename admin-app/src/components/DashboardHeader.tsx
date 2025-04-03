'use client';

import { UserButton, useClerk } from '@clerk/nextjs';
import { Clock, LogOut } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function DashboardHeader() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    // After signing out, redirect to the home page
    router.push('/');
    // Show a toast notification
    toast.success('Wylogowano pomyślnie', {
      description: 'Dziękujemy za korzystanie z Trello Time Report',
      position: 'top-center',
      duration: 3000,
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Trello Time Report</span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Wyloguj</span>
          </Button>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-10 w-10"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}
