'use client'; // This needs to be a client component to use hooks like useState, useEffect

import { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming axios is installed
import { useAuth } from "@clerk/nextjs"; // Import useAuth
import AdminPanel from '@/components/AdminPanel'; // Import the new component
import DashboardHeader from '@/components/DashboardHeader'; // Import the header component
import PageTransition from '@/components/PageTransition'; // Import the page transition component
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

// Define the structure of a board object
interface Board {
  id: string;
  name: string;
  closed?: boolean;
}

export default function DashboardPage() { // Renamed component
  const { isLoaded, userId } = useAuth(); // Get auth status

  // Set default dates to first and last day of current month
  const firstDayOfMonth = getFirstDayOfMonth();
  const lastDayOfMonth = getLastDayOfMonth();

  const [boards, setBoards] = useState<Board[]>([]);
  const [openBoards, setOpenBoards] = useState<Board[]>([]);
  const [closedBoards, setClosedBoards] = useState<Board[]>([]);
  // Initialize selectedBoardId from localStorage if available
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [selectedFromDate, setSelectedFromDate] = useState<Date>(firstDayOfMonth);
  const [selectedToDate, setSelectedToDate] = useState<Date>(lastDayOfMonth);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [isLoadingBoards, setIsLoadingBoards] = useState<boolean>(true);
  const [errorBoards, setErrorBoards] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoaded) return; // Wait until auth state is loaded

    if (!userId) {
      window.location.href = '/sign-in';
      return;
    }

    // Only proceed if user is authenticated

    const fetchBoards = async () => {
      setIsLoadingBoards(true);
      setErrorBoards(null);
      try {
        const response = await axios.get<Board[]>('/api/boards');
        const allBoards = response.data;

        // Sort boards alphabetically by name
        const sortedBoards = [...allBoards].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
        setBoards(sortedBoards);

        // Separate boards into open and closed
        setOpenBoards(sortedBoards.filter(board => !board.closed));
        setClosedBoards(sortedBoards.filter(board => board.closed));
      } catch (error: unknown) {
        console.error('Error fetching boards:', error);
        let message = 'Nie udało się załadować tablic.';
        if (axios.isAxiosError(error)) {
            // Check specifically for 401 Unauthorized
            if (error.response?.status === 401) {
              // Redirect to sign-in page if unauthorized (session likely expired)
              window.location.href = '/sign-in'; // Or use Next.js router if preferred
              return; // Stop further processing
            }
            // Use error message from response if available
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
  }, [isLoaded, userId]); // Re-run if auth status changes

  // Effect to load board selection from localStorage when component mounts
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      try {
        const savedBoardId = localStorage.getItem('selectedBoardId');
        if (savedBoardId) {
          setSelectedBoardId(savedBoardId);
          console.log('Loaded board selection from localStorage:', savedBoardId);
        }
      } catch (error) {
        console.error('Error loading board selection from localStorage:', error);
      }
    }
  }, []);

  // Effect to validate the saved board ID when boards are loaded
  useEffect(() => {
    if (!isLoadingBoards && boards.length > 0 && selectedBoardId) {
      // Check if the selected board exists in the boards list
      const boardExists = boards.some(board => board.id === selectedBoardId);

      if (!boardExists) {
        console.warn('Selected board not found in available boards, resetting selection');
        setSelectedBoardId('');
        localStorage.removeItem('selectedBoardId');
      }
    }
  }, [isLoadingBoards, boards, selectedBoardId]);

  // Handler for shadcn Select component
  const handleBoardSelect = (value: string) => {
    setSelectedBoardId(value);

    // Save to localStorage
    try {
      localStorage.setItem('selectedBoardId', value);
    } catch (error) {
      console.error('Error saving board selection to localStorage:', error);
    }
  };

  // Handlers for other filters
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

  // Render loading indicator if Clerk is not loaded
  if (!isLoaded) {
     return <p className="text-center text-muted-foreground pt-24">Ładowanie sesji...</p>;
  }

  // Don't render content if not authenticated (will redirect)
  if (!userId) {
    return <p className="text-center text-muted-foreground pt-24">Przekierowywanie do strony logowania...</p>;
  }

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 container mx-auto max-w-7xl py-6 md:py-12">
        {/* Content is now guaranteed to be shown only when loaded and authenticated */}
        <>
          <Card className="w-full max-w-7xl mx-auto mb-6">
            <CardHeader>
              <CardTitle>Wybór Tablicy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="board-select">Tablica</Label>
                <Select
                  value={selectedBoardId}
                  onValueChange={handleBoardSelect}
                  disabled={isLoadingBoards || !!errorBoards || boards.length === 0}
                >
                  <SelectTrigger id="board-select" className="w-full">
                    {isLoadingBoards ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-muted-foreground">Ładowanie tablic...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder={
                        errorBoards ? `Błąd: ${errorBoards}` :
                        "-- Wybierz Tablicę --"
                      } />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {errorBoards ? (
                      <div className="px-2 py-6 text-center">
                        <div className="text-destructive mb-2">⚠️ Błąd ładowania tablic</div>
                        <div className="text-sm text-muted-foreground">{errorBoards}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => {
                            // Create a new function that calls fetchBoards
                            const retryFetchBoards = async () => {
                              try {
                                // Call the existing fetchBoards function
                                await axios.get<Board[]>('/api/boards')
                                  .then(response => {
                                    const allBoards = response.data;

                                    // Sort boards alphabetically by name
                                    const sortedBoards = [...allBoards].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
                                    setBoards(sortedBoards);

                                    // Separate boards into open and closed
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
                          Spróbuj ponownie
                        </Button>
                      </div>
                    ) : !isLoadingBoards && boards.length === 0 ? (
                      <div className="px-2 py-6 text-center">
                        <div className="text-muted-foreground mb-2">Nie znaleziono żadnych tablic</div>
                        <div className="text-sm text-muted-foreground">Upewnij się, że masz dostęp do tablic w Trello</div>
                      </div>
                    ) : !isLoadingBoards && boards.length > 0 && (
                      <>
                        <SelectGroup>
                          <SelectLabel className="font-semibold text-primary">Aktywne tablice ({openBoards.length})</SelectLabel>
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
                            <div className="px-2 py-1.5 text-sm text-muted-foreground italic">Brak aktywnych tablic</div>
                          )}
                        </SelectGroup>

                        {closedBoards.length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="font-semibold text-muted-foreground">Zamknięte tablice ({closedBoards.length})</SelectLabel>
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
                {isLoadingBoards && <p className="text-sm text-muted-foreground mt-2">Ładowanie...</p>}
                {errorBoards && !isLoadingBoards && <p className="text-sm text-destructive mt-2">Błąd: {errorBoards}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Render AdminPanel when a board is selected */}
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
            />
          )}
        </>
        </main>
      </div>
    </PageTransition>
  );
}
