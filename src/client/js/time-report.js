/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
const TIME_ENTRIES_KEY = 'timeEntries';
const ESTIMATED_TIME_KEY = 'estimatedTime';

// Funkcja do formatowania czasu
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

// Funkcja inicjalizująca raport dla całej tablicy
document.addEventListener('DOMContentLoaded', function() {
  // Ustawienie domyślnego zakresu dat (ostatni miesiąc)
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  document.getElementById('date-from').valueAsDate = oneMonthAgo;
  document.getElementById('date-to').valueAsDate = today;

  // Funkcja do generowania raportu
  function generateReport(fromDate, toDate) {
    // Pobranie wszystkich list i kart z tablicy
    Promise.all([
      t.lists('id', 'name'),
      t.cards('id', 'name', 'idList')
    ])
        .then(function([lists, cards]) {
          // Utworzenie mapy list
          const listsMap = {};
          lists.forEach(list => {
            listsMap[list.id] = list.name;
          });

          // Pobranie danych o czasie dla wszystkich kart
          const cardPromises = cards.map(card => {
            return t.get(card.id, 'shared', TIME_ENTRIES_KEY)
                .then(timeEntries => {
                  return {
                    card: card,
                    timeEntries: timeEntries || [],
                    listName: listsMap[card.idList]
                  };
                });
          });

          return Promise.all(cardPromises);
        })
        .then(function(cardsWithTime) {
          // Filtracja wpisów według daty
          cardsWithTime.forEach(cardData => {
            if (fromDate && toDate) {
              cardData.timeEntries = cardData.timeEntries.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate >= fromDate && entryDate <= toDate;
              });
            }
          });

          // Obliczenie łącznego czasu dla całej tablicy
          let boardTotalMinutes = 0;
          cardsWithTime.forEach(cardData => {
            cardData.totalMinutes = cardData.timeEntries.reduce((total, entry) => {
              return total + (entry.hours * 60 + entry.minutes);
            }, 0);
            boardTotalMinutes += cardData.totalMinutes;
          });

          document.getElementById('board-total-time').textContent = formatTime(boardTotalMinutes);

          // Generowanie raportów według list
          const listReports = {};
          cardsWithTime.forEach(cardData => {
            const listName = cardData.listName;
            if (!listReports[listName]) {
              listReports[listName] = 0;
            }
            listReports[listName] += cardData.totalMinutes;
          });

          const listReportHtml = Object.keys(listReports)
              .map(listName => {
                return `
              <div>
                <p><strong>${listName}:</strong> ${formatTime(listReports[listName])}</p>
              </div>
            `;
              })
              .join('');

          document.getElementById('list-time-reports').innerHTML =
              listReportHtml || 'Brak danych o czasie dla list';

          // Generowanie raportów według kart
          const cardsWithTimeHtml = cardsWithTime
              .filter(cardData => cardData.totalMinutes > 0)
              .sort((a, b) => b.totalMinutes - a.totalMinutes)
              .map(cardData => {
                return `
              <div>
                <p><strong>${cardData.card.name}:</strong> ${formatTime(cardData.totalMinutes)}</p>
              </div>
            `;
              })
              .join('');

          document.getElementById('card-time-reports').innerHTML =
              cardsWithTimeHtml || 'Brak danych o czasie dla kart';

          // Raporty według użytkowników
          const userReports = {};
          cardsWithTime.forEach(cardData => {
            cardData.timeEntries.forEach(entry => {
              const username = entry.username || 'Nieznany użytkownik';
              if (!userReports[username]) {
                userReports[username] = 0;
              }
              userReports[username] += (entry.hours * 60 + entry.minutes);
            });
          });

          const userReportHtml = Object.keys(userReports)
              .sort((a, b) => userReports[b] - userReports[a])
              .map(username => {
                return `
              <div>
                <p><strong>${username}:</strong> ${formatTime(userReports[username])}</p>
              </div>
            `;
              })
              .join('');

          document.getElementById('user-time-reports').innerHTML =
              userReportHtml || 'Brak danych o czasie dla użytkowników';

          // Zapisanie danych do eksportu
          window.reportData = {
            boardTotalMinutes,
            listReports,
            userReports,
            cardsWithTime,
            fromDate,
            toDate
          };
        });
  }

  // Obsługa filtrowania
  document.getElementById('filter-button').addEventListener('click', function() {
    const fromDate = document.getElementById('date-from').valueAsDate;
    const toDate = document.getElementById('date-to').valueAsDate;

    if (toDate) {
      // Ustawienie końca dnia dla daty końcowej
      toDate.setHours(23, 59, 59, 999);
    }

    generateReport(fromDate, toDate);
  });

  // Obsługa eksportu do CSV
  document.getElementById('export-board-button').addEventListener('click', function() {
    if (!window.reportData) {
      alert('Najpierw wygeneruj raport!');
      return;
    }

    const { cardsWithTime, fromDate, toDate } = window.reportData;

    // Utworzenie zawartości CSV
    const reportRows = [];

    // Nagłówek
    reportRows.push(['Lista', 'Nazwa zadania', 'Data', 'Godziny', 'Minuty', 'Czas łącznie', 'Użytkownik', 'Opis', 'Szacunkowy czas']);

    // Dane dla każdej karty
    cardsWithTime.forEach(cardData => {
      // Pobranie szacunkowego czasu
      t.get(cardData.card.id, 'shared', ESTIMATED_TIME_KEY)
          .then(estimatedTime => {
            const estimatedTimeStr = estimatedTime ? formatTime(estimatedTime) : 'Nie określono';

            if (cardData.timeEntries.length === 0) {
              reportRows.push([
                cardData.listName,
                cardData.card.name,
                '',
                0,
                0,
                '0 min',
                'Nieznany użytkownik',
                '',
                estimatedTimeStr
              ]);
            } else {
              cardData.timeEntries.forEach(entry => {
                reportRows.push([
                  cardData.listName,
                  cardData.card.name,
                  new Date(entry.date).toLocaleString('pl-PL'),
                  entry.hours,
                  entry.minutes,
                  formatTime(entry.hours * 60 + entry.minutes),
                  entry.username || 'Nieznany użytkownik',
                  entry.description || '',
                  estimatedTimeStr
                ]);
              });
            }

            // Po dodaniu wszystkich danych, przygotuj i pobierz plik CSV
            const csvContent = reportRows
                .map(row => row.map(cell => `"${cell}"`).join(','))
                .join('\n');

            const dateRange = fromDate && toDate ?
                `_${fromDate.toISOString().slice(0, 10)}_to_${toDate.toISOString().slice(0, 10)}` : '';

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `trello_board_time_report${dateRange}.csv`);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
    });
  });

  // Obsługa przycisku zamknięcia
  document.getElementById('close-button').addEventListener('click', function() {
    t.closeModal();
  });

  // Wygenerowanie raportu dla domyślnego zakresu dat
  generateReport(oneMonthAgo, today);
});