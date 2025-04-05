'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import AdminPanel from '@/components/AdminPanel'; // Removed unused AdminPanelDictionary import
import { type FiltersDictionary } from './Filters'; // Import FiltersDictionary
import { type TimeReportDictionary } from './TimeReport'; // Import TimeReportDictionary
import { type ChartsDictionary } from './Charts'; // Import ChartsDictionary
import { type ExportButtonDictionary } from './ExportButton'; // Import ExportButtonDictionary
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

// Define the structure of a board object
interface Board {
  id: string;
  name: string;
  closed?: boolean;
}

// Define a dictionary structure that includes both wrapper-specific strings
// and the structure needed by AdminPanel.
// This should align with the main Dictionary type.
export interface DashboardPageDictionary { // Renamed for clarity
  title: string; // App title (passed down)
  dashboard: {
    // Strings used directly by the wrapper
    selectBoard: string;
    boardSelectLabel: string;
    boardSelectPlaceholder: string;
    boardSelectError: string;
    boardSelectLoading: string;
    boardSelectRetry: string;
    boardSelectNoBoardsFound: string;
    boardSelectNoBoardsAccess: string;
    boardSelectActiveBoardsLabel: string;
    boardSelectClosedBoardsLabel: string;
    boardSelectNoActiveBoards: string;
    errorLoadingBoards: string;

    // Strings/sections passed down to AdminPanel
    title: string; // AdminPanel might use this?
    // selectBoard: string; // Removed duplicate
    loadingBoards: string; // Used by AdminPanel?
    noBoards: string; // Used by AdminPanel?
    generateReport: string; // Used by AdminPanel?
    export: string; // Used by AdminPanel?
    filters: string; // Used by AdminPanel?
    dateRange: string; // Used by AdminPanel?
    startDate: string; // Used by AdminPanel?
    endDate: string; // Used by AdminPanel?
    timeReport: string; // Used by AdminPanel?
    loadingData: string; // Used by AdminPanel?
    noData: string; // Used by AdminPanel?
    totalTime: string; // Used by AdminPanel?
    charts: string; // Used by AdminPanel?
    errorFetchingTimeData: string; // Used by AdminPanel
    noEntriesFound: string; // Used by AdminPanel

    // Nested dictionaries for child components of AdminPanel
    filtersSection: FiltersDictionary;
    timeReportSection: TimeReportDictionary;
    chartsSection: ChartsDictionary;
    exportButtonSection: ExportButtonDictionary;
  };
  common: {
    loading: string;
    error: string;
  };
  // Add other sections if needed by AdminPanel props
}

interface AdminPanelWrapperProps {
  initialOpenBoards: Board[];
  initialClosedBoards: Board[];
  initialError: string | null;
  initialFromDate: string; // Receive dates as ISO strings
  initialToDate: string;
  // Use the new comprehensive dictionary type
  dictionary: DashboardPageDictionary;
  // Remove lang: string;
}

