document.addEventListener("DOMContentLoaded", () => {
  // --- Get initial references (primarily for adding listeners) ---
  const boardSelect = document.getElementById("board-select");
  const applyFiltersButton = document.getElementById("apply-filters");
  const exportCsvButton = document.getElementById("export-csv");

  // --- Check if essential listeners can be attached ---
  if (!boardSelect || !applyFiltersButton || !exportCsvButton) {
    console.error(
      "Initialization Error: Could not find essential control elements (boardSelect, applyFiltersButton, exportCsvButton). Admin panel cannot function."
    );
    const container = document.getElementById("time-entries-container");
    if (container) {
      container.innerHTML =
        "<p style='color: red;'>Error: Admin panel failed to initialize correctly. Control elements missing.</p>";
    }
    return;
  }

  let currentListMap = {};
  let currentMemberMap = {};

  async function fetchBoards() {
    const boardSelectElement = document.getElementById("board-select");
    if (!boardSelectElement) {
      console.error("fetchBoards: boardSelectElement not found.");
      return;
    }

    try {
      const response = await fetch("/api/boards");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const boards = await response.json();
      if (boardSelectElement) {
        boardSelectElement.innerHTML =
          '<option value="">-- Select a Board --</option>';
        boards.forEach((board) => {
          const option = document.createElement("option");
          option.value = board.id;
          option.textContent = board.name;
          boardSelectElement.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
      if (boardSelectElement) {
        boardSelectElement.innerHTML =
          '<option value="">Error loading boards</option>';
      }
    }
  }

  async function fetchTimeData(boardId) {
    const timeEntriesContainer = document.getElementById(
      "time-entries-container"
    );
    const loadingIndicator = document.getElementById("loading-indicator");
    const filtersDiv = document.querySelector(".filters");
    const summaryDiv = document.querySelector(".summary");
    const summaryContent = document.getElementById("summary-content");
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const userSelectElementForValue = document.getElementById("user-select");

    if (
      !timeEntriesContainer ||
      !loadingIndicator ||
      !filtersDiv ||
      !summaryDiv ||
      !summaryContent ||
      !startDateInput ||
      !endDateInput
    ) {
      console.error(
        "Error fetching time data: One or more display/filter elements are missing."
      );
      return;
    }

    if (!boardId) {
      if (timeEntriesContainer)
        timeEntriesContainer.innerHTML =
          "<p>Select a board to view time entries.</p>";
      if (filtersDiv) filtersDiv.style.display = "none";
      if (summaryDiv) summaryDiv.style.display = "none";
      if (summaryContent) summaryContent.innerHTML = "";
      return;
    }

    if (loadingIndicator) loadingIndicator.style.display = "block";
    if (timeEntriesContainer) timeEntriesContainer.innerHTML = ""; // Clear existing content before fetch
    if (filtersDiv) filtersDiv.style.display = "block";
    if (summaryDiv) summaryDiv.style.display = "none";
    if (summaryContent) summaryContent.innerHTML = "";

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const selectedUserId = userSelectElementForValue
      ? userSelectElementForValue.value
      : null;

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (selectedUserId) queryParams.append("userId", selectedUserId);

    const queryString = queryParams.toString();
    const apiUrl = `/api/boards/${boardId}/time-data${
      queryString ? `?${queryString}` : ""
    }`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { timeData, listMap, memberMap } = await response.json();

      currentListMap = listMap;
      currentMemberMap = memberMap;

      displayTimeEntries(timeData, currentListMap, currentMemberMap);
      // Removed setTimeout, call directly
      populateUserFilter(currentMemberMap);
    } catch (error) {
      console.error(`Error fetching time data for board ${boardId}:`, error);
      if (timeEntriesContainer) {
        timeEntriesContainer.innerHTML = `<p>Error loading time data. ${error.message}</p>`;
      }
    } finally {
      if (loadingIndicator) loadingIndicator.style.display = "none";
    }
  }

  function displayTimeEntries(cardDataArray, listMap, memberMap) {
    const timeEntriesContainer = document.getElementById(
      "time-entries-container"
    );
    if (!timeEntriesContainer) return;
    // Ensure container is cleared here, before adding new content
    timeEntriesContainer.innerHTML = "";

    if (!cardDataArray || cardDataArray.length === 0) {
      timeEntriesContainer.innerHTML =
        "<p>No cards with time entries or estimates found (or matching filters).</p>";
      return;
    }

    const groupedByList = cardDataArray.reduce((acc, card) => {
      console.log(card);
      const listId = card.listId || "unknown-list";
      if (!acc[listId]) {
        acc[listId] = {
          listName: listMap[listId] || "Unknown List",
          cards: [],
          totalReportedHours: 0,
          totalEstimatedHours: 0,
        };
      }
      const cardReportedHours = card.timeEntries.reduce(
        (sum, entry) => sum + entry.hours,
        0
      );
      card.totalReportedHours = cardReportedHours;
      acc[listId].cards.push(card);
      acc[listId].totalReportedHours += cardReportedHours;
      acc[listId].totalEstimatedHours += card.estimatedHours || 0;
      return acc;
    }, {});

    const sortedLists = Object.values(groupedByList).sort((a, b) =>
      a.listName.localeCompare(b.listName)
    );

    sortedLists.forEach((listGroup) => {
      const listDetails = document.createElement("details");
      listDetails.classList.add("list-group-details");
      listDetails.open = true;

      const listSummary = document.createElement("summary");
      listSummary.classList.add("list-summary");
      listSummary.innerHTML = `
        <span class="list-name">${listGroup.listName}</span>
        <span class="list-hours">(Est: ${listGroup.totalEstimatedHours.toFixed(
          2
        )}h / Rep: ${listGroup.totalReportedHours.toFixed(2)}h)</span>`;
      listDetails.appendChild(listSummary);

      const cardsContainer = document.createElement("div");
      cardsContainer.classList.add("cards-container");
      listDetails.appendChild(cardsContainer);

      listGroup.cards.sort((a, b) => a.cardName.localeCompare(b.cardName));

      listGroup.cards.forEach((card) => {
        const cardDetails = document.createElement("details");
        cardDetails.classList.add("card-group-details");

        const cardSummary = document.createElement("summary");
        // Add the Trello link here
        cardSummary.innerHTML = `
          <span class="card-name">${card.cardName}</span>
          <a href="${
            card.cardUrl
          }" target="_blank" class="card-trello-link" title="Open card in Trello">🔗</a>
          <span class="card-hours">(Est: ${(card.estimatedHours || 0).toFixed(
            2
          )}h / Rep: ${card.totalReportedHours.toFixed(2)}h)</span>`;
        cardDetails.appendChild(cardSummary);

        const entriesDiv = document.createElement("div");
        entriesDiv.classList.add("card-entries-list");

        // --- Add Estimated Time Row ---
        const estimatedTimeDiv = document.createElement("div");
        estimatedTimeDiv.classList.add("entry-item", "entry-estimated"); // Add a class for styling
        estimatedTimeDiv.innerHTML = `
          <span style="font-weight: bold;">Total Estimated:</span>
          <span></span> <!-- Placeholder for date -->
          <span style="font-weight: bold;">${(card.estimatedHours || 0).toFixed(
            2
          )}h</span>
          <span></span> <!-- Placeholder for comment -->
         `;
        entriesDiv.appendChild(estimatedTimeDiv);
        // --- End Estimated Time Row ---

        // --- Add Total Reported Time Row ---
        const reportedTimeDiv = document.createElement("div");
        reportedTimeDiv.classList.add("entry-item", "entry-reported-total"); // Add a class for styling
        reportedTimeDiv.innerHTML = `
           <span style="font-weight: bold;">Total Reported:</span>
           <span></span> <!-- Placeholder for date -->
           <span style="font-weight: bold;">${card.totalReportedHours.toFixed(
             2
           )}h</span>
           <span></span> <!-- Placeholder for comment -->
         `;
        entriesDiv.appendChild(reportedTimeDiv);
        // --- End Total Reported Time Row ---

        const headerDiv = document.createElement("div");
        headerDiv.classList.add("entry-item", "entry-header");
        headerDiv.innerHTML = `
          <span>User</span>
          <span>Date</span>
          <span>Hours</span>
          <span>Comment</span>`;
        entriesDiv.appendChild(headerDiv);

        card.timeEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (card.timeEntries.length > 0) {
          card.timeEntries.forEach((entry) => {
            const entryDiv = document.createElement("div");
            entryDiv.classList.add("entry-item");
            const userName = entry.memberId
              ? memberMap[entry.memberId] || entry.memberId
              : "N/A";
            const dateStr = entry.date
              ? new Date(entry.date).toLocaleDateString()
              : "N/A";
            const hoursStr = entry.hours.toFixed(2);
            const commentStr = entry.comment || "";
            entryDiv.innerHTML = `
              <span>${userName}</span>
              <span>${dateStr}</span>
              <span>${hoursStr}</span>
              <span>${commentStr}</span>`;
            entriesDiv.appendChild(entryDiv);
          });
        } else {
          const noEntriesDiv = document.createElement("div");
          noEntriesDiv.classList.add("entry-item", "no-entries");
          noEntriesDiv.textContent =
            "No reported time entries for this period.";
          entriesDiv.appendChild(noEntriesDiv);
        }
        cardDetails.appendChild(entriesDiv);
        cardsContainer.appendChild(cardDetails);
      });
      if (timeEntriesContainer) {
        timeEntriesContainer.appendChild(listDetails);
      }
    });
  }

  function exportToCSV() {
    alert("Export function needs update for the new data structure.");
    return;
  }

  function populateUserFilter(memberMap) {
    const userSelectElement = document.getElementById("user-select");
    if (!userSelectElement) {
      console.error(
        "Cannot populate user filter: element 'user-select' not found."
      );
      return;
    }

    try {
      // Add explicit null check before reading value
      const currentVal = userSelectElement ? userSelectElement.value : "";
      // Ensure element exists before setting innerHTML
      if (userSelectElement) {
        userSelectElement.innerHTML = '<option value="">All Users</option>';
      } else {
        console.error(
          "User select element became null before setting innerHTML."
        );
        return; // Stop if element is null here
      }

      const sortedMembers = Object.entries(memberMap).sort(
        ([, nameA], [, nameB]) => nameA.localeCompare(nameB)
      );

      sortedMembers.forEach(([id, name]) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = name;
        // Check again before appendChild
        if (userSelectElement) {
          userSelectElement.appendChild(option);
        }
      });

      // Check again before setting value
      if (
        userSelectElement &&
        userSelectElement.querySelector(`option[value="${currentVal}"]`)
      ) {
        userSelectElement.value = currentVal;
      }
    } catch (error) {
      console.error("Error populating user filter:", error);
    }
  }

  // --- Event Listeners ---
  boardSelect.addEventListener("change", (event) => {
    try {
      const selectedBoardId = event.target.value;
      currentListMap = {};
      currentMemberMap = {};
      const timeEntriesContainerElement = document.getElementById(
        "time-entries-container"
      );
      if (timeEntriesContainerElement) {
        // Removed innerHTML assignment here
      } else {
        console.error(
          "Could not find timeEntriesContainerElement in change listener."
        );
      }
      fetchTimeData(selectedBoardId);
    } catch (error) {
      console.error("Error in boardSelect change listener:", error);
    }
  });

  applyFiltersButton.addEventListener("click", () => {
    // Wrap entire listener in try...catch
    try {
      const boardSelectElement = document.getElementById("board-select"); // Get fresh ref
      if (!boardSelectElement) {
        console.error(
          "Apply Filters Error: Could not find board select element."
        );
        alert("Error: Board selection not found.");
        return;
      }
      const selectedBoardId = boardSelectElement.value;
      if (selectedBoardId) {
        fetchTimeData(selectedBoardId);
      } else {
        alert("Please select a board first.");
      }
    } catch (error) {
      console.error("Error in applyFiltersButton click listener:", error);
      alert(
        "An error occurred while applying filters. Please check the console."
      );
    }
  });

  exportCsvButton.addEventListener("click", exportToCSV);

  // --- Toggle All Details Listener ---
  const toggleAllButton = document.getElementById("toggle-all-details");
  if (toggleAllButton) {
    toggleAllButton.addEventListener("click", () => {
      const container = document.getElementById("time-entries-container");
      if (!container) return;

      const allDetails = container.querySelectorAll("details");
      if (allDetails.length === 0) return; // Nothing to toggle

      // Determine the target state: if *any* are closed, open all. Otherwise, close all.
      let shouldOpen = false;
      for (const detail of allDetails) {
        if (!detail.open) {
          shouldOpen = true;
          break;
        }
      }

      // Apply the state and update button text
      allDetails.forEach((detail) => {
        detail.open = shouldOpen;
      });
      toggleAllButton.textContent = shouldOpen ? "Collapse All" : "Expand All";
    });
  } else {
    console.warn("Toggle all button not found."); // Warn if button is missing
  }

  // --- Initial Load ---
  fetchBoards();
});
