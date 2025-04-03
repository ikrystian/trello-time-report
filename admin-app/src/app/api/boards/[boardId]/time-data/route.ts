import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Trello API configuration from environment variables
const trelloAuth = {
  key: process.env.TRELLO_API_KEY,
  token: process.env.TRELLO_API_TOKEN,
};
const TRELLO_POWERUP_ID = process.env.TRELLO_POWERUP_ID;
const TRELLO_API_BASE_URL = 'https://api.trello.com/1';

// Check if essential config is missing
if (!trelloAuth.key || !trelloAuth.token || !TRELLO_POWERUP_ID) {
  console.error(
    'Error: Missing Trello API Key, Token, or Power-Up ID in environment variables.'
  );
  // Handle missing config appropriately
}

// Define interfaces for Trello data structures (optional but good practice)
interface TrelloLabel {
    id: string;
    name: string;
    color: string;
}

interface TimeEntry {
    memberId?: string;
    date?: string;
    hours?: number;
    minutes?: number;
    description?: string;
}

interface ParsedPluginData {
    timeEntries?: TimeEntry[];
    estimatedTime?: number; // Assuming estimatedTime is in minutes
}

interface TrelloCard {
    id: string;
    name: string;
    idList: string;
    idMembers: string[];
    labels: TrelloLabel[];
    url: string;
    pluginData: { idPlugin: string; value: string }[];
}

