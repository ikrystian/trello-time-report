import axios from 'axios';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Basic Trello API authentication parameters from environment variables
const trelloAuth = {
  key: process.env.TRELLO_API_KEY,
  token: process.env.TRELLO_API_TOKEN,
};

const TRELLO_API_BASE_URL = 'https://api.trello.com/1';

// Check if essential config is missing on server startup (can also be checked here)
if (!trelloAuth.key || !trelloAuth.token) {
  console.error('Error: Missing Trello API Key or Token in environment variables.');
  // In a real app, you might want a more robust way to handle this
  // For now, we'll let requests fail if keys are missing.
}

export async function GET() {
  const { userId } = await auth(); // Get user ID from Clerk - Added await

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Ensure keys are present before making the request
  if (!trelloAuth.key || !trelloAuth.token) {
    return NextResponse.json(
      { message: 'Server configuration error: Missing Trello credentials.' },
      { status: 500 }
    );
  }

  try {
    const response = await axios.get(
      `${TRELLO_API_BASE_URL}/members/me/boards`,
      {
        params: {
          ...trelloAuth,
          fields: 'id,name,closed', // Fetch id, name, and closed status
        },
      }
    );
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    let message = 'Nie udało się pobrać tablic Trello';
    let status = 500;

    if (axios.isAxiosError(error)) {
      console.error(
        'Error fetching Trello boards (Axios):',
        error.response?.data || error.message
      );
      status = error.response?.status || 500;
      // Try to get a more specific message from Trello's response
      message = error.response?.data?.message || error.message || message;
    } else if (error instanceof Error) {
      console.error('Error fetching Trello boards (General):', error.message);
      message = error.message;
    } else {
      console.error('Unknown error fetching Trello boards:', error);
    }

    return NextResponse.json({ message }, { status });
  }
}
