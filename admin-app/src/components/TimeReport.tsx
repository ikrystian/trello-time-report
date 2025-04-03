'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format } from 'date-fns'; // Use date-fns for date formatting
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button"; // Import Button for toggle

// Interfaces (can be moved to a common types file)
interface TimeEntry {
    memberId?: string;
    date?: string;
    hours: number;
    comment: string;
}

interface TrelloLabel {
    id: string;
    name: string;
    color: string;
}

interface ProcessedCardData {
    cardId: string;
    cardName: string;
    cardUrl: string;
    listId: string;
    memberIds: string[];
    labels: TrelloLabel[];
    estimatedHours: number;
    timeEntries: TimeEntry[];
}

interface TimeReportProps {
    timeData: ProcessedCardData[];
    listMap: Record<string, string>;
    memberMap: Record<string, string>;
}

// Helper function to format hours (e.g., 8.5, 8)
function formatHours(hours: number | null | undefined): string {
    const num = Number(hours) || 0;
    if (Math.abs(num - Math.round(num)) < 0.001) {
        return num.toString();
    } else {
        return parseFloat(num.toFixed(1)).toString();
    }
}

// Helper function to format date string
function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'B/D'; // Brak Danych
    try {
        return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Błędna data';
    }
}

// --- Sub-components for better structure ---

// CardEntryItem is removed, logic moved into CardGroup's table

interface CardGroupProps {
    card: ProcessedCardData & { totalReportedHours: number }; // Add calculated total
    memberMap: Record<string, string>;
    defaultOpen?: boolean;
}

