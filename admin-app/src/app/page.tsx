'use client'; // This needs to be a client component to use hooks like useState, useEffect

'use client'; // This needs to be a client component to use hooks like useState, useEffect

import { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming axios is installed
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

export default function AdminPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [isLoadingBoards, setIsLoadingBoards] = useState<boolean>(true);
  const [errorBoards, setErrorBoards] = useState<string | null>(null);

  // Fetch boards when the component mounts
  useEffect(() => {
    const fetchBoards = async () => {
      setIsLoadingBoards(true);
      setErrorBoards(null);
      try {
        const response = await axios.get<Board[]>('/api/boards');
        setBoards(response.data);
      } catch (error: unknown) {
        console.error('Error fetching boards:', error);
        let message = 'Nie udało się załadować tablic.';
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error instanceof Error) {
            message = error.message;
        }
        setErrorBoards(message);
      } finally {
        setIsLoadingBoards(false);
      }
    };

    fetchBoards();
  }, []); // Empty dependency array means this runs once on mount

  // Handler for shadcn Select component
  const handleBoardSelect = (value: string) => {
    setSelectedBoardId(value);
    console.log('Selected Board ID:', value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 lg:p-24">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Panel Administratora Raportów Czasu Trello
      </h1>

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
                {/* Optionally add items for loading/error states if needed, though placeholder handles it */}
              </SelectContent>
            </Select>
            {isLoadingBoards && <p className="text-sm text-muted-foreground mt-2">Ładowanie...</p>}
            {errorBoards && !isLoadingBoards && <p className="text-sm text-destructive mt-2">Błąd: {errorBoards}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Render AdminPanel when a board is selected */}
      {selectedBoardId && <AdminPanel boardId={selectedBoardId} />}
    </main>
  );
}
