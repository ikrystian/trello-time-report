'use client';

import React, { useState, useEffect } from 'react'; // Add useState, useEffect
import { format } from "date-fns"; // Remove addDays
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker"; // Import DateRange
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

// Define interfaces from parent or common types file
interface TrelloLabel {
    id: string;
    name: string;
    color: string;
}

interface FiltersProps {
    memberMap: Record<string, string>;
    boardLabels: TrelloLabel[];
    startDate: Date | null;
    endDate: Date | null;
    selectedUserId: string;
    selectedLabelId: string;
    isLoading: boolean;
    onStartDateChange: (date: Date | null) => void;
    onEndDateChange: (date: Date | null) => void;
    onUserChange: (userId: string) => void;
    onLabelChange: (labelId: string) => void;
    onApplyFilters: () => void; // Function to trigger data fetch
}

export default function Filters({
    memberMap,
    boardLabels,
    startDate,
    endDate,
    selectedUserId,
    selectedLabelId,
    isLoading,
    onStartDateChange,
    onEndDateChange,
    onUserChange,
    onLabelChange,
    onApplyFilters,
}: FiltersProps) {

    // Sort members and labels for dropdowns
    const sortedMembers = Object.entries(memberMap).sort(([, nameA], [, nameB]) =>
        nameA.localeCompare(nameB)
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
                <Label>Zakres Dat</Label>
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
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Wybierz zakres dat</span>
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
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* User Filter */}
            <div className="grid gap-1.5 min-w-[180px]">
                <Label htmlFor="user-select">Użytkownik</Label>
                <Select
                    value={selectedUserId}
                    onValueChange={onUserChange}
                    disabled={isLoading || sortedMembers.length === 0}
                >
                    <SelectTrigger id="user-select" className="w-full">
                        <SelectValue placeholder="Wszyscy Użytkownicy" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Removed: <SelectItem value="">Wszyscy Użytkownicy</SelectItem> */}
                        {sortedMembers.map(([id, name]) => (
                            <SelectItem key={id} value={id}>
                                {name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Label Filter */}
            <div className="grid gap-1.5 min-w-[180px]">
                <Label htmlFor="label-select">Etykieta</Label>
                <Select
                    value={selectedLabelId}
                    onValueChange={onLabelChange}
                    disabled={isLoading || sortedLabels.length === 0}
                >
                    <SelectTrigger id="label-select" className="w-full">
                        <SelectValue placeholder="Wszystkie Etykiety" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Removed: <SelectItem value="">Wszystkie Etykiety</SelectItem> */}
                        {sortedLabels.map((label) => (
                            <SelectItem key={label.id} value={label.id}>
                                {label.name || `(Brak Nazwy - ${label.color})`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Apply Button */}
            <div className="flex items-end"> {/* Align button with the bottom of other filters */}
                 {/* This button might not be strictly necessary if useEffect triggers on filter changes,
                     but keeping it provides explicit user control like the original */}
                <Button
                    onClick={onApplyFilters}
                    disabled={isLoading}
                >
                    {isLoading ? 'Ładowanie...' : 'Zastosuj Filtry'}
                </Button>
                 {/* TODO: Add Export CSV Button */}
                 {/* <Button variant="outline" className="ml-2" disabled={isLoading}>
                    Eksportuj CSV
                 </button> */}
            </div>
        </div>
    );
}

// Add some basic CSS for the date picker input width if needed,
// or rely on Tailwind flex-grow/min-w.
// You might need a global CSS file to import 'react-datepicker/dist/react-datepicker.css'
// or import it directly in the component as done above.