export default function AdminPanelWrapper({
  initialOpenBoards,
  initialClosedBoards,
  initialError,
  initialFromDate,
  initialToDate,
  dictionary,
  // Remove lang,
}: AdminPanelWrapperProps) {
  const [openBoards, setOpenBoards] = useState<Board[]>(initialOpenBoards);
  const [closedBoards, setClosedBoards] = useState<Board[]>(initialClosedBoards);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  // Parse ISO strings back to Date objects
  const [selectedFromDate, setSelectedFromDate] = useState<Date>(new Date(initialFromDate));
  const [selectedToDate, setSelectedToDate] = useState<Date>(new Date(initialToDate));
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [isLoadingBoards, setIsLoadingBoards] = useState<boolean>(!initialOpenBoards && !initialClosedBoards && !initialError); // Initial loading state based on props
  const [errorBoards, setErrorBoards] = useState<string | null>(initialError);
  const allBoards = useMemo(() => {
    return [...openBoards, ...closedBoards];
  }, [openBoards, closedBoards]);

  // Function to fetch boards on client-side (e.g., for retry)
  const fetchBoards = async () => {
    setIsLoadingBoards(true);
    setErrorBoards(null);
    try {
      // Use the localized API route if your API needs it, otherwise keep relative
      const response = await axios.get<Board[]>(`/api/boards`); // Adjust API path if needed
      const fetchedBoards = response.data;

      // Sort boards alphabetically by name using 'pl' locale
      const sortedBoards = [...fetchedBoards].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
      setOpenBoards(sortedBoards.filter(board => !board.closed));
      setClosedBoards(sortedBoards.filter(board => board.closed));
    } catch (error: unknown) {
      console.error('Client-side error fetching boards:', error);
      let message = dictionary.dashboard.errorLoadingBoards || 'Failed to load boards.'; // Use dictionary
      if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            // Redirect to sign-in page if unauthorized (remove lang prefix)
            window.location.href = `/sign-in`;
            return;
          }
          message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
          message = error.message;
      }
      setErrorBoards(message);
    } finally {
      setIsLoadingBoards(false);
    }
  };

  // Effect to load board selection from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBoardId = localStorage.getItem('selectedBoardId');
        if (savedBoardId) {
          // Validate against initially loaded boards before setting state
          const boardExists = [...initialOpenBoards, ...initialClosedBoards].some(b => b.id === savedBoardId);
          if (boardExists) {
            setSelectedBoardId(savedBoardId);
            console.log('Loaded and validated board selection from localStorage:', savedBoardId);
          } else if (savedBoardId) {
             console.warn('Saved board ID from localStorage not found in initial boards, ignoring.');
             localStorage.removeItem('selectedBoardId'); // Clean up invalid entry
          }
        }
      } catch (error) {
        console.error('Error loading board selection from localStorage:', error);
      }
    }
    // Run only once on mount, using initial boards for validation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

   // Effect to re-validate selected board if boards list changes (e.g., after retry)
   useEffect(() => {
    if (selectedBoardId && allBoards.length > 0) {
      const boardExists = allBoards.some((board: Board) => board.id === selectedBoardId);
      if (!boardExists) {
        console.warn('Selected board not found after board list update, resetting selection');
        setSelectedBoardId('');
        localStorage.removeItem('selectedBoardId');
      }
    }
  }, [allBoards, selectedBoardId]); // Re-run if boards or selection changes


  // Handler for shadcn Select component
  const handleBoardSelect = (value: string) => {
    setSelectedBoardId(value);
    try {
      localStorage.setItem('selectedBoardId', value);
    } catch (error) {
      console.error('Error saving board selection to localStorage:', error);
    }
  };

  // Handlers for other filters (passed to AdminPanel)
  const handleDateChange = (range: { from?: Date; to?: Date }) => {
    if (range.from) setSelectedFromDate(range.from);
    if (range.to) setSelectedToDate(range.to);
  };

  const handleUserSelect = (value: string) => {
    setSelectedUserId(value);
  };

  const handleLabelSelect = (value: string) => {
    setSelectedLabel(value);
  };

  return (
    <>
      <Card className="w-full max-w-7xl mx-auto mb-6">
        <CardHeader>
          {/* Use dictionary */}
          <CardTitle>{dictionary.dashboard.selectBoard}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-1.5">
            {/* Use dictionary */}
            <Label htmlFor="board-select">{dictionary.dashboard.boardSelectLabel}</Label>
            <Select
              value={selectedBoardId}
              onValueChange={handleBoardSelect}
              disabled={isLoadingBoards || !!errorBoards || allBoards.length === 0}
            >
              <SelectTrigger id="board-select" className="w-full">
                {isLoadingBoards ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" /> {/* Use Skeleton */}
                    {/* Use dictionary */}
                    <span className="text-muted-foreground">{dictionary.dashboard.boardSelectLoading}</span>
                  </div>
                ) : (
                  <SelectValue placeholder={
                    errorBoards ? `${dictionary.dashboard.boardSelectError}: ${errorBoards}` :
                    dictionary.dashboard.boardSelectPlaceholder // Use dictionary
                  } />
                )}
              </SelectTrigger>
              <SelectContent>
                {errorBoards ? (
                  <div className="px-2 py-6 text-center">
                    {/* Use dictionary */}
                    <div className="text-destructive mb-2">⚠️ {dictionary.dashboard.errorLoadingBoards}</div>
                    <div className="text-sm text-muted-foreground">{errorBoards}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={fetchBoards} // Call client-side fetch on retry
                    >
                      {/* Use dictionary */}
                      {dictionary.dashboard.boardSelectRetry}
                    </Button>
                  </div>
                ) : !isLoadingBoards && allBoards.length === 0 ? (
                  <div className="px-2 py-6 text-center">
                    {/* Use dictionary */}
                    <div className="text-muted-foreground mb-2">{dictionary.dashboard.boardSelectNoBoardsFound}</div>
                    <div className="text-sm text-muted-foreground">{dictionary.dashboard.boardSelectNoBoardsAccess}</div>
                  </div>
                ) : !isLoadingBoards && allBoards.length > 0 && (
                  <>
                    <SelectGroup>
                      {/* Use dictionary */}
                      <SelectLabel className="font-semibold text-primary">{`${dictionary.dashboard.boardSelectActiveBoardsLabel} (${openBoards.length})`}</SelectLabel>
                      {openBoards.length > 0 ? (
                        openBoards.map((board) => (
                          <SelectItem
                            key={board.id}
                            value={board.id}
                            className="hover:bg-primary/10 transition-colors"
                          >
                            {board.name}
                          </SelectItem>
                        ))
                      ) : (
                        // Use dictionary
                        <div className="px-2 py-1.5 text-sm text-muted-foreground italic">{dictionary.dashboard.boardSelectNoActiveBoards}</div>
                      )}
                    </SelectGroup>

                    {closedBoards.length > 0 && (
                      <SelectGroup>
                        {/* Use dictionary */}
                        <SelectLabel className="font-semibold text-muted-foreground">{`${dictionary.dashboard.boardSelectClosedBoardsLabel} (${closedBoards.length})`}</SelectLabel>
                        {closedBoards.map((board) => (
                          <SelectItem
                            key={board.id}
                            value={board.id}
                            className="text-muted-foreground hover:bg-muted/50 transition-colors"
                          >
                            {board.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </>
                )}
              </SelectContent>
            </Select>
            {isLoadingBoards && <Skeleton className="h-4 w-20 mt-2" />} {/* Use Skeleton */}
            {errorBoards && !isLoadingBoards && <p className="text-sm text-destructive mt-2">{`${dictionary.common.error}: ${errorBoards}`}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Render AdminPanel when a board is selected */}
      {selectedBoardId && (
        <AdminPanel
          boardId={selectedBoardId}
          fromDate={selectedFromDate}
          toDate={selectedToDate}
          userId={selectedUserId} // This likely needs to come from useAuth or props
          label={selectedLabel}
          onDateChange={handleDateChange}
          onUserChange={handleUserSelect}
          onLabelChange={handleLabelSelect}
          // Pass the dictionary conforming to AdminPanelDictionary
          dictionary={dictionary} // Pass the whole dictionary, assuming it matches AdminPanelDictionary structure now
          // Remove lang prop
        />
      )}
    </>
  );
}
