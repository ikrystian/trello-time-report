'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Filters, { type FiltersDictionary } from './Filters';
import TimeReport, { type TimeReportDictionary } from './TimeReport';
import Charts, { type ChartsDictionary } from './Charts';
import { type ExportButtonDictionary } from './ExportButton'; // Import ExportButtonDictionary
import { SkeletonAccordion } from './SkeletonAccordion';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// Define interfaces based on the API response structure (keep as is)
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

interface TimeDataResponse {
    timeData: ProcessedCardData[];
    listMap: Record<string, string>;
    memberMap: Record<string, { fullName: string; avatarUrl: string | null }>;
    boardLabels: TrelloLabel[];
}

// Define the dictionary structure needed for AdminPanel and its children
// This should align with the main Dictionary type
export interface AdminPanelDictionary {
    dashboard: {
        title: string; // Dashboard title (might be needed?)
        selectBoard: string;
        loadingBoards: string;
        noBoards: string;
        generateReport: string;
        export: string;
        filters: string;
        dateRange: string;
        startDate: string;
        endDate: string;
        timeReport: string;
        loadingData: string;
        noData: string;
        totalTime: string;
        charts: string;
        // Add specific strings for AdminPanel itself
        errorFetchingTimeData: string;
        noEntriesFound: string;
        // Use imported/defined types for child component dictionaries
        filtersSection: FiltersDictionary;
        timeReportSection: TimeReportDictionary;
        chartsSection: ChartsDictionary;
        exportButtonSection: ExportButtonDictionary; // Add export button section
    };
    common: {
        loading: string;
        error: string;
    };
    // Add other top-level keys if needed
}


interface AdminPanelProps {
    boardId: string;
    fromDate?: Date;
    toDate?: Date;
    userId?: string;
    label?: string;
    onDateChange?: (range: { from?: Date; to?: Date }) => void;
    onUserChange?: (userId: string) => void;
    onLabelChange?: (labelId: string) => void;
    dictionary: AdminPanelDictionary; // Add dictionary prop
    // Remove lang: string;
}

