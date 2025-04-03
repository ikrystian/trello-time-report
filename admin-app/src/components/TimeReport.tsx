'use client';

import React, { useMemo, useState } from 'react'; // Added useState
import Image from 'next/image'; // Import Next.js Image component
import { formatDatePL } from '@/lib/date-utils'; // Use date-fns for date formatting
import { Button } from "@/components/ui/button"; // Import Button
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
// Removed Button import as toggle button is removed
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"; // Import Accordion components

// Import types from types file
import { ProcessedCardData } from '@/types/time-report';

interface TimeReportProps {
    timeData: ProcessedCardData[];
    listMap: Record<string, string>;
    memberMap: Record<string, { fullName: string; avatarUrl: string | null }>;
}

// Helper function to format hours with 2 decimal places
function formatHours(hours: number | null | undefined): string {
    const num = Number(hours) || 0;
    return num.toFixed(2);
}

// Helper function to format date string
function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'B/D'; // Brak Danych
    try {
        return formatDatePL(new Date(dateString));
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Błędna data';
    }
}

// Helper function to get CSS color from Trello label color
function getTrelloLabelColor(color: string | undefined): string {
    if (!color) return '#B3B3B3'; // Default gray for no color

    // Map Trello colors to CSS colors
    const colorMap: Record<string, string> = {
        'green': '#61BD4F',
        'yellow': '#F2D600',
        'orange': '#FF9F1A',
        'red': '#EB5A46',
        'purple': '#C377E0',
        'blue': '#0079BF',
        'sky': '#00C2E0',
        'lime': '#51E898',
        'pink': '#FF78CB',
        'black': '#344563',
    };

    return colorMap[color] || '#B3B3B3'; // Return mapped color or default gray
}

// --- Sub-components for better structure ---

interface CardGroupProps {
    card: ProcessedCardData & { totalReportedHours: number }; // Add calculated total
    memberMap: Record<string, { fullName: string; avatarUrl: string | null }>;
    // defaultOpen prop is no longer needed for Accordion
}

