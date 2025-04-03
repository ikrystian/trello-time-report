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

// Define dictionary structure for ExportButton
export interface ExportButtonDictionary {
    exportLabel: string;
    saveAsPDF: string;
    saveAsCSV: string;
    saveAsXLS: string;
    saveAsHTML: string;
    saveAsTXT: string;
    saveAsJSON: string;
    saveAsXML: string;
    exportingTo: string; // e.g., "Exporting to {format}..."
    downloadingFile: string; // e.g., "Downloading {format} file..."
    downloadFolderInfo: string;
    exportError: string; // e.g., "Error exporting to {format}"
}

interface ExportButtonProps {
  timeData: ProcessedCardData[];
  listMap: Record<string, string>;
  memberMap: Record<string, { fullName: string; avatarUrl: string | null }>;
  dictionary: ExportButtonDictionary; // Add dictionary prop
}

export function ExportButton({ timeData, listMap, memberMap, dictionary }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    const formatUpper = format.toUpperCase(); // Define formatUpper here, outside try block
    try {
      // Close the dropdown menu
      setOpen(false);

      // Generate a unique ID for the loading toast
      const toastId = `export-${format}-${Date.now()}`;

      // Show loading toast using dictionary
      toast.loading(dictionary.exportingTo.replace('{format}', formatUpper), {
        id: toastId,
        duration: 2000,
      });

      // Small delay to allow the loading toast to appear
      await new Promise(resolve => setTimeout(resolve, 100));

      // Perform the export
      exportTimeReport(format, timeData, listMap, memberMap);

      // Dismiss the loading toast
      toast.dismiss(toastId);

      // Show success toast using dictionary
      toast.success(dictionary.downloadingFile.replace('{format}', formatUpper), {
        duration: 3000,
        description: dictionary.downloadFolderInfo
      });
    } catch (error) {
      console.error('Export error:', error);
      // Show error toast using dictionary (formatUpper is now accessible)
      toast.error(dictionary.exportError.replace('{format}', formatUpper));
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          <span>{dictionary.exportLabel}</span> {/* Use dictionary */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Use dictionary for items */}
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          {dictionary.saveAsPDF}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          {dictionary.saveAsCSV}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          {dictionary.saveAsXLS}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('html')}>
          {dictionary.saveAsHTML}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('txt')}>
          {dictionary.saveAsTXT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          {dictionary.saveAsJSON}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('xml')}>
          {dictionary.saveAsXML}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
