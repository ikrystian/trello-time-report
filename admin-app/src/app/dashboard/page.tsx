'use client'; // This needs to be a client component to use hooks like useState, useEffect

import { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming axios is installed
import { UserButton, useAuth } from "@clerk/nextjs"; // Import UserButton and useAuth
import AdminPanel from '@/components/AdminPanel'; // Import the new component
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Define the structure of a board object
interface Board {
  id: string;
  name: string;
}

export default function DashboardPage() { // Renamed component
  const { isLoaded, userId } = useAuth(); // Get auth status
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [isLoadingBoards, setIsLoadingBoards] = useState<boolean>(true);
  const [errorBoards, setErrorBoards] = useState<string | null>(null);

  // Fetch boards only if the user is loaded and authenticated
  useEffect(() => {
    if (!isLoaded || !userId) return; // Don't fetch if not loaded or not logged in

    const fetchBoards = async () => {
      setIsLoadingBoards(true);
      setErrorBoards(null);
      try {
        const response = await axios.get<Board[]>('/api/boards');
        setBoards(response.data);
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

  // Handler for shadcn Select component
  const handleBoardSelect = (value: string) => {
    setSelectedBoardId(value);
    console.log('Selected Board ID:', value);
  };

  // Render loading indicator if Clerk is not loaded or user is not authenticated
  // Middleware should prevent unauthenticated access, but this is a safeguard.
  if (!isLoaded || !userId) {
     return <p className="text-center text-muted-foreground pt-24">Ładowanie sesji...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 lg:p-24">
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-center flex-grow">
            Panel Administratora Raportów Czasu Trello
         </h1>
         {/* Redirects to /sign-in (catch-all route) after sign out */}
         <UserButton afterSignOutUrl="/sign-in"/>
       </div>

      {/* Content is now guaranteed to be shown only when loaded and authenticated */}
      <>
        <Card className="w-full max-w-4xl mb-6">
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
                  <SelectValue placeholder={
                    isLoadingBoards ? "Ładowanie tablic..." :
                    errorBoards ? `Błąd: ${errorBoards}` :
                    "-- Wybierz Tablicę --"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {!isLoadingBoards && !errorBoards && boards.length > 0 && boards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingBoards && <p className="text-sm text-muted-foreground mt-2">Ładowanie...</p>}
              {errorBoards && !isLoadingBoards && <p className="text-sm text-destructive mt-2">Błąd: {errorBoards}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Render AdminPanel when a board is selected */}
        {selectedBoardId && <AdminPanel boardId={selectedBoardId} />}
      </>
    </main>
  );
}
