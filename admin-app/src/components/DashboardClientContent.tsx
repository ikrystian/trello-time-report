'use client'; // This remains a client component

import { useState, useEffect } from 'react'; // Removed useCallback
import axios from 'axios';
import { useAuth } from "@clerk/nextjs";
import AdminPanel from '@/components/AdminPanel';
import DashboardHeader from '@/components/DashboardHeader';
import PageTransition from '@/components/PageTransition';
import { getFirstDayOfMonth, getLastDayOfMonth } from '@/lib/date-utils';
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
import { Dictionary } from '@/lib/dictionaries'; // Assuming Dictionary type exists
// import Link from 'next/link'; // Removed unused import
// import { Loader2 } from 'lucide-react'; // Removed unused import

// Define the structure of a board object
interface Board {
  id: string;
  name: string;
  closed?: boolean;
}

// Define props including the dictionary
interface DashboardClientContentProps {
  dictionary: Dictionary; // Accept the full dictionary
  // Remove lang: string;
}

export default function DashboardClientContent({ dictionary }: DashboardClientContentProps) { // Remove lang from props
  const { isLoaded, userId } = useAuth();

  const firstDayOfMonth = getFirstDayOfMonth();
  const lastDayOfMonth = getLastDayOfMonth();

  const [boards, setBoards] = useState<Board[]>([]);
  const [openBoards, setOpenBoards] = useState<Board[]>([]);
  const [closedBoards, setClosedBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [selectedFromDate, setSelectedFromDate] = useState<Date>(firstDayOfMonth);
  const [selectedToDate, setSelectedToDate] = useState<Date>(lastDayOfMonth);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [isLoadingBoards, setIsLoadingBoards] = useState<boolean>(true); // Reverted initial state
  const [errorBoards, setErrorBoards] = useState<string | null>(null);
  // Removed Trello connection state variables

  // Function to fetch boards (Reverted to original structure)
  // Reverted useEffect structure
  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      // Update redirect URL to remove lang prefix
      window.location.href = `/sign-in`;
      return;
    }

    const fetchBoards = async () => { // Moved fetchBoards back inside useEffect
      setIsLoadingBoards(true);
      setErrorBoards(null);
      try {
        const response = await axios.get<Board[]>('/api/boards');
        const allBoards = response.data;

        // Use hardcoded 'pl' for localeCompare
        const sortedBoards = [...allBoards].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
        setBoards(sortedBoards);

        setOpenBoards(sortedBoards.filter(board => !board.closed));
        setClosedBoards(sortedBoards.filter(board => board.closed));
      } catch (error: unknown) {
        console.error('Error fetching boards:', error);
        // Use direct keys from dictionary.dashboard
        let message = dictionary.dashboard?.errorLoadingBoards || 'Failed to load boards.';
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
              // Update redirect URL to remove lang prefix
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

    fetchBoards();
  }, [isLoaded, userId, dictionary]); // Reverted dependencies

  // Effect to load board selection from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBoardId = localStorage.getItem('selectedBoardId');
        if (savedBoardId) {
          setSelectedBoardId(savedBoardId);
        }
      } catch (error) {
        console.error('Error loading board selection from localStorage:', error);
      }
    }
  }, []);

  // Effect to validate the saved board ID
  useEffect(() => {
    if (!isLoadingBoards && boards.length > 0 && selectedBoardId) {
      const boardExists = boards.some(board => board.id === selectedBoardId);
      if (!boardExists) {
        setSelectedBoardId('');
        localStorage.removeItem('selectedBoardId');
      }
    }
  }, [isLoadingBoards, boards, selectedBoardId]);

  const handleBoardSelect = (value: string) => {
    setSelectedBoardId(value);
    try {
      localStorage.setItem('selectedBoardId', value);
    } catch (error) {
      console.error('Error saving board selection to localStorage:', error);
    }
  };

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

  // Use direct keys from dictionary.common or dictionary.dashboard
  if (!isLoaded) {
     // Assuming a loading message exists in common or dashboard
     return <p className="text-center text-muted-foreground pt-24">{dictionary.common?.loading || 'Loading session...'}</p>;
  }

  if (!userId) {
    // Use a known key or default string
    return <p className="text-center text-muted-foreground pt-24">{dictionary.common?.loading || 'Redirecting to sign-in...'}</p>; // Using common.loading as placeholder
  }

  // Use the correct dictionary section for the header
  // DashboardHeader expects { title: string }
  const headerDict = { title: dictionary.dashboard?.title || 'Dashboard' };

  // Removed Trello status check rendering logic

  // Render main dashboard content (original structure)
  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col">
        {/* Pass the specific dictionary part needed by the header */}
        <DashboardHeader dictionary={headerDict} />
        <main className="flex-1 container mx-auto max-w-7xl py-6 md:py-12">
        {/* Render board selector and AdminPanel only if trelloConnected is true */}
        <>
          <Card className="w-full max-w-7xl mx-auto mb-6">
            <CardHeader>
              {/* Use direct key */}
              <CardTitle>{dictionary.dashboard?.selectBoard || 'Board Selection'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-1.5">
                 {/* Use direct key */}
                <Label htmlFor="board-select">{dictionary.dashboard?.boardSelectLabel || 'Board'}</Label>
                <Select
                  value={selectedBoardId}
                  onValueChange={handleBoardSelect}
                  disabled={isLoadingBoards || !!errorBoards || boards.length === 0}
                >
                  <SelectTrigger id="board-select" className="w-full">
                    {isLoadingBoards ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                         {/* Use direct key */}
                        <span className="text-muted-foreground">{dictionary.dashboard?.boardSelectLoading || 'Loading boards...'}</span>
                      </div>
                    ) : (
                      <SelectValue placeholder={
                        errorBoards ? `${dictionary.dashboard?.boardSelectError || 'Error'}: ${errorBoards}` :
                        dictionary.dashboard?.boardSelectPlaceholder || "-- Select Board --" // Use direct key
                      } />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {errorBoards ? (
                      <div className="px-2 py-6 text-center">
                         {/* Use direct key */}
                        <div className="text-destructive mb-2">⚠️ {dictionary.dashboard?.errorLoadingBoards || 'Error loading boards'}</div>
                        <div className="text-sm text-muted-foreground">{errorBoards}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => {
                            const retryFetchBoards = async () => {
                              try {
                                await axios.get<Board[]>('/api/boards')
                                  .then(response => {
                                    const allBoards = response.data;
                                     // Use hardcoded 'pl' here
                                    const sortedBoards = [...allBoards].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
                                    setBoards(sortedBoards);
                                    setOpenBoards(sortedBoards.filter(board => !board.closed));
                                    setClosedBoards(sortedBoards.filter(board => board.closed));
                                    setIsLoadingBoards(false);
                                    setErrorBoards(null);
                                  });
                              } catch (error) {
                                console.error('Error retrying board fetch:', error);
                              }
                            };
                            setIsLoadingBoards(true);
                            retryFetchBoards();
                          }}
                        >
                           {/* Use direct key */}
                          {dictionary.dashboard?.boardSelectRetry || 'Retry'}
                        </Button>
                      </div>
                    ) : !isLoadingBoards && boards.length === 0 ? (
                      <div className="px-2 py-6 text-center">
                         {/* Use direct keys */}
                        <div className="text-muted-foreground mb-2">{dictionary.dashboard?.boardSelectNoBoardsFound || 'No boards found'}</div>
                        <div className="text-sm text-muted-foreground">{dictionary.dashboard?.boardSelectNoBoardsAccess || 'Ensure you have access to boards in Trello'}</div>
                      </div>
                    ) : !isLoadingBoards && boards.length > 0 && (
                      <>
                        <SelectGroup>
                          {/* Use direct key */}
                          <SelectLabel className="font-semibold text-primary">{dictionary.dashboard?.boardSelectActiveBoardsLabel || 'Active boards'} ({openBoards.length})</SelectLabel>
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
                            /* Use direct key */
                            <div className="px-2 py-1.5 text-sm text-muted-foreground italic">{dictionary.dashboard?.boardSelectNoActiveBoards || 'No active boards'}</div>
                          )}
                        </SelectGroup>

                        {closedBoards.length > 0 && (
                          <SelectGroup>
                            {/* Use direct key */}
                            <SelectLabel className="font-semibold text-muted-foreground">{dictionary.dashboard?.boardSelectClosedBoardsLabel || 'Closed boards'} ({closedBoards.length})</SelectLabel>
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
                {/* Use direct keys */}
                {isLoadingBoards && <p className="text-sm text-muted-foreground mt-2">{dictionary.dashboard?.boardSelectLoading || 'Loading...'}</p>}
                {errorBoards && !isLoadingBoards && <p className="text-sm text-destructive mt-2">{`${dictionary.dashboard?.boardSelectError || 'Error'}: ${errorBoards}`}</p>}
              </div>
            </CardContent>
          </Card>

          {selectedBoardId && (
            <AdminPanel
              boardId={selectedBoardId}
              fromDate={selectedFromDate}
              toDate={selectedToDate}
              userId={selectedUserId}
              label={selectedLabel}
              onDateChange={handleDateChange}
              onUserChange={handleUserSelect}
              onLabelChange={handleLabelSelect}
              // Pass dictionary down to AdminPanel
              // Assuming the main Dictionary structure matches AdminPanelDictionary requirements now
              dictionary={dictionary}
              // Remove lang prop
            />
          )}
        </>
        </main>
      </div>
    </PageTransition>
  );
}
