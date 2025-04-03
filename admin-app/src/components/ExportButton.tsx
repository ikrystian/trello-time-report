'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportTimeReport, ExportFormat } from '@/lib/export-utils';
import { ProcessedCardData } from '@/types/time-report';
import { toast } from 'sonner';

interface ExportButtonProps {
  timeData: ProcessedCardData[];
  listMap: Record<string, string>;
  memberMap: Record<string, { fullName: string; avatarUrl: string | null }>;
}

export function ExportButton({ timeData, listMap, memberMap }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    try {
      // Close the dropdown menu
      setOpen(false);

      // Generate a unique ID for the loading toast
      const toastId = `export-${format}-${Date.now()}`;

      // Show loading toast
      toast.loading(`Eksportowanie do ${format.toUpperCase()}...`, {
        id: toastId,
        duration: 2000, // Auto-dismiss after 2 seconds
      });

      // Small delay to allow the loading toast to appear
      await new Promise(resolve => setTimeout(resolve, 100));

      // Perform the export
      exportTimeReport(format, timeData, listMap, memberMap);

      // Dismiss the loading toast
      toast.dismiss(toastId);

      // Show a brief notification about the file download starting
      toast.success(`Pobieranie pliku ${format.toUpperCase()}...`, {
        duration: 3000,
        description: 'Plik zostanie zapisany w folderze pobierania'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Błąd podczas eksportu do ${format.toUpperCase()}`);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          <span>Eksportuj</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          Zapisz jako PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Zapisz jako CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          Zapisz jako XLS
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('html')}>
          Zapisz jako HTML
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('txt')}>
          Zapisz jako TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          Zapisz jako JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('xml')}>
          Zapisz jako XML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
