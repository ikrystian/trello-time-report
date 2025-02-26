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

// Funkcja do formatowania daty
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL') + ' ' + date.toLocaleTimeString('pl-PL');
}

// Funkcja do obliczania łącznego czasu
function calculateTotalTime(timeEntries) {
  if (!timeEntries || !timeEntries.length) return 0;
  
  return timeEntries.reduce((total, entry) => {
    return total + (entry.hours * 60 + entry.minutes);
  }, 0);
}

// Funkcja inicjalizująca widok historii
document.addEventListener('DOMContentLoaded', function() {
  // Pobranie danych z karty
  Promise.all([
    t.get('card', 'shared', TIME_ENTRIES_KEY),
    t.get('card', 'shared', ESTIMATED_TIME_KEY),
    t.card('name')
  ])
    .then(function([timeEntries, estimatedTime, card]) {
      const entries = timeEntries || [];
      const cardName = card.name;
      
      // Wyświetlenie szacunkowego czasu
      const estimatedTimeDisplay = document.getElementById('estimated-time-display');
      if (estimatedTime) {
        estimatedTimeDisplay.textContent = `${formatTime(estimatedTime)}`;
      } else {
        estimatedTimeDisplay.textContent = 'Nie określono';
      }
      
      // Wyświetlenie łącznego czasu
      const totalMinutes = calculateTotalTime(entries);
      document.getElementById('total-time-display').textContent = formatTime(totalMinutes);
      
      // Wyświetlenie historii wpisów
      const entriesList = document.getElementById('time-entries-list');
      
      if (entries.length === 0) {
        entriesList.textContent = 'Brak wpisów';
      } else {
        // Sortowanie wpisów chronologicznie - od najnowszych
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const entriesHtml = entries.map(entry => {
          return `
            <div class="time-entry">
              <p><strong>Data:</strong> ${formatDate(entry.date)}</p>
              <p><strong>Czas:</strong> ${formatTime(entry.hours * 60 + entry.minutes)}</p>
              <p><strong>Opis:</strong> ${entry.description || 'Brak opisu'}</p>
              <hr>
            </div>
          `;
        }).join('');
        
        entriesList.innerHTML = entriesHtml;
      }
      
      // Eksport do CSV
      document.getElementById('export-button').addEventListener('click', function() {
        // Utworzenie zawartości CSV
        const csvContent = [
          ['Nazwa zadania', 'Data', 'Godziny', 'Minuty', 'Czas łącznie', 'Opis', 'Szacunkowy czas'],
          ...entries.map(entry => [
            cardName,
            formatDate(entry.date),
            entry.hours,
            entry.minutes,
            formatTime(entry.hours * 60 + entry.minutes),
            entry.description || '',
            estimatedTime ? formatTime(estimatedTime) : 'Nie określono'
          ])
        ]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');
        
        // Utworzenie i pobranie pliku CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `trello_time_report_${cardName}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      
      // Obsługa przycisku powrotu
      document.getElementById('back-button').addEventListener('click', function() {
        t.closeModal();
      });
    });
});