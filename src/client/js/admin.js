document.addEventListener("DOMContentLoaded", () => {
  const boardSelect = document.getElementById("board-select");
  const timeEntriesTableBody = document.getElementById("time-entries-body");
  const loadingIndicator = document.getElementById("loading-indicator");
  const filtersDiv = document.querySelector(".filters");
  const summaryDiv = document.querySelector(".summary");
  const summaryContent = document.getElementById("summary-content"); // Get summary content element
  // Filter elements
  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");
  const userSelect = document.getElementById("user-select"); // Add user select reference
  const applyFiltersButton = document.getElementById("apply-filters");
  const exportCsvButton = document.getElementById("export-csv"); // Add export button reference

  // Variables to store current data for export
  let currentEntries = [];
  let currentListMap = {};
  let currentMemberMap = {};

  // --- Function to fetch boards ---
  async function fetchBoards() {
    try {
      const response = await fetch("/api/boards");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const boards = await response.json();

      boardSelect.innerHTML = '<option value="">-- Select a Board --</option>'; // Clear loading message
      boards.forEach((board) => {
        const option = document.createElement("option");
        option.value = board.id;
        option.textContent = board.name;
        boardSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching boards:", error);
      boardSelect.innerHTML = '<option value="">Error loading boards</option>';
      // Optionally display a more user-friendly error message
    }
  }

  // --- Function to fetch and display time data ---
  async function fetchTimeData(boardId) {
    if (!boardId) {
      timeEntriesTableBody.innerHTML =
        '<tr><td colspan="6">Select a board to view time entries.</td></tr>';
      filtersDiv.style.display = "none";
      summaryDiv.style.display = "none";
      return;
    }

    loadingIndicator.style.display = "block";
    timeEntriesTableBody.innerHTML = ""; // Clear previous data
    filtersDiv.style.display = "block"; // Show filters
    summaryDiv.style.display = "block"; // Show summary section (initially empty)

    // Read filter values
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const selectedUserId = userSelect.value; // Read selected user ID

    // Construct query parameters
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (selectedUserId) queryParams.append("userId", selectedUserId); // Add userId to query

    const queryString = queryParams.toString();
    const apiUrl = `/api/boards/${boardId}/time-data${
      queryString ? `?${queryString}` : ""
    }`;

    try {
      const response = await fetch(apiUrl); // Use URL with query params
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Destructure the response
      const { timeData, listMap, memberMap } = await response.json();

      // Store fetched data for export
      currentEntries = flattenTimeData(timeData);
      currentListMap = listMap;
      currentMemberMap = memberMap;

      displayTimeEntries(currentEntries, currentListMap, currentMemberMap);
      calculateAndDisplaySummary(
        currentEntries,
        currentMemberMap,
        currentListMap
      );
      populateUserFilter(currentMemberMap); // Populate user dropdown
    } catch (error) {
      console.error(`Error fetching time data for board ${boardId}:`, error);
      // Clear stored data on error? Maybe not, allow export of last successful fetch?
      // currentEntries = []; currentListMap = {}; currentMemberMap = {};
      timeEntriesTableBody.innerHTML = `<tr><td colspan="6">Error loading time data. ${error.message}</td></tr>`;
    } finally {
      loadingIndicator.style.display = "none";
    }
  }

  // --- Helper function to flatten data ---
  function flattenTimeData(timeData) {
    const allEntries = [];
    if (!timeData) return allEntries;

    // The backend now returns timeEntries already filtered and mapped
    // with { memberId, date, hours, comment } structure.
    timeData.forEach((card) => {
      card.timeEntries.forEach((entry) => {
        // Just add card-level info to the already processed entry
        allEntries.push({
          cardName: card.cardName,
          listId: card.listId,
          memberId: entry.memberId, // Use memberId from processed entry
          date: entry.date,
          hours: entry.hours, // Use hours directly from processed entry
          comment: entry.comment, // Use comment from processed entry
        });
      });
    });
    return allEntries;
  }

  // --- Function to display time entries in the table ---
  function displayTimeEntries(allEntries, listMap, memberMap) {
    timeEntriesTableBody.innerHTML = ""; // Clear table

    if (!allEntries || allEntries.length === 0) {
      timeEntriesTableBody.innerHTML =
        '<tr><td colspan="6">No time entries found for this board (or matching filters).</td></tr>';
      return;
    }

    allEntries.forEach((entry) => {
      const row = timeEntriesTableBody.insertRow();
      row.insertCell().textContent = entry.cardName;
      // Use maps to get names, provide fallback if ID not found
      row.insertCell().textContent =
        listMap[entry.listId] || entry.listId || "N/A";
      row.insertCell().textContent = entry.memberId
        ? memberMap[entry.memberId] || entry.memberId
        : "N/A";
      row.insertCell().textContent = entry.date
        ? new Date(entry.date).toLocaleDateString()
        : "N/A";
      row.insertCell().textContent = entry.hours.toFixed(2); // Display hours consistently
      row.insertCell().textContent = entry.comment;
    });
  }

  // --- Function to calculate and display summary ---
  function calculateAndDisplaySummary(allEntries, memberMap, listMap) {
    // Accept memberMap and listMap
    if (!allEntries || allEntries.length === 0) {
      summaryContent.innerHTML = "No data to summarize.";
      return;
    }

    const totalHours = allEntries.reduce((sum, entry) => sum + entry.hours, 0);

    // Calculate hours per user
    const hoursPerUser = allEntries.reduce((acc, entry) => {
      const userId = entry.memberId || "unassigned"; // Group unassigned entries
      acc[userId] = (acc[userId] || 0) + entry.hours;
      return acc;
    }, {});

    // Calculate hours per list
    const hoursPerList = allEntries.reduce((acc, entry) => {
      const listId = entry.listId || "unknown-list"; // Group entries with unknown list
      acc[listId] = (acc[listId] || 0) + entry.hours;
      return acc;
    }, {});

    // Build summary HTML
    let summaryHTML = `<p><strong>Total Hours Reported:</strong> ${totalHours.toFixed(
      2
    )}</p>`;

    // Hours per User section
    summaryHTML += "<h4>Hours per User:</h4><ul>";
    for (const userId in hoursPerUser) {
      const userName =
        userId === "unassigned"
          ? "Unassigned"
          : memberMap[userId] || `Unknown (${userId})`;
      summaryHTML += `<li>${userName}: ${hoursPerUser[userId].toFixed(
        2
      )} hours</li>`;
    }
    summaryHTML += "</ul>";

    // Hours per List section
    summaryHTML += "<h4>Hours per List:</h4><ul>";
    for (const listId in hoursPerList) {
      const listName =
        listId === "unknown-list"
          ? "Unknown List"
          : listMap[listId] || `Unknown (${listId})`;
      summaryHTML += `<li>${listName}: ${hoursPerList[listId].toFixed(
        2
      )} hours</li>`;
    }
    summaryHTML += "</ul>";

    summaryContent.innerHTML = summaryHTML;
  }

  // --- Function to export data to CSV ---
  function exportToCSV() {
    if (currentEntries.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      "Card Name",
      "List Name",
      "User",
      "Date",
      "Hours",
      "Comment",
    ];

    // Function to escape CSV fields containing commas or quotes
    const escapeCSV = (field) => {
      if (field === null || field === undefined) return "";
      let str = String(field);
      // If field contains comma, double quote, or newline, enclose in double quotes
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        // Escape existing double quotes by doubling them
        str = str.replace(/"/g, '""');
        return `"${str}"`;
      }
      return str;
    };

    const csvRows = currentEntries.map((entry) => {
      const listName = currentListMap[entry.listId] || entry.listId || "N/A";
      const userName = entry.memberId
        ? currentMemberMap[entry.memberId] || entry.memberId
        : "N/A";
      const dateStr = entry.date
        ? new Date(entry.date).toLocaleDateString()
        : "N/A";
      const hoursStr = entry.hours.toFixed(2);

      return [
        escapeCSV(entry.cardName),
        escapeCSV(listName),
        escapeCSV(userName),
        escapeCSV(dateStr),
        escapeCSV(hoursStr),
        escapeCSV(entry.comment),
      ].join(",");
    });

    const csvString = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

    // Create a link and trigger the download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const boardName =
      boardSelect.options[boardSelect.selectedIndex]?.text || "board";
    const filename = `trello-time-report-${boardName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}.csv`;
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up
  }

  // --- Function to populate user filter dropdown ---
  function populateUserFilter(memberMap) {
    const currentVal = userSelect.value; // Remember current selection
    userSelect.innerHTML = '<option value="">All Users</option>'; // Reset dropdown

    // Sort members by name for better UX
    const sortedMembers = Object.entries(memberMap).sort(
      ([, nameA], [, nameB]) => nameA.localeCompare(nameB)
    );

    sortedMembers.forEach(([id, name]) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = name;
      userSelect.appendChild(option);
    });

    // Re-select previous value if it still exists
    if (userSelect.querySelector(`option[value="${currentVal}"]`)) {
      userSelect.value = currentVal;
    }
  }

  // --- Event Listeners ---
  boardSelect.addEventListener("change", (event) => {
    const selectedBoardId = event.target.value;
    // Clear previous data when changing board before fetching new
    currentEntries = [];
    currentListMap = {};
    currentMemberMap = {};
    timeEntriesTableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
    summaryContent.innerHTML = "";
    userSelect.innerHTML = '<option value="">All Users</option>'; // Reset user filter
    fetchTimeData(selectedBoardId);
  });

  applyFiltersButton.addEventListener("click", () => {
    const selectedBoardId = boardSelect.value;
    if (selectedBoardId) {
      fetchTimeData(selectedBoardId); // Re-fetch data with current filter values
    } else {
      alert("Please select a board first.");
    }
  });

  exportCsvButton.addEventListener("click", exportToCSV); // Add listener for export button

  // --- Initial Load ---
  fetchBoards();
});
