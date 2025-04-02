document.addEventListener("DOMContentLoaded", () => {
  // --- Parse URL Parameters ---
  const urlParams = new URLSearchParams(window.location.search);
  const initialBoardId = urlParams.get("boardId");
  const initialStartDate = urlParams.get("startDate");
  const initialEndDate = urlParams.get("endDate");
  const initialUserId = urlParams.get("userId");
  const initialLabelId = urlParams.get("labelId");

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

  // --- State Variables ---
  let currentListMap = {};
  let currentMemberMap = {};
  let currentFetchedTimeData = []; // Store the raw data for export

  // --- DOM References (Declare here, assign after DOM is ready) ---
  // Chart-related references removed

  // --- Helper Functions ---

  // Function to update URL parameters without reloading
  function updateUrlParameters() {
    const selectedBoardId = boardSelect.value;
    const pickerData = $("#date-range-picker").data("daterangepicker");
    const startDate = pickerData?.startDate?.isValid()
      ? pickerData.startDate.format("YYYY-MM-DD")
      : null;
    const endDate = pickerData?.endDate?.isValid()
      ? pickerData.endDate.format("YYYY-MM-DD")
      : null;
    const selectedUserId = document.getElementById("user-select")?.value;
    const selectedLabelId = document.getElementById("label-select")?.value;

    const params = new URLSearchParams();
    if (selectedBoardId) params.set("boardId", selectedBoardId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (selectedUserId) params.set("userId", selectedUserId);
    if (selectedLabelId) params.set("labelId", selectedLabelId);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    // Use replaceState to avoid polluting browser history excessively
    window.history.replaceState({ path: newUrl }, "", newUrl);
  }

  // Helper function to format hours (e.g., 8.5, 8, not 8.50 or 8.00)
  function formatHours(hours) {
    const num = Number(hours) || 0; // Ensure it's a number, default to 0
    if (Math.abs(num - Math.round(num)) < 0.001) {
      return num.toString(); // Return as integer string
    } else {
      return parseFloat(num.toFixed(1)).toString();
    }
  }

  async function fetchBoards() {
    const boardSelectElement = document.getElementById("board-select");
    if (!boardSelectElement) {
      console.error("fetchBoards: boardSelectElement not found.");
      return;
    }
    try {
      const response = await fetch("/api/boards");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const boards = await response.json();
      boardSelectElement.innerHTML =
        '<option value="">-- Select a Board --</option>';
      boards.forEach((board) => {
        const option = document.createElement("option");
        option.value = board.id;
        option.textContent = board.name;
        boardSelectElement.appendChild(option);
      });

      // --- Apply initial board selection from URL ---
      if (
        initialBoardId &&
        boardSelectElement.querySelector(`option[value="${initialBoardId}"]`)
      ) {
        boardSelectElement.value = initialBoardId;
        // Trigger fetchTimeData only if boardId was in URL and successfully set
        fetchTimeData(initialBoardId);
      } else {
        // If no valid initial board ID, hide filters/summary
        const filtersDiv = document.querySelector(".filters");
        const summaryDiv = document.querySelector(".summary");
        if (filtersDiv) filtersDiv.style.display = "none";
        if (summaryDiv) summaryDiv.style.display = "none";
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
      if (boardSelectElement)
        boardSelectElement.innerHTML =
          '<option value="">Error loading boards</option>';
    }
  }

  async function fetchTimeData(boardId) {
    // Get references needed for this function
    const timeEntriesContainer = document.getElementById(
      "time-entries-container"
    );
    const loadingIndicator = document.getElementById("loading-indicator");
    const filtersDiv = document.querySelector(".filters");
    const summaryDiv = document.querySelector(".summary");
    const summaryContent = document.getElementById("summary-content");
    const dateRangePickerInput = $("#date-range-picker");
    const userSelectElementForValue = document.getElementById("user-select");
    const labelSelectElementForValue = document.getElementById("label-select");

    // Check if essential elements exist
    if (
      !timeEntriesContainer ||
      !loadingIndicator ||
      !filtersDiv ||
      !summaryDiv ||
      !summaryContent ||
      !dateRangePickerInput.length ||
      !userSelectElementForValue ||
      !labelSelectElementForValue
    ) {
      console.error(
        "Error fetching time data: One or more display/filter elements are missing."
      );
      return;
    }

    if (!boardId) {
      currentFetchedTimeData = []; // Clear data if no board selected
      if (timeEntriesContainer)
        timeEntriesContainer.innerHTML =
          "<p>Select a board to view time entries.</p>";
      if (filtersDiv) filtersDiv.style.display = "none";
      if (summaryDiv) summaryDiv.style.display = "none";
      if (summaryContent) summaryContent.innerHTML = "";
      // No need to clear charts
      return;
    }

    if (loadingIndicator) loadingIndicator.style.display = "block";
    if (timeEntriesContainer) timeEntriesContainer.innerHTML = ""; // Clear existing content before fetch
    if (filtersDiv) filtersDiv.style.display = "flex";
    if (summaryDiv) summaryDiv.style.display = "none";
    if (summaryContent) summaryContent.innerHTML = "";
    // No need to clear charts

    // Get dates from daterangepicker instance
    const pickerData = dateRangePickerInput.data("daterangepicker");

    const startDate = pickerData?.startDate?.isValid()
      ? pickerData.startDate.format("YYYY-MM-DD")
      : null;
    const endDate = pickerData?.endDate?.isValid()
      ? pickerData.endDate.format("YYYY-MM-DD")
      : null;

    const selectedUserId = userSelectElementForValue?.value;
    const selectedLabelId = labelSelectElementForValue?.value;

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (selectedUserId) queryParams.append("userId", selectedUserId);
    if (selectedLabelId) queryParams.append("labelId", selectedLabelId);

    const queryString = queryParams.toString();
    console.log(queryString);
    const apiUrl = `/api/boards/${boardId}/time-data${
      queryString ? `?${queryString}` : ""
    }`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const { timeData, listMap, memberMap, boardLabels } =
        await response.json();

      currentListMap = listMap;
      currentMemberMap = memberMap;
      currentFetchedTimeData = timeData; // Store fetched data

      // Populate filters first, applying initial values if present
      populateUserFilter(currentMemberMap, initialUserId);
      populateLabelFilter(boardLabels, initialLabelId);

      // Now display entries based on potentially pre-filled filters
      displayTimeEntries(
        currentFetchedTimeData,
        currentListMap,
        currentMemberMap
      );

      // Update URL after fetching and potentially applying initial filters
      // updateUrlParameters(); // Call moved to event handlers to avoid double updates

      // renderCharts(); // Removed chart rendering call
    } catch (error) {
      console.error(`Error fetching time data for board ${boardId}:`, error);
      currentFetchedTimeData = []; // Clear data on error
      if (timeEntriesContainer)
        timeEntriesContainer.innerHTML = `<p>Error loading time data. ${error.message}</p>`;
    } finally {
      if (loadingIndicator) loadingIndicator.style.display = "none";
    }
  }

  function displayTimeEntries(cardDataArray, listMap, memberMap) {
    const timeEntriesContainer = document.getElementById(
      "time-entries-container"
    );
    if (!timeEntriesContainer) return;
    timeEntriesContainer.innerHTML = "";

    if (!cardDataArray || cardDataArray.length === 0) {
      timeEntriesContainer.innerHTML =
        "<p>No cards with time entries or estimates found (or matching filters).</p>";
      return;
    }

    const groupedByList = cardDataArray.reduce((acc, card) => {
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
        (sum, entry) => sum + (entry.hours || 0),
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
      listSummary.innerHTML = `<span class="list-name">${
        listGroup.listName
      }</span> <span class="list-hours">(Est: ${formatHours(
        listGroup.totalEstimatedHours
      )}h / Rep: ${formatHours(listGroup.totalReportedHours)}h)</span>`;
      listDetails.appendChild(listSummary);

      const cardsContainer = document.createElement("div");
      cardsContainer.classList.add("cards-container");
      listDetails.appendChild(cardsContainer);

      listGroup.cards.sort((a, b) => a.cardName.localeCompare(b.cardName));

      listGroup.cards.forEach((card) => {
        // Only render the card if it has reported hours
        if (card.totalReportedHours > 0) {
          const cardDetails = document.createElement("details");
          cardDetails.classList.add("card-group-details");
          // Default to open since we are only showing cards with time entries
          cardDetails.open = true;

          const cardSummary = document.createElement("summary");
          cardSummary.innerHTML = `<span class="card-name">${
            card.cardName
          }</span> <a href="${
            card.cardUrl
          }" target="_blank" class="card-trello-link" title="Open card in Trello">🔗</a> <span class="card-hours">(Est: ${formatHours(
            card.estimatedHours || 0
          )}h / Rep: ${formatHours(card.totalReportedHours)}h)</span>`;
          cardDetails.appendChild(cardSummary);

          const entriesDiv = document.createElement("div");
          entriesDiv.classList.add("card-entries-list");

          // Removed Total Estimated and Total Reported divs

          const headerDiv = document.createElement("div");
          headerDiv.classList.add("entry-item", "entry-header");
          headerDiv.innerHTML = `<span>User</span> <span>Date</span> <span>Hours</span> <span>Comment</span>`;
          entriesDiv.appendChild(headerDiv);

          // Sort and display entries (we know timeEntries.length > 0 because totalReportedHours > 0)
          card.timeEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

          card.timeEntries.forEach((entry) => {
            const entryDiv = document.createElement("div");
            entryDiv.classList.add("entry-item");
            const userName = entry.memberId
              ? memberMap[entry.memberId] || entry.memberId
              : "N/A";
            const dateStr = entry.date
              ? new Date(entry.date).toLocaleDateString()
              : "N/A";
            const hoursStr = formatHours(entry.hours);
            const commentStr = entry.comment || "";
            entryDiv.innerHTML = `<span>${userName}</span> <span>${dateStr}</span> <span>${hoursStr}</span> <span>${commentStr}</span>`;
            entriesDiv.appendChild(entryDiv);
          });
          // Removed the 'else' block for "No reported time entries" as this card wouldn't be rendered anyway

          cardDetails.appendChild(entriesDiv);
          cardsContainer.appendChild(cardDetails); // Append card details only if it passed the check
        } // End if (card.totalReportedHours > 0)
      });
      // Only append the list details if it contains any cards after filtering
      if (cardsContainer.hasChildNodes()) {
        timeEntriesContainer.appendChild(listDetails);
      }
    });
  }

  function exportToCSV() {
    if (!currentFetchedTimeData || currentFetchedTimeData.length === 0) {
      alert(
        "No data available to export. Please select a board and apply filters."
      );
      return;
    }

    const boardSelectElement = document.getElementById("board-select");
    const boardName = boardSelectElement
      ? boardSelectElement.options[boardSelectElement.selectedIndex].text
      : "UnknownBoard";
    const filename = `trello_time_report_${boardName.replace(
      /[^a-z0-9]/gi,
      "_"
    )}_${new Date().toISOString().split("T")[0]}.csv`;

    const headers = [
      "List Name",
      "Card Name",
      "Card URL",
      "Estimated Hours (Card)",
      "User",
      "Date",
      "Reported Hours (Entry)",
      "Comment",
    ];
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent +=
      headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(",") +
      "\r\n";

    const escapeCsv = (field) => {
      if (field === null || field === undefined) return '""';
      const stringField = String(field);
      if (
        stringField.includes(",") ||
        stringField.includes("\n") ||
        stringField.includes('"')
      ) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return `"${stringField}"`;
    };

    currentFetchedTimeData.forEach((card) => {
      const listName = currentListMap[card.listId] || "Unknown List";
      const cardName = card.cardName || "Unnamed Card";
      const cardUrl = card.cardUrl || "";
      const estimatedHours = formatHours(card.estimatedHours || 0);

      if (card.timeEntries && card.timeEntries.length > 0) {
        card.timeEntries.forEach((entry) => {
          const userName = currentMemberMap[entry.memberId] || "Unknown User";
          const dateStr = entry.date
            ? new Date(entry.date).toLocaleDateString()
            : "N/A";
          const reportedHours = formatHours(entry.hours || 0);
          const comment = entry.comment || "";
          const row = [
            listName,
            cardName,
            cardUrl,
            estimatedHours,
            userName,
            dateStr,
            reportedHours,
            comment,
          ];
          csvContent += row.map(escapeCsv).join(",") + "\r\n";
        });
      } else {
        const row = [
          listName,
          cardName,
          cardUrl,
          estimatedHours,
          "N/A",
          "N/A",
          "0",
          "(No time entries reported)",
        ];
        csvContent += row.map(escapeCsv).join(",") + "\r\n";
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Removed renderCharts and clearCharts functions

  function populateUserFilter(memberMap, valueToSelect = null) {
    const userSelectElement = document.getElementById("user-select");
    if (!userSelectElement) {
      console.error(
        "Cannot populate user filter: element 'user-select' not found."
      );
      return;
    }
    try {
      const currentVal = userSelectElement.value;
      userSelectElement.innerHTML = '<option value="">All Users</option>';
      const sortedMembers = Object.entries(memberMap).sort(
        ([, nameA], [, nameB]) => nameA.localeCompare(nameB)
      );
      sortedMembers.forEach(([id, name]) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = name;
        userSelectElement.appendChild(option);
      });
      // Set value based on parameter or previously selected value
      const finalValue = valueToSelect || currentVal;
      if (userSelectElement.querySelector(`option[value="${finalValue}"]`)) {
        userSelectElement.value = finalValue;
      }
    } catch (error) {
      console.error("Error populating user filter:", error);
    }
  }

  function populateLabelFilter(boardLabels, valueToSelect = null) {
    const labelSelectElement = document.getElementById("label-select");
    if (!labelSelectElement) {
      console.error(
        "Cannot populate label filter: element 'label-select' not found."
      );
      return;
    }
    if (!Array.isArray(boardLabels)) {
      console.error(
        "Cannot populate label filter: boardLabels is not an array.",
        boardLabels
      );
      labelSelectElement.innerHTML =
        '<option value="">Error loading labels</option>';
      return;
    }
    try {
      const currentVal = labelSelectElement.value;
      labelSelectElement.innerHTML = '<option value="">All Labels</option>';
      boardLabels.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
      boardLabels.forEach((label) => {
        const option = document.createElement("option");
        option.value = label.id;
        option.textContent = label.name || `(No Name - ${label.color})`;
        labelSelectElement.appendChild(option);
      });
      // Set value based on parameter or previously selected value
      const finalValue = valueToSelect || currentVal;
      if (labelSelectElement.querySelector(`option[value="${finalValue}"]`)) {
        labelSelectElement.value = finalValue;
      }
    } catch (error) {
      console.error("Error populating label filter:", error);
      labelSelectElement.innerHTML =
        '<option value="">Error loading labels</option>';
    }
  }

  // --- Initialize Date Range Picker (using jQuery) ---
  if (typeof $ !== "undefined" && typeof $.fn.daterangepicker !== "undefined") {
    $("#date-range-picker").daterangepicker({
      opens: "left",
      autoUpdateInput: false, // Set to false: Input field is empty initially
      locale: {
        format: "YYYY-MM-DD",
        cancelLabel: "Clear",
        applyLabel: "Apply",
      },
      ranges: {
        Today: [moment(), moment()],
        Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
        "Last 7 Days": [moment().subtract(6, "days"), moment()],
        "Last 30 Days": [moment().subtract(29, "days"), moment()],
        "This Month": [moment().startOf("month"), moment().endOf("month")],
        "Last Month": [
          moment().subtract(1, "month").startOf("month"),
          moment().subtract(1, "month").endOf("month"),
        ],
      },
    });

    // --- Apply initial date range from URL ---
    if (initialStartDate && initialEndDate) {
      const startDateMoment = moment(initialStartDate, "YYYY-MM-DD");
      const endDateMoment = moment(initialEndDate, "YYYY-MM-DD");
      if (startDateMoment.isValid() && endDateMoment.isValid()) {
        $("#date-range-picker")
          .data("daterangepicker")
          .setStartDate(startDateMoment);
        $("#date-range-picker")
          .data("daterangepicker")
          .setEndDate(endDateMoment);
        $("#date-range-picker").val(
          startDateMoment.format("YYYY-MM-DD") +
            " - " +
            endDateMoment.format("YYYY-MM-DD")
        );
      } else {
        $("#date-range-picker").val(""); // Clear if dates are invalid
      }
    } else {
      $("#date-range-picker").val(""); // Clear if no dates in URL
    }

    // Event listener for when the picker is shown
    $("#date-range-picker").on("show.daterangepicker", function (ev, picker) {
      // If the input is currently empty AND no initial dates were set, default to current month
      if (!$(this).val() && !initialStartDate && !initialEndDate) {
        const startOfMonth = moment().startOf("month");
        const endOfMonth = moment().endOf("month");
        picker.setStartDate(startOfMonth);
        picker.setEndDate(endOfMonth);
      }
      // If dates *were* set (either from URL or user action), the picker should open showing those dates.
    });

    $("#date-range-picker").on("apply.daterangepicker", function (ev, picker) {
      $(this).val(
        picker.startDate.format("YYYY-MM-DD") +
          " - " +
          picker.endDate.format("YYYY-MM-DD")
      );
      updateUrlParameters(); // Update URL
      // Trigger filter fetch when a range is applied
      const selectedBoardId = document.getElementById("board-select").value;
      if (selectedBoardId) fetchTimeData(selectedBoardId);
    });

    $("#date-range-picker").on("cancel.daterangepicker", function (ev, picker) {
      $(this).val(""); // Clear the input
      // Reset picker dates to avoid keeping old selection internally
      picker.setStartDate(moment().startOf("month")); // Or some other default
      picker.setEndDate(moment().endOf("month"));
      updateUrlParameters(); // Update URL (will remove date params)
      // Trigger filter fetch when cleared
      const selectedBoardId = document.getElementById("board-select").value;
      if (selectedBoardId) fetchTimeData(selectedBoardId);
    });

    // Initial value is set based on URL params above
    // $("#date-range-picker").val(""); // Removed this line
  } else {
    console.error(
      "jQuery or daterangepicker library not loaded. Date range picker will not function."
    );
    const dateRangeInput = document.getElementById("date-range-picker");
    if (dateRangeInput) {
      dateRangeInput.placeholder = "Date picker failed to load";
      dateRangeInput.disabled = true;
    }
  }

  // --- Event Listeners ---
  boardSelect.addEventListener("change", (event) => {
    try {
      const selectedBoardId = event.target.value;
      updateUrlParameters(); // Update URL when board changes
      currentListMap = {};
      currentMemberMap = {};
      currentFetchedTimeData = [];
      const timeEntriesContainerElement = document.getElementById(
        "time-entries-container"
      );
      if (timeEntriesContainerElement)
        timeEntriesContainerElement.innerHTML =
          "<p>Select a board to view time entries.</p>";
      else
        console.error(
          "Could not find timeEntriesContainerElement in change listener."
        );
      // clearCharts(); // Removed chart clearing call
      // if (chartsContainer) // Removed chart container reset
      //   chartsContainer.innerHTML =
      //     "<p>Select a board and apply filters to view charts.</p>";

      // Reset date picker to empty when board changes
      if (
        typeof $ !== "undefined" &&
        typeof $.fn.daterangepicker !== "undefined"
      ) {
        $("#date-range-picker").val("");
        // Also reset internal dates of the picker instance
        const picker = $("#date-range-picker").data("daterangepicker");
        if (picker) {
          // set default value to this month
          const startOfMonth = moment().startOf("month");
          const endOfMonth = moment().endOf("month");
          picker.setStartDate(startOfMonth);
          // Setting to null might cause issues, better to set to a default like today or clear ranges
          // Or simply rely on the 'show' event to set it next time it's opened.
          // Let's just clear the input value for now.
        }
      }

      // Reset filters when board changes? Optional, but often desired.
      // document.getElementById("user-select").value = "";
      // document.getElementById("label-select").value = "";
      // $("#date-range-picker").val("");
      // updateUrlParameters(); // Update URL again if filters are reset

      fetchTimeData(selectedBoardId);
    } catch (error) {
      console.error("Error in boardSelect change listener:", error);
    }
  });

  applyFiltersButton.addEventListener("click", () => {
    try {
      const boardSelectElement = document.getElementById("board-select");
      if (!boardSelectElement) {
        console.error(
          "Apply Filters Error: Could not find board select element."
        );
        alert("Error: Board selection not found.");
        return;
      }
      const selectedBoardId = boardSelectElement.value;
      if (selectedBoardId) {
        updateUrlParameters(); // Update URL before fetching
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
      if (allDetails.length === 0) return;
      let shouldOpen = false;
      for (const detail of allDetails) {
        if (!detail.open) {
          shouldOpen = true;
          break;
        }
      }
      allDetails.forEach((detail) => {
        detail.open = shouldOpen;
      });
      toggleAllButton.textContent = shouldOpen ? "Collapse All" : "Expand All";
    });
  } else {
    console.warn("Toggle all button not found.");
  }

  // --- Initial Load ---
  // Removed assignment of chart element references

  fetchBoards(); // Fetches boards, and *if* initialBoardId exists, it triggers fetchTimeData inside fetchBoards' success handler.
  // No initial tab switch needed
});
