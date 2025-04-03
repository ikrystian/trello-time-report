'use client';

import React, { useMemo } from 'react'; // Removed useState, useRef, useEffect
import { format } from 'date-fns'; // Use date-fns for date formatting
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
// Removed Button import as toggle button is removed
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"; // Import Accordion components

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

interface CardGroupProps {
    card: ProcessedCardData & { totalReportedHours: number }; // Add calculated total
    memberMap: Record<string, string>;
    // defaultOpen prop is no longer needed for Accordion
}

// Note: CardGroup now returns an AccordionItem, intended to be used within an Accordion
function CardGroup({ card, memberMap }: CardGroupProps) {
    const sortedEntries = useMemo(() =>
        [...card.timeEntries].sort((a, b) => (b.date && a.date) ? new Date(b.date).getTime() - new Date(a.date).getTime() : 0)
    , [card.timeEntries]);

    // Using AccordionItem for each card. The parent component should wrap these in <Accordion type="multiple">
    return (
        <AccordionItem value={card.cardId} className="border rounded mb-2 bg-background">
             <AccordionTrigger className="p-2 text-sm font-semibold hover:no-underline group rounded-t">
                 {/* Removed the manual triangle span */}
                 <span className="flex-grow mr-2 overflow-hidden overflow-ellipsis whitespace-nowrap text-left">
                    {card.cardName}
                    <a
                        href={card.cardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Otwórz kartę w Trello"
                        onClick={(e) => e.stopPropagation()} // Prevent closing details on link click
                    >
                        🔗
                    </a>
                </span>
                <span className="text-xs font-normal text-muted-foreground whitespace-nowrap pr-2"> {/* Added padding right */}
                    (Szac: {formatHours(card.estimatedHours)}h / Rap: {formatHours(card.totalReportedHours)}h)
                </span>
            </AccordionTrigger>
            <AccordionContent className="border-t pt-0"> {/* Remove default padding-top */}
                 {/* Content remains largely the same (Table or message) */}
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
            </AccordionContent>
        </AccordionItem>
    );
}


// --- Main TimeReport Component ---

export default function TimeReport({ timeData, listMap, memberMap }: TimeReportProps) {
    // Removed containerRef, allOpen state, toggleAllDetails, and useEffect for allOpen

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

    // Calculate default open values for the accordion (all list names)
    const defaultAccordionValues = useMemo(() => groupedAndSortedData.map(lg => lg.listName), [groupedAndSortedData]);

    // Calculate default open values for the nested card accordions (all card IDs)
    const defaultCardAccordionValues = useMemo(() => {
        return groupedAndSortedData.flatMap(listGroup => listGroup.cards.map(card => card.cardId));
    }, [groupedAndSortedData]);

    if (groupedAndSortedData.length === 0) {
        return <p className="text-center text-muted-foreground py-4">Nie znaleziono wpisów czasu dla wybranych filtrów.</p>; // Use muted-foreground
    }

    return (
        // Removed containerRef and toggle button div
        <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full space-y-4">
            {groupedAndSortedData.map((listGroup) => (
                <AccordionItem key={listGroup.listName} value={listGroup.listName} className="border rounded bg-muted/30">
                    <AccordionTrigger className="p-3 text-base font-bold hover:no-underline rounded-t">
                        {/* Removed manual triangle span */}
                        <span className="flex-grow mr-2 text-left">{listGroup.listName}</span>
                        <span className="text-sm font-normal text-muted-foreground whitespace-nowrap pr-2">
                            (Est: {formatHours(listGroup.totalEstimatedHours)}h / Rep: {formatHours(listGroup.totalReportedHours)}h)
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="p-2 pl-4 border-t">
                        {/* CardGroup now returns AccordionItems, wrap them in another Accordion */}
                        {/* Set default values for nested accordion to keep cards open initially */}
                        <Accordion type="multiple" defaultValue={defaultCardAccordionValues} className="w-full space-y-2">
                             {listGroup.cards.map((card) => (
                                <CardGroup key={card.cardId} card={card} memberMap={memberMap} />
                            ))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
        // Removed style jsx global block
    );
}
