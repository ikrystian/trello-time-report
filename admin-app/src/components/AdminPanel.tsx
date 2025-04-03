'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Filters from './Filters'; // Import the Filters component
import TimeReport from './TimeReport'; // Import the TimeReport component
import Charts from './Charts'; // Import the Charts component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import shadcn Tabs
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components

// Define interfaces based on the API response structure
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
    memberMap: Record<string, string>;
    boardLabels: TrelloLabel[];
}

interface AdminPanelProps {
    boardId: string; // Receive selected board ID as a prop
}

export default function AdminPanel({ boardId }: AdminPanelProps) {
    const [timeData, setTimeData] = useState<ProcessedCardData[]>([]);
    const [listMap, setListMap] = useState<Record<string, string>>({});
    const [memberMap, setMemberMap] = useState<Record<string, string>>({});
    const [boardLabels, setBoardLabels] = useState<TrelloLabel[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // TODO: Add state for filters (dates, user, label)
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [selectedLabelId, setSelectedLabelId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<string>('report'); // State for active tab

    // Define tabs
    const TABS = [
        { id: 'report', label: 'Raport Czasu' },
        { id: 'charts', label: 'Wykresy' },
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
            const response = await axios.get<TimeDataResponse>(
                `/api/boards/${boardId}/time-data?${params.toString()}`
            );
            setTimeData(response.data.timeData);
            setListMap(response.data.listMap);
            setMemberMap(response.data.memberMap);
            setBoardLabels(response.data.boardLabels);
        } catch (err: unknown) {
            console.error('Error fetching time data:', err);
            let message = 'Nie udało się pobrać danych czasu.';
             if (axios.isAxiosError(err) && err.response?.data?.message) {
                 message = err.response.data.message;
             } else if (err instanceof Error) {
                 message = err.message;
             }
            setError(message);
            // Clear data on error
            setTimeData([]);
            setListMap({});
            setMemberMap({});
            setBoardLabels([]);
        } finally {
            setIsLoading(false);
        }
    }, [boardId, startDate, endDate, selectedUserId, selectedLabelId]); // Dependencies for useCallback

    // Fetch data when boardId changes or filters change
    useEffect(() => {
        fetchTimeData();
    }, [fetchTimeData]); // Use the memoized fetch function

    return (
        <Card className="w-full max-w-4xl mt-6">
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
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onUserChange={setSelectedUserId}
                onLabelChange={setSelectedLabelId}
                onApplyFilters={fetchTimeData} // Pass the fetch function
            />

            {/* Display loading/error specifically for the data section */}
            {isLoading && !timeData.length && <p className="text-center">Ładowanie danych...</p>}
            {error && <p className="text-center text-red-600 py-4">Błąd: {error}</p>}

            {!isLoading && !error && timeData.length > 0 && (
                 <Tabs defaultValue="report" className="w-full mt-4" onValueChange={setActiveTab} value={activeTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        {TABS.map((tab) => (
                            <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value="report">
                        <TimeReport
                            timeData={timeData}
                            listMap={listMap}
                            memberMap={memberMap}
                        />
                    </TabsContent>
                    <TabsContent value="charts">
                        <Charts
                            timeData={timeData}
                            listMap={listMap}
                            memberMap={memberMap}
                        />
                    </TabsContent>
                 </Tabs>
            )}
            {!isLoading && !error && timeData.length === 0 && (
                 <p className="text-center text-muted-foreground py-4">Nie znaleziono wpisów czasu dla wybranych filtrów.</p>
            )}
            </CardContent>
        </Card>
    );
}