// Note: CardGroup now returns an AccordionItem, intended to be used within an Accordion
function CardGroup({ card, memberMap }: CardGroupProps) {
    const sortedEntries = useMemo(() =>
        [...card.timeEntries].sort((a, b) => (b.date && a.date) ? new Date(b.date).getTime() - new Date(a.date).getTime() : 0)
    , [card.timeEntries]);

    // Get the first label color if available
    const labelColor = card.labels && card.labels.length > 0 ? getTrelloLabelColor(card.labels[0].color) : undefined;

    // Using AccordionItem for each card. The parent component should wrap these in <Accordion type="multiple">
    return (
        <AccordionItem value={card.cardId} className="border rounded mb-2 bg-background">
             <AccordionTrigger className="p-2 text-sm font-semibold hover:no-underline group rounded-t">
                 {/* Removed the manual triangle span */}
                 <div className="flex items-center flex-grow mr-2 overflow-hidden">
                    {/* Colored square for label */}
                    {labelColor && (
                        <div
                            className="w-3 h-3 mr-2 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: labelColor }}
                        />
                    )}
                    <span className="overflow-hidden overflow-ellipsis whitespace-nowrap text-left">
                        {card.cardName}
                    </span>
                </div>
                <span className="text-xs font-normal text-muted-foreground whitespace-nowrap pr-2"> {/* Added padding right */}
                    (Szac: {formatHours(card.estimatedHours)}h / Rap: {formatHours(card.totalReportedHours)}h)
                </span>
                <a
                    href={card.cardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 opacity-70 hover:opacity-100 transition-all duration-200 hover:text-primary hover:scale-110"
                    title="Otwórz kartę w Trello"
                    onClick={(e) => e.stopPropagation()} // Prevent closing details on link click
                >
                    🔗
                </a>
            </AccordionTrigger>
            <AccordionContent className="border-t pt-0"> {/* Remove default padding-top */}
                 {/* Content remains largely the same (Table or message) */}
                 {sortedEntries.length > 0 ? (
                    <Table className="text-sm">
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
                                const userName = entry.memberId ? memberMap[entry.memberId]?.fullName || entry.memberId : 'B/D';
                                const dateStr = formatDate(entry.date);
                                const hoursStr = formatHours(entry.hours);
                                return (
                                    <TableRow key={`${entry.date}-${entry.memberId}-${index}`}>
                                        <TableCell className="font-medium text-sm">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center gap-2">
                                                    {entry.memberId && memberMap[entry.memberId]?.avatarUrl ? (
                                                        <Image
                                                            src={memberMap[entry.memberId].avatarUrl!} // Add non-null assertion if confident it exists
                                                            alt={memberMap[entry.memberId].fullName || 'Avatar'} // Provide default alt text
                                                            width={24} // Corresponds to w-6
                                                            height={24} // Corresponds to h-6
                                                            className="rounded-full" // Keep the rounding
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                                            {userName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{userName}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                        <TableCell className="text-sm">{dateStr}</TableCell>
                                        <TableCell className="text-right text-sm">{hoursStr}h</TableCell>
                                        <TableCell className="text-sm">{entry.comment || ''}</TableCell>
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


// --- Report Summary Component ---

interface ReportSummaryProps {
    totalPlannedHours: number;
    totalLoggedHours: number;
    totalTasks: number;
    hoursByLabel: Record<string, { name: string; color: string; hours: number }>;
}

function ReportSummary({ totalPlannedHours, totalLoggedHours, totalTasks, hoursByLabel }: ReportSummaryProps) {
    return (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <CardTitle>Podsumowanie raportu</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 rounded-lg border bg-card">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Zaplanowane godziny</h3>
                        <p className="text-2xl font-bold">{formatHours(totalPlannedHours)}h</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Zaraportowane godziny</h3>
                        <p className="text-2xl font-bold">{formatHours(totalLoggedHours)}h</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Liczba zadań</h3>
                        <p className="text-2xl font-bold">{totalTasks}</p>
                    </div>
                </div>

                {Object.keys(hoursByLabel).length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium mb-2">Godziny według etykiet</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(hoursByLabel)
                                .sort(([, a], [, b]) => b.hours - a.hours)
                                .map(([labelId, label]) => (
                                    <div key={labelId} className="flex items-center gap-2 p-2 rounded-md border">
                                        <div
                                            className="w-4 h-4 rounded-sm flex-shrink-0"
                                            style={{ backgroundColor: getTrelloLabelColor(label.color) }}
                                        />
                                        <span className="text-sm truncate flex-grow">
                                            {label.name || `(${label.color})`}
                                        </span>
                                        <span className="text-sm font-medium">{formatHours(label.hours)}h</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// --- Main TimeReport Component ---

export default function TimeReport({ timeData, listMap, memberMap }: TimeReportProps) {
    // Calculate summary data
    const summaryData = useMemo(() => {
        let totalPlannedHours = 0;
        let totalLoggedHours = 0;
        const hoursByLabel: Record<string, { name: string; color: string; hours: number }> = {};

        // Calculate hours by label and totals
        timeData.forEach(card => {
            // Add to total planned hours
            totalPlannedHours += card.estimatedHours || 0;

            // Calculate reported hours for this card
            const cardReportedHours = card.timeEntries.reduce(
                (sum, entry) => sum + (entry.hours || 0),
                0
            );

            // Add to total logged hours
            totalLoggedHours += cardReportedHours;

            // Process labels
            if (cardReportedHours > 0 && card.labels && card.labels.length > 0) {
                // Distribute hours equally among all labels of the card
                const hoursPerLabel = cardReportedHours / card.labels.length;

                card.labels.forEach(label => {
                    if (!hoursByLabel[label.id]) {
                        hoursByLabel[label.id] = {
                            name: label.name,
                            color: label.color,
                            hours: 0
                        };
                    }
                    hoursByLabel[label.id].hours += hoursPerLabel;
                });
            }
        });

        // Count total number of tasks (cards with time entries)
        const totalTasks = timeData.filter(card =>
            card.timeEntries.some(entry => entry.hours > 0)
        ).length;

        return {
            totalPlannedHours,
            totalLoggedHours,
            totalTasks,
            hoursByLabel
        };
    }, [timeData]);

    // Define the type for grouped data
    type ListGroup = {
        listName: string;
        cards: (ProcessedCardData & { totalReportedHours: number })[];
        totalReportedHours: number;
        totalEstimatedHours: number;
    };

    // Group and sort data
    const groupedAndSortedData = useMemo<ListGroup[]>(() => {
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

    // Calculate all possible list names and card IDs for expand/collapse all
    const allListNames = useMemo(() => groupedAndSortedData.map((lg: { listName: string }) => lg.listName), [groupedAndSortedData]);
    const allCardIds = useMemo(() => {
        return groupedAndSortedData.flatMap((listGroup: { cards: { cardId: string }[] }) =>
            listGroup.cards.map(card => card.cardId)
        );
    }, [groupedAndSortedData]);

    // State to control open list accordions - expanded by default
    const [openListIds, setOpenListIds] = useState<string[]>(allListNames);
    // State to control open card accordions - collapsed by default
    const [openCardIds, setOpenCardIds] = useState<string[]>([]);

    // Determine if everything is currently expanded
    const isAllExpanded = openListIds.length === allListNames.length && openCardIds.length === allCardIds.length;

    // Initialize open states when data changes
    React.useEffect(() => {
        setOpenListIds(allListNames); // Keep lists expanded by default
        setOpenCardIds([]); // Keep cards collapsed by default
    }, [allListNames, allCardIds]); // Depend on the calculated lists/cards

    const toggleAll = () => {
        if (isAllExpanded) {
            // Collapse all
            setOpenListIds([]);
            setOpenCardIds([]);
        } else {
            // Expand all
            setOpenListIds(allListNames);
            setOpenCardIds(allCardIds);
        }
    };

    if (groupedAndSortedData.length === 0) {
        return <p className="text-center text-muted-foreground py-4">Nie znaleziono wpisów czasu dla wybranych filtrów.</p>;
    }

    return (
        <div className="w-full">
            {/* Report Summary */}
            <ReportSummary
                totalPlannedHours={summaryData.totalPlannedHours}
                totalLoggedHours={summaryData.totalLoggedHours}
                totalTasks={summaryData.totalTasks}
                hoursByLabel={summaryData.hoursByLabel}
            />

            <div className="mb-4 flex justify-end items-center">
                <Button variant="outline" size="sm" onClick={toggleAll}>
                    {isAllExpanded ? 'Zwiń wszystko' : 'Rozwiń wszystko'}
                </Button>
            </div>
            {/* Outer Accordion now controlled by state */}
            <Accordion
                type="multiple"
                value={openListIds}
                onValueChange={setOpenListIds}
                className="w-full space-y-4"
            >
                {groupedAndSortedData.map((listGroup) => (
                    <AccordionItem key={listGroup.listName} value={listGroup.listName} className="border rounded bg-muted/30">
                    <AccordionTrigger className="p-3 text-base font-bold hover:no-underline rounded-t">
                        {/* Removed manual triangle span */}
                        <span className="flex-grow mr-2 text-left">{listGroup.listName}</span>
                        <span className="text-sm font-normal text-muted-foreground whitespace-nowrap pr-2">
                            (Szac: {formatHours(listGroup.totalEstimatedHours)}h / Rep: {formatHours(listGroup.totalReportedHours)}h)
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="p-2 pl-4 border-t border-b">
                        {/* Inner Accordion now controlled by state */}
                        <Accordion
                            type="multiple"
                            value={openCardIds}
                            onValueChange={setOpenCardIds}
                            className="w-full space-y-2"
                        >
                             {listGroup.cards.map((card) => (
                                <CardGroup key={card.cardId} card={card} memberMap={memberMap} />
                            ))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
        </div>
    );
}