export default function AdminPanel({
    boardId,
    fromDate,
    toDate,
    userId,
    label,
    onDateChange,
    onUserChange,
    onLabelChange,
    dictionary, // Destructure new props
    // Remove lang
}: AdminPanelProps) {
    const [timeData, setTimeData] = useState<ProcessedCardData[]>([]);
    const [listMap, setListMap] = useState<Record<string, string>>({});
    const [memberMap, setMemberMap] = useState<Record<string, { fullName: string; avatarUrl: string | null }>>({});
    const [boardLabels, setBoardLabels] = useState<TrelloLabel[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize filter states with props or defaults
    const [startDate, setStartDate] = useState<Date | null>(fromDate || null);
    const [endDate, setEndDate] = useState<Date | null>(toDate || null);
    const [selectedUserId, setSelectedUserId] = useState<string>(userId || '');
    const [selectedLabelId, setSelectedLabelId] = useState<string>(label || '');
    const [activeTab, setActiveTab] = useState<string>('report'); // State for active tab

    // Handle filter changes with callbacks to parent
    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
        if (onDateChange && date) {
            onDateChange({ from: date, to: endDate || undefined });
        }
    };

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
        if (onDateChange && date) {
            onDateChange({ from: startDate || undefined, to: date });
        }
    };

    const handleUserChange = (userId: string) => {
        setSelectedUserId(userId);
        if (onUserChange) {
            onUserChange(userId);
        }
    };

    const handleLabelChange = (labelId: string) => {
        setSelectedLabelId(labelId);
        if (onLabelChange) {
            onLabelChange(labelId);
        }
    };

    // Define tabs using dictionary
    const TABS = [
        { id: 'report', label: dictionary.dashboard.timeReport },
        { id: 'charts', label: dictionary.dashboard.charts },
    ];

    // Function to fetch time data
    const fetchTimeData = useCallback(async () => {
        if (!boardId) return;

        setIsLoading(true);
        setError(null);

        // Construct query parameters based on filter state
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString().split('T')[0]);
        if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);
        if (selectedUserId) params.append('userId', selectedUserId);
        if (selectedLabelId) params.append('labelId', selectedLabelId);

        try {
            // Use localized API route if needed, otherwise keep relative
            const response = await axios.get<TimeDataResponse>(
                `/api/boards/${boardId}/time-data?${params.toString()}`
            );
            setTimeData(response.data.timeData);
            setListMap(response.data.listMap);
            setMemberMap(response.data.memberMap);
            setBoardLabels(response.data.boardLabels);
        } catch (err: unknown) {
            console.error('Error fetching time data:', err);
            // Use dictionary for error message
            let message = dictionary.dashboard.errorFetchingTimeData || 'Failed to fetch time data.';
             if (axios.isAxiosError(err) && err.response?.data?.message) {
                 message = err.response.data.message;
             } else if (err instanceof Error) {
                 message = err.message;
             }
            setError(message);
            // Clear data on error
            setTimeData([]); // Keep clearing data
            setListMap({});
            setMemberMap({});
            setBoardLabels([]);
        } finally {
            setIsLoading(false);
        }
    // Include dictionary in dependencies if error messages depend on it
    }, [boardId, startDate, endDate, selectedUserId, selectedLabelId, dictionary]);

    // Fetch data when boardId changes or filters change
    useEffect(() => {
        fetchTimeData();
    }, [fetchTimeData]); // Use the memoized fetch function

    return (
        <Card className="w-full max-w-7xl mt-6">
            <CardContent>
                {/* Render Filters Component */}
                <Filters
                memberMap={memberMap}
                boardLabels={boardLabels}
                startDate={startDate}
                endDate={endDate}
                selectedUserId={selectedUserId}
                selectedLabelId={selectedLabelId}
                isLoading={isLoading}
                timeData={timeData}
                listMap={listMap}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onUserChange={handleUserChange}
                onLabelChange={handleLabelChange}
                onApplyFilters={fetchTimeData} // Pass the fetch function
                // Pass the specific dictionary sections to Filters
                dictionary={dictionary.dashboard.filtersSection}
                exportButtonDictionary={dictionary.dashboard.exportButtonSection} // Pass the export button dictionary
                // Remove lang prop
            />

            {/* Display loading/error specifically for the data section */}
            {isLoading && !timeData.length && (
                <div className="mt-6">
                    <SkeletonAccordion listCount={3} cardCount={4} />
                </div>
            )}
            {/* Use dictionary for error display */}
            {error && <p className="text-center text-destructive py-4">{`${dictionary.common.error}: ${error}`}</p>}

            {!isLoading && !error && timeData.length > 0 && (
                 <Tabs defaultValue="report" className="w-full mt-4" onValueChange={setActiveTab} value={activeTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        {TABS.map((tab) => (
                            <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value="report">
                        {isLoading && timeData.length > 0 ? (
                            <div className="mt-6">
                                <SkeletonAccordion listCount={2} cardCount={3} />
                            </div>
                        ) : (
                            <TimeReport
                                timeData={timeData}
                                listMap={listMap}
                                memberMap={memberMap}
                                // Pass dictionary to TimeReport
                                // TODO: Define TimeReportProps and TimeReportDictionary type in TimeReport.tsx
                                dictionary={dictionary.dashboard.timeReportSection}
                                // Remove lang prop
                            />
                        )}
                    </TabsContent>
                    <TabsContent value="charts">
                        {isLoading && timeData.length > 0 ? (
                            <div className="mt-6 p-4">
                                <div className="space-y-6">
                                    {/* Skeletons for charts */}
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-48" />
                                        <Skeleton className="h-64 w-full rounded-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-48" />
                                        <Skeleton className="h-64 w-full rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Charts
                                timeData={timeData}
                                listMap={listMap}
                                memberMap={memberMap}
                                // Pass dictionary to Charts
                                // TODO: Define ChartsProps and ChartsDictionary type in Charts.tsx
                                dictionary={dictionary.dashboard.chartsSection}
                                // lang prop removed as Charts no longer accepts it
                            />
                        )}
                    </TabsContent>
                 </Tabs>
            )}
            {/* Use dictionary for no entries message */}
            {!isLoading && !error && timeData.length === 0 && (
                 <p className="text-center text-muted-foreground py-4">{dictionary.dashboard.noEntriesFound}</p>
            )}
            </CardContent>
        </Card>
    );
}
