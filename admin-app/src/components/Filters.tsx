'use client';

import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { pl } from 'date-fns/locale'; // Import only Polish locale
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ExportButton, type ExportButtonDictionary } from "@/components/ExportButton"; // Re-add ExportButtonDictionary import
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ProcessedCardData } from '@/types/time-report';

// Define interfaces from parent or common types file
interface TrelloLabel {
    id: string;
    name: string;
    color: string;
}

// Define dictionary structure for Filters
export interface FiltersDictionary {
    dateRangeLabel: string;
    datePickerPlaceholder: string;
    userFilterLabel: string;
    userFilterPlaceholder: string;
    labelFilterLabel: string;
    labelFilterPlaceholder: string;
    applyButton: string;
    loadingButton: string;
    noNameLabel: string;
    // exportButtonSection: ExportButtonDictionary; // Removed: This belongs at the dashboard level, not within filters
}

interface FiltersProps {
    memberMap: Record<string, { fullName: string; avatarUrl: string | null }>;
    boardLabels: TrelloLabel[];
    startDate: Date | null;
    endDate: Date | null;
    selectedUserId: string;
    selectedLabelId: string;
    isLoading: boolean;
    timeData?: ProcessedCardData[];
    listMap?: Record<string, string>;
    onStartDateChange: (date: Date | null) => void;
    onEndDateChange: (date: Date | null) => void;
    onUserChange: (userId: string) => void;
    onLabelChange: (labelId: string) => void;
    onApplyFilters: () => void;
    dictionary: FiltersDictionary; // Dictionary for Filters component itself
    exportButtonDictionary: ExportButtonDictionary; // Dictionary specifically for ExportButton
    // Remove lang: string;
}

export default function Filters({
    memberMap,
    boardLabels,
    startDate,
    endDate,
    selectedUserId,
    selectedLabelId,
    isLoading,
    timeData = [],
    listMap = {},
    onStartDateChange,
    onEndDateChange,
    onUserChange,
    onLabelChange,
    onApplyFilters,
    dictionary, // Destructure Filters dictionary
    exportButtonDictionary, // Destructure ExportButton dictionary
    // Remove lang,
}: FiltersProps) {

    // Set date-fns locale to Polish
    const dateLocale = pl;

    // Sort members and labels for dropdowns
    const sortedMembers = Object.entries(memberMap).sort(([, memberA], [, memberB]) =>
        memberA.fullName.localeCompare(memberB.fullName)
    );
    const sortedLabels = [...boardLabels].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
    );

    // State for the DateRangePicker
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startDate ?? undefined,
        to: endDate ?? undefined,
    });

    // Update parent state when dateRange changes
    useEffect(() => {
        onStartDateChange(dateRange?.from ?? null);
        onEndDateChange(dateRange?.to ?? null);
    }, [dateRange, onStartDateChange, onEndDateChange]);

    // Update local state if parent props change
     useEffect(() => {
        if (startDate !== dateRange?.from || endDate !== dateRange?.to) {
            setDateRange({ from: startDate ?? undefined, to: endDate ?? undefined });
        }
        // Intentionally disable exhaustive-deps, we only want this to run when parent props change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);


    return (
        <div className="mb-6 p-4 border rounded flex flex-wrap gap-4 items-end">
            {/* Date Range Picker */}
            <div className="grid gap-2">
                <Label>{dictionary.dateRangeLabel}</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "flex-1 justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                            )}
                            disabled={isLoading}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                             {dateRange?.from ? (
                                 dateRange.to ? (
                                     <>
                                         {format(dateRange.from, "d MMM yyyy", { locale: dateLocale })} -{" "}
                                         {format(dateRange.to, "d MMM yyyy", { locale: dateLocale })}
                                     </>
                                 ) : (
                                     format(dateRange.from, "d MMM yyyy", { locale: dateLocale })
                                 )
                             ) : (
                                 <span>{dictionary.datePickerPlaceholder}</span>
                             )}
                         </Button>
                     </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                             selected={dateRange}
                             onSelect={setDateRange}
                             numberOfMonths={2}
                             locale={dateLocale} // Use dynamic locale
                         />
                     </PopoverContent>
                 </Popover>
            </div>

            {/* User Filter */}
            <div className="grid gap-1.5 min-w-[180px]">
                <Label htmlFor="user-select">{dictionary.userFilterLabel}</Label>
                <Select
                    value={selectedUserId}
                    onValueChange={onUserChange}
                    disabled={isLoading || sortedMembers.length === 0}
                >
                    <SelectTrigger id="user-select" className="w-full">
                        <SelectValue placeholder={dictionary.userFilterPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Removed: <SelectItem value="">Wszyscy Użytkownicy</SelectItem> */}
                        {sortedMembers.map(([id, member]) => (
                            <SelectItem key={id} value={id}>
                                {member.fullName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Label Filter */}
            <div className="grid gap-1.5 min-w-[180px]">
                <Label htmlFor="label-select">{dictionary.labelFilterLabel}</Label>
                <Select
                    value={selectedLabelId}
                    onValueChange={onLabelChange}
                    disabled={isLoading || sortedLabels.length === 0}
                >
                    <SelectTrigger id="label-select" className="w-full">
                        <SelectValue placeholder={dictionary.labelFilterPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Add an explicit "All Labels" option? Or rely on placeholder */}
                        {sortedLabels.map((label) => (
                            <SelectItem key={label.id} value={label.id}>
                                {label.name || `${dictionary.noNameLabel} - ${label.color}`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Apply Button and Export Button */}
            <div className="flex items-end gap-2"> {/* Align buttons with the bottom of other filters */}
                <Button
                    onClick={onApplyFilters}
                    disabled={isLoading}
                >
                    {isLoading ? dictionary.loadingButton : dictionary.applyButton}
                </Button>

                {/* Export Button - TODO: Internationalize ExportButton component */}
                {timeData.length > 0 && (
                    <ExportButton
                        timeData={timeData}
                        listMap={listMap}
                        memberMap={memberMap}
                        // Pass the specific dictionary for ExportButton
                        dictionary={exportButtonDictionary}
                    />
                )}
            </div>
        </div>
    );
}

// Add some basic CSS for the date picker input width if needed,
// or rely on Tailwind flex-grow/min-w.
// You might need a global CSS file to import 'react-datepicker/dist/react-datepicker.css'
// or import it directly in the component as done above.
