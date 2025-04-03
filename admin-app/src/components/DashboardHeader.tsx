'use client';

import { UserButton } from '@clerk/nextjs';
import { Clock } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function DashboardHeader() {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Trello Time Report</span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
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