interface ProcessedCardData {
    cardId: string;
    cardName: string;
    cardUrl: string;
    listId: string;
    memberIds: string[];
    labels: TrelloLabel[];
    estimatedHours: number;
    timeEntries: {
        memberId?: string;
        date?: string;
        hours: number; // Combined hours
        comment: string;
    }[];
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ boardId: string }> } // Use context object with Promise type
) {
  const { userId: clerkUserId } = await auth(); // Get user ID from Clerk - Added await

  if (!clerkUserId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { boardId } = await context.params; // Access boardId from context
  const { searchParams } = request.nextUrl;

  // Extract query parameters
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const userId = searchParams.get('userId');
  const labelId = searchParams.get('labelId');

  // Ensure credentials and Power-Up ID are present
  if (!trelloAuth.key || !trelloAuth.token || !TRELLO_POWERUP_ID) {
    return NextResponse.json(
      { message: 'Server configuration error: Missing Trello credentials or Power-Up ID.' },
      { status: 500 }
    );
  }

  try {
    // Fetch cards, lists, members, and labels concurrently
    const [cardsResponse, listsResponse, membersResponse, labelsResponse] =
      await Promise.all([
        axios.get<TrelloCard[]>(`${TRELLO_API_BASE_URL}/boards/${boardId}/cards`, {
          params: {
            ...trelloAuth,
            fields: 'id,name,idList,idMembers,labels,url',
            pluginData: true, // Crucial for getting Power-Up data
          },
        }),
        axios.get<{ id: string; name: string }[]>(`${TRELLO_API_BASE_URL}/boards/${boardId}/lists`, {
          params: { ...trelloAuth, fields: 'id,name' },
        }),
        axios.get<{ id: string; fullName: string; avatarHash?: string }[]>(`${TRELLO_API_BASE_URL}/boards/${boardId}/members`, {
          params: { ...trelloAuth, fields: 'id,fullName,avatarHash' },
        }),
        axios.get<TrelloLabel[]>(`${TRELLO_API_BASE_URL}/boards/${boardId}/labels`, {
          params: { ...trelloAuth, fields: 'id,name,color' },
        }),
      ]);

    const cards = cardsResponse.data;
    const lists = listsResponse.data;
    const members = membersResponse.data;
    const boardLabels = labelsResponse.data;

    // Create mapping objects
    const listMap = lists.reduce((map, list) => {
      map[list.id] = list.name;
      return map;
    }, {} as Record<string, string>);

    const memberMap = members.reduce((map, member) => {
      // Generate avatar URL using Trello's avatar hash
      const avatarUrl = member.avatarHash
        ? `https://trello-members.s3.amazonaws.com/${member.id}/${member.avatarHash}/50.png`
        : null;

      // Store both name and avatar URL
      map[member.id] = {
        fullName: member.fullName,
        avatarUrl
      };
      return map;
    }, {} as Record<string, { fullName: string; avatarUrl: string | null }>);

    // Process card data
    const processedCardData: ProcessedCardData[] = cards
      .map((card): ProcessedCardData | null => { // Allow returning null if card is invalid/empty
        const powerUpData = card.pluginData.find(
          (pd) => pd.idPlugin === TRELLO_POWERUP_ID
        );

        let timeEntries: ProcessedCardData['timeEntries'] = [];
        let estimatedHours = 0;

        if (powerUpData && typeof powerUpData.value === 'string') {
          try {
            const parsedValue: ParsedPluginData = JSON.parse(powerUpData.value);
            const rawEntries = parsedValue.timeEntries;
            const estimatedMinutes = parsedValue.estimatedTime;

            estimatedHours =
              typeof estimatedMinutes === 'number' && estimatedMinutes > 0
                ? estimatedMinutes / 60
                : 0;

            if (Array.isArray(rawEntries)) {
              timeEntries = rawEntries
                .filter((entry) => {
                  // Date Filtering
                  if (!entry.date) return false;
                  const entryDate = new Date(entry.date);
                  if (isNaN(entryDate.getTime())) return false; // More robust date check

                  const start = startDate ? new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000) : null;
                  const end = endDate ? new Date(endDate) : null;

                  if (start && !isNaN(start.getTime()) && entryDate < start) {
                    return false;
                  }
                  // Adjust end date to include the whole day
                  if (end && !isNaN(end.getTime())) {
                     // Clone end date before modifying
                    const endOfDay = new Date(end);
                    endOfDay.setHours(23, 59, 59, 999);
                    if (entryDate >= endOfDay) return false;
                  }

                  // User ID Filtering
                  if (userId && entry.memberId !== userId) {
                    return false;
                  }
                  return true;
                })
                .map((entry) => {
                  const totalHours =
                    (entry.hours || 0) + (entry.minutes || 0) / 60;
                  return {
                    memberId: entry.memberId,
                    date: entry.date,
                    hours: totalHours, // Use the combined value
                    comment: entry.description || '',
                  };
                });
            }
          } catch (parseError) {
            console.error(
              `Error parsing pluginData JSON for card ${card.id}:`,
              parseError,
              'Raw value:',
              powerUpData.value
            );
          }
        } else if (powerUpData) {
           console.error(
             `Skipping pluginData for card ${card.id} because value is not a string:`,
             powerUpData.value
           );
        }

        // Return processed card structure, potentially with empty timeEntries
        return {
          cardId: card.id,
          cardName: card.name,
          cardUrl: card.url,
          listId: card.idList,
          memberIds: card.idMembers,
          labels: card.labels,
          estimatedHours: estimatedHours,
          timeEntries: timeEntries,
        };
      })
      // Filter out nulls and then filter based on reported time and labelId
      .filter((card): card is ProcessedCardData => card !== null) // Type guard to remove nulls
      .filter((card) => {
        const hasReportedTime = card.timeEntries.length > 0;
        if (!hasReportedTime) return false;

        if (labelId) {
          const hasLabel = card.labels.some((label) => label.id === labelId);
          if (!hasLabel) return false;
        }
        return true;
      });

    // Return filtered data along with maps and labels
    return NextResponse.json({
      timeData: processedCardData,
      listMap: listMap,
      memberMap: memberMap,
      boardLabels: boardLabels,
    });

  } catch (error: unknown) {
    let message = 'Nie udało się pobrać danych czasu';
    let status = 500;

    if (axios.isAxiosError(error)) {
      console.error(
        `Error fetching time data for board ${boardId} (Axios):`,
        error.response?.data || error.message
      );
      status = error.response?.status || 500;
      message = error.response?.data?.message || error.message || message;
    } else if (error instanceof Error) {
      console.error(`Error fetching time data for board ${boardId} (General):`, error.message);
      message = error.message;
    } else {
      console.error(`Unknown error fetching time data for board ${boardId}:`, error);
    }

    return NextResponse.json({ message }, { status });
  }
}
