/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
var Promise = TrelloPowerUp.Promise;

// Kluczowe identyfikatory do przechowywania danych
const TIME_ENTRIES_KEY = "timeEntries";
const ESTIMATED_TIME_KEY = "estimatedTime";

// Funkcja do formatowania czasu w formacie "X godz Y min"
function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours} godz`;
  } else {
    return `${hours} godz ${minutes} min`;
  }
}

// Funkcja do obliczania łącznego czasu dla karty
function calculateTotalTime(timeEntries) {
  if (!timeEntries || !timeEntries.length) return 0;

  return timeEntries.reduce((total, entry) => {
    return total + (entry.hours * 60 + entry.minutes);
  }, 0);
}

// Funkcja do obliczania łącznego czasu dla listy
function calculateListTotalTime(t, listId, cards) {
  // Filtrowanie kart dla danej listy
  const listCards = cards.filter((card) => card.idList === listId);

  // Pobranie danych o czasie dla wszystkich kart w liście
  const cardPromises = listCards.map((card) => {
    return t.get(card.id, "shared", TIME_ENTRIES_KEY).then((timeEntries) => {
      return {
        card: card,
        timeEntries: timeEntries || [],
        totalMinutes: calculateTotalTime(timeEntries || []),
      };
    });
  });

  return Promise.all(cardPromises).then(function (cardsWithTime) {
    // Obliczenie łącznego czasu dla listy
    let listTotalMinutes = 0;
    cardsWithTime.forEach((cardData) => {
      listTotalMinutes += cardData.totalMinutes;
    });

    return listTotalMinutes;
  });
}

// Funkcja do obliczania łącznego szacowanego czasu dla listy
function calculateListEstimatedTime(t, listId, cards) {
  // Filtrowanie kart dla danej listy
  const listCards = cards.filter((card) => card.idList === listId);

  // Pobranie danych o szacowanym czasie dla wszystkich kart w liście
  const cardPromises = listCards.map((card) => {
    return t
      .get(card.id, "shared", ESTIMATED_TIME_KEY)
      .then((estimatedTime) => {
        return {
          card: card,
          estimatedTime: estimatedTime || 0,
        };
      });
  });

  return Promise.all(cardPromises).then(function (cardsWithEstimatedTime) {
    // Obliczenie łącznego szacowanego czasu dla listy
    let listEstimatedMinutes = 0;
    cardsWithEstimatedTime.forEach((cardData) => {
      listEstimatedMinutes += cardData.estimatedTime;
    });

    return listEstimatedMinutes;
  });
}

// Funkcja ładująca i wyświetlająca dane o czasie dla wszystkich list
function loadListsTimeData() {
  const container = document.getElementById("lists-time-container");

  Promise.all([
    t.board("id"),
    t.lists("id", "name"),
    t.cards("id", "name", "idList"),
  ])
    .then(function ([board, lists, cards]) {
      // Czyszczenie kontenera
      container.innerHTML = "";

      // Tworzenie elementów dla każdej listy
      const listPromises = lists.map((list) => {
        return Promise.all([
          calculateListTotalTime(t, list.id, cards),
          calculateListEstimatedTime(t, list.id, cards),
        ]).then(([totalMinutes, estimatedMinutes]) => {
          return {
            list: list,
            totalMinutes: totalMinutes,
            estimatedMinutes: estimatedMinutes,
          };
        });
      });

      return Promise.all(listPromises);
    })
    .then(function (listsWithTime) {
      if (listsWithTime.length === 0) {
        container.innerHTML =
          '<div class="empty-state">Brak list na tej tablicy</div>';
        return;
      }

      // Zachowanie oryginalnej kolejności list z tablicy
      // (listy są już w kolejności takiej jakiej są na tablicy)

      // Tworzenie elementów DOM dla każdej listy
      listsWithTime.forEach((listData) => {
        const listElement = document.createElement("div");
        listElement.className = "time-list-item";

        const nameElement = document.createElement("div");
        nameElement.className = "list-name";
        nameElement.textContent = listData.list.name;

        const timesContainer = document.createElement("div");
        timesContainer.className = "times-container";

        const actualTimeElement = document.createElement("div");
        actualTimeElement.className = "time-value";
        actualTimeElement.innerHTML = `<span class="time-label">Czas:</span> ${formatTime(
          listData.totalMinutes
        )}`;

        const estimatedTimeElement = document.createElement("div");
        estimatedTimeElement.className = "time-value";
        estimatedTimeElement.innerHTML = `<span class="time-label">Szacowany:</span> ${formatTime(
          listData.estimatedMinutes
        )}`;

        timesContainer.appendChild(actualTimeElement);
        timesContainer.appendChild(estimatedTimeElement);

        listElement.appendChild(nameElement);
        listElement.appendChild(timesContainer);
        container.appendChild(listElement);
      });
    })
    .catch(function (error) {
      console.error("Błąd podczas ładowania danych o czasie list:", error);
      container.innerHTML =
        '<div class="error">Wystąpił błąd podczas ładowania danych</div>';
    });
}

// Inicjalizacja po załadowaniu strony
t.render(function () {
  loadListsTimeData();
});
