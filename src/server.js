require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios"); // Import axios

const app = express();
const { TRELLO_API_KEY, TRELLO_API_TOKEN, TRELLO_POWERUP_ID } = process.env;
const TRELLO_API_BASE_URL = "https://api.trello.com/1";

// Basic Trello API authentication parameters
const trelloAuth = {
  key: TRELLO_API_KEY,
  token: TRELLO_API_TOKEN,
};

if (!TRELLO_API_KEY || !TRELLO_API_TOKEN || !TRELLO_POWERUP_ID) {
  console.error(
    "Error: Missing Trello API Key, Token, or Power-Up ID in .env file."
  );
  process.exit(1); // Exit if essential config is missing
}

const PORT = process.env.PORT || 3000;

// CORS middleware configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "https://trello.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to serve static files from the client directory
app.use(express.static(path.join(__dirname, "client")));

// Basic route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Route to serve the admin panel
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "admin.html"));
});

// --- API Routes ---

// Get user's boards
app.get("/api/boards", async (req, res) => {
  try {
    const response = await axios.get(
      `${TRELLO_API_BASE_URL}/members/me/boards`,
      {
        params: {
          ...trelloAuth,
          fields: "id,name", // Only fetch necessary fields
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching Trello boards:",
      error.response ? error.response.data : error.message
    );
    res
      .status(error.response?.status || 500)
      .json({ message: "Nie udało się pobrać tablic Trello" });
  }
});

// Get time data for a specific board
app.get("/api/boards/:boardId/time-data", async (req, res) => {
  const { boardId } = req.params;
  // Add labelId to destructured query params
  const { startDate, endDate, userId, labelId } = req.query;

  try {
    // Fetch cards, lists, members, and labels concurrently
    const [cardsResponse, listsResponse, membersResponse, labelsResponse] =
      await Promise.all([
        axios.get(`${TRELLO_API_BASE_URL}/boards/${boardId}/cards`, {
          params: {
            ...trelloAuth,
            fields: "id,name,idList,idMembers,labels,url", // Added 'url' field
            pluginData: true, // Crucial for getting Power-Up data
          },
        }),
        axios.get(`${TRELLO_API_BASE_URL}/boards/${boardId}/lists`, {
          params: { ...trelloAuth, fields: "id,name" },
        }),
        axios.get(`${TRELLO_API_BASE_URL}/boards/${boardId}/members`, {
          params: { ...trelloAuth, fields: "id,fullName" },
        }),
        // Fetch labels for the board
        axios.get(`${TRELLO_API_BASE_URL}/boards/${boardId}/labels`, {
          params: { ...trelloAuth, fields: "id,name,color" }, // Get id, name, and color
        }),
      ]);

    const cards = cardsResponse.data;
    const lists = listsResponse.data;
    const members = membersResponse.data;
    const boardLabels = labelsResponse.data; // Store fetched labels

    // Create mapping objects for lists and members
    const listMap = lists.reduce((map, list) => {
      map[list.id] = list.name;
      return map;
    }, {});

    const memberMap = members.reduce((map, member) => {
      map[member.id] = member.fullName;
      return map;
    }, {});

    // Process card data to extract time entries
    const processedCardData = cards
      .map((card) => {
        // Example: Find pluginData for *your* Power-Up
        const powerUpData = card.pluginData.find(
          (pd) => pd.idPlugin === TRELLO_POWERUP_ID
        );

        let timeEntries = [];
        let estimatedHours = 0; // Initialize estimatedHours outside the try block

        // --- DEBUG LOGGING START ---
        console.log(`\nProcessing Card ID: ${card.id} (${card.name})`);
        if (powerUpData) {
          console.log(`  Raw pluginData.value:`, powerUpData.value);
        } else {
          console.log(
            `  No pluginData found for PowerUp ID: ${TRELLO_POWERUP_ID}`
          );
        }
        // --- DEBUG LOGGING END ---

        if (powerUpData && typeof powerUpData.value === "string") {
          // Check if value is a string
          try {
            const parsedValue = JSON.parse(powerUpData.value); // Parse the JSON string
            const rawEntries = parsedValue.timeEntries; // Access the timeEntries array
            const estimatedMinutes = parsedValue.estimatedTime; // Get estimated time in minutes

            // --- DEBUG LOGGING START ---
            console.log(
              `  Parsed estimatedMinutes: ${estimatedMinutes} (Type: ${typeof estimatedMinutes})`
            );
            // --- DEBUG LOGGING END ---

            // Convert estimated time to hours
            estimatedHours = // Assign to the outer variable
              typeof estimatedMinutes === "number" && estimatedMinutes > 0
                ? estimatedMinutes / 60
                : 0;

            // --- DEBUG LOGGING START ---
            console.log(`  Calculated estimatedHours: ${estimatedHours}`);
            // --- DEBUG LOGGING END ---

            if (Array.isArray(rawEntries)) {
              timeEntries = rawEntries
                .filter((entry) => {
                  // Date Filtering Logic
                  if (!entry.date) return false; // Skip entries without a date
                  const entryDate = new Date(entry.date);
                  if (isNaN(entryDate)) return false; // Skip invalid dates

                  const start = startDate ? new Date(startDate) : null;
                  const end = endDate ? new Date(endDate) : null;

                  // Adjust end date to include the whole day
                  if (end && !isNaN(end)) {
                    end.setHours(23, 59, 59, 999);
                  }

                  if (start && !isNaN(start) && entryDate < start) {
                    return false;
                  }
                  if (end && !isNaN(end) && entryDate > end) {
                    return false;
                  }
                  // User ID Filtering Logic - Use memberId now
                  if (userId && entry.memberId !== userId) {
                    return false; // Filter out if userId is provided and doesn't match
                  }
                  return true; // Keep entry if it passes all filters
                })
                // Map to the structure expected by the frontend (combine hours/minutes, use description)
                .map((entry) => {
                  const totalHours =
                    (entry.hours || 0) + (entry.minutes || 0) / 60;
                  return {
                    memberId: entry.memberId,
                    date: entry.date,
                    hours: totalHours,
                    comment: entry.description || "", // Use description field
                  };
                });
            }
          } catch (parseError) {
            console.error(
              `Error parsing pluginData JSON for card ${card.id}:`,
              parseError,
              "Raw value:",
              powerUpData.value
            );
            // Keep timeEntries as []
          }
        } else if (powerUpData) {
          // --- DEBUG LOGGING START ---
          console.error(
            `  Skipping pluginData for card ${card.id} because value is not a string:`,
            powerUpData.value
          );
          // --- DEBUG LOGGING END ---
        }
        // If value is not a string or parsing fails, timeEntries remains []

        return {
          cardId: card.id,
          cardName: card.name,
          cardUrl: card.url, // Add card URL
          listId: card.idList,
          memberIds: card.idMembers,
          labels: card.labels,
          estimatedHours: estimatedHours, // Add estimated hours
          timeEntries: timeEntries, // Now contains filtered and mapped entries
        };
      })
      // Filter based on reported time entries AND selected labelId
      .filter((card) => {
        // Only keep cards that have actual time entries reported (after date/user filtering)
        const hasReportedTime = card.timeEntries.length > 0;
        if (!hasReportedTime) return false; // Must have reported time entries

        // If labelId is provided, check if the card has that label
        if (labelId) {
          const hasLabel = card.labels.some((label) => label.id === labelId);
          if (!hasLabel) return false; // Must have the selected label if filter is active
        }
        return true; // Keep card if it passes all filters
      });

    // Return filtered data along with the maps and board labels
    res.json({
      timeData: processedCardData,
      listMap: listMap,
      memberMap: memberMap,
      boardLabels: boardLabels, // Add labels to the response
    });
  } catch (error) {
    console.error(
      `Error fetching time data for board ${boardId}:`,
      error.response ? error.response.data : error.message
    );
    res
      .status(error.response?.status || 500)
      .json({ message: "Nie udało się pobrać danych czasu" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