function CardGroup({ card, memberMap, defaultOpen = true }: CardGroupProps) {
    const sortedEntries = useMemo(() =>
        [...card.timeEntries].sort((a, b) => (b.date && a.date) ? new Date(b.date).getTime() - new Date(a.date).getTime() : 0)
    , [card.timeEntries]);

    return (
        <details className="border rounded mb-2 " open={defaultOpen}>
            <summary className="list-none p-2cursor-pointer font-semibold text-sm rounded-t flex justify-between items-center relative pl-6 group">
                {/* Triangle Marker */}
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs transition-transform duration-200 details-marker">▶</span>
                <span className="flex-grow mr-2 overflow-hidden overflow-ellipsis whitespace-nowrap">
                    {card.cardName}
                    <a
                        href={card.cardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2  opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Otwórz kartę w Trello"
                        onClick={(e) => e.stopPropagation()} // Prevent closing details on link click
                    >
                        🔗
                    </a>
                </span>
                <span className="text-xs font-normal text-muted-foreground whitespace-nowrap">
                    (Szac: {formatHours(card.estimatedHours)}h / Rap: {formatHours(card.totalReportedHours)}h)
                </span>
            </summary>
            <div className="border-t">
                {sortedEntries.length > 0 ? (
                    <Table className="text-xs">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Użytkownik</TableHead>
                                <TableHead className="w-[100px]">Data</TableHead>
                                <TableHead className="w-[80px] text-right">Godziny</TableHead>
                                <TableHead>Komentarz</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedEntries.map((entry, index) => {
                                const userName = entry.memberId ? memberMap[entry.memberId] || entry.memberId : 'B/D';
                                const dateStr = formatDate(entry.date);
                                const hoursStr = formatHours(entry.hours);
                                return (
                                    <TableRow key={`${entry.date}-${entry.memberId}-${index}`}>
                                        <TableCell className="font-medium">{userName}</TableCell>
                                        <TableCell>{dateStr}</TableCell>
                                        <TableCell className="text-right">{hoursStr}h</TableCell>
                                        <TableCell>{entry.comment || ''}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="px-3 py-2 text-xs text-muted-foreground italic">Brak wpisów czasu.</p>
                )}
            </div>
        </details>
    );
}


// --- Main TimeReport Component ---

export default function TimeReport({ timeData, listMap, memberMap }: TimeReportProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [allOpen, setAllOpen] = useState(true); // State to track if all details should be open

    // Group and sort data
    const groupedAndSortedData = useMemo(() => {
        if (!timeData || timeData.length === 0) return [];

        const groupedByList = timeData.reduce((acc, card) => {
            const listId = card.listId || 'unknown-list';
            if (!acc[listId]) {
                acc[listId] = {
                    listName: listMap[listId] || 'Nieznana Lista',
                    cards: [],
                    totalReportedHours: 0,
                    totalEstimatedHours: 0,
                };
            }
            // Calculate total reported hours for the card *within this grouping*
            const cardReportedHours = card.timeEntries.reduce(
                (sum, entry) => sum + (entry.hours || 0),
                0
            );

            // Only add card if it has reported hours
            if (cardReportedHours > 0) {
                 acc[listId].cards.push({ ...card, totalReportedHours: cardReportedHours });
                 acc[listId].totalReportedHours += cardReportedHours;
                 acc[listId].totalEstimatedHours += card.estimatedHours || 0;
            }

            return acc;
        }, {} as Record<string, { listName: string; cards: (ProcessedCardData & { totalReportedHours: number })[]; totalReportedHours: number; totalEstimatedHours: number }>);

        // Filter out lists with no cards (after card filtering) and sort lists
        return Object.values(groupedByList)
            .filter(listGroup => listGroup.cards.length > 0)
            .sort((a, b) => a.listName.localeCompare(b.listName))
            .map(listGroup => ({
                ...listGroup,
                // Sort cards within each list
                cards: listGroup.cards.sort((a, b) => a.cardName.localeCompare(b.cardName))
            }));

    }, [timeData, listMap]);

    // Toggle all details elements within the report
    const toggleAllDetails = () => {
        const newState = !allOpen;
        setAllOpen(newState);
        if (containerRef.current) {
            containerRef.current.querySelectorAll('details').forEach(detail => {
                detail.open = newState;
            });
        }
    };

     // Effect to apply 'allOpen' state when it changes (e.g., after initial render or toggle)
     useEffect(() => {
        if (containerRef.current) {
            containerRef.current.querySelectorAll('details').forEach(detail => {
                detail.open = allOpen;
            });
        }
    }, [allOpen, groupedAndSortedData]); // Re-apply if data changes

    if (groupedAndSortedData.length === 0) {
        return <p className="text-center text-gray-500 py-4">Nie znaleziono wpisów czasu dla wybranych filtrów.</p>;
    }

    return (
        <div ref={containerRef}>
            <div className="mb-2 text-right">
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllDetails}
                >
                    {allOpen ? 'Zwiń Wszystkie' : 'Rozwiń Wszystkie'}
                </Button>
            </div>

            {groupedAndSortedData.map((listGroup) => (
                <details key={listGroup.listName} className="border rounded mb-4 " open={allOpen}>
                    <summary className="list-none p-3  cursor-pointer font-bold text-base rounded-t flex justify-between items-center relative pl-8 group">
                         {/* Triangle Marker */}
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-blue-700 text-sm transition-transform duration-200 details-marker">▶</span>
                        <span className="flex-grow mr-2">{listGroup.listName}</span>
                        <span className="text-sm font-normal text-gray-700">
                            (Est: {formatHours(listGroup.totalEstimatedHours)}h / Rep: {formatHours(listGroup.totalReportedHours)}h)
                        </span>
                    </summary>
                    <div className="p-2 pl-4 border-t">
                        {listGroup.cards.map((card) => (
                            <CardGroup key={card.cardId} card={card} memberMap={memberMap} defaultOpen={allOpen} />
                        ))}
                    </div>
                </details>
            ))}
            {/* Simple CSS to handle the details marker rotation */}
            <style jsx global>{`
                details[open] > summary .details-marker {
                    transform: translateY(-50%) rotate(90deg);
                }
            `}</style>
        </div>
    );
