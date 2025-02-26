/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
const TIME_ENTRIES_KEY = 'timeEntries';

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
  return date.toLocaleDateString('pl-PL');
}

// Funkcja do obliczania łącznego czasu
function calculateTotalTime(timeEntries) {
  if (!timeEntries || !timeEntries.length) return 0;
  
  return timeEntries.reduce((total, entry) => {
    return total + (entry.hours * 60 + entry.minutes);
  }, 0);
}

// Funkcja inicjalizująca listę raportów czasu
document.addEventListener('DOMContentLoaded', function() {
  // Pobranie danych z karty
  t.get('card', 'shared', TIME_ENTRIES_KEY)
    .then(function(timeEntries) {
      const entries = timeEntries || [];
      
      // Wyświetlenie łącznego czasu
      const totalMinutes = calculateTotalTime(entries);
      document.getElementById('total-time').textContent = `Łączny czas: ${formatTime(totalMinutes)}`;
      
      // Sortowanie wpisów chronologicznie - od najnowszych
      entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Ograniczenie widoku do 3 elementów
      const displayEntries = entries.length > 3 ? entries.slice(0, 3) : entries;
      
      // Wyświetlenie historii wpisów
      const entriesList = document.getElementById('time-entries-list');
      
      if (entries.length === 0) {
        entriesList.textContent = 'Brak wpisów o czasie';
      } else {
        const entriesHtml = displayEntries.map(entry => {
          return `
            <div class="time-entry">
              <div class="time-entry-header">
                <span class="time-entry-time">${formatTime(entry.hours * 60 + entry.minutes)}</span>
                <span class="time-entry-date">${formatDate(entry.date)}</span>
              </div>
              <div class="time-entry-description">${entry.description || 'Brak opisu'}</div>
            </div>
          `;
        }).join('');
        
        entriesList.innerHTML = entriesHtml;
        
        // Pokaż przycisk "Zobacz wszystkie" jeśli jest więcej niż 3 wpisy
        if (entries.length > 3) {
          const seeAllButton = document.getElementById('see-all-button');
          seeAllButton.style.display = 'block';
          seeAllButton.addEventListener('click', function() {
            t.modal({
              title: 'Historia czasu',
              url: './time-history.html',
              height: 500
            });
          });
        }
      }
      
      // Dopasowanie wysokości iframe
      t.sizeTo('#time-entries-list').done();
    });
});