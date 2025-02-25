/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
const TIME_ENTRIES_KEY = 'timeEntries';
const ESTIMATED_TIME_KEY = 'estimatedTime';

// Funkcja inicjalizująca formularz
document.addEventListener('DOMContentLoaded', function() {
  // Sprawdzamy, czy istnieje już szacunkowy czas
  t.get('card', 'shared', ESTIMATED_TIME_KEY)
    .then(function(estimatedTime) {
      if (estimatedTime) {
        document.getElementById('estimated-time').value = estimatedTime;
      }
    });
  
  // Obsługa przycisku anulowania
  document.getElementById('cancel-button').addEventListener('click', function() {
    t.closeModal();
  });
  
  // Obsługa formularza zapisu czasu
  document.getElementById('time-entry-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const hours = parseInt(document.getElementById('hours').value, 10) || 0;
    const minutes = parseInt(document.getElementById('minutes').value, 10) || 0;
    const description = document.getElementById('description').value;
    const estimatedTime = parseInt(document.getElementById('estimated-time').value, 10) || 0;
    
    // Sprawdzenie, czy wprowadzono jakiś czas
    if (hours === 0 && minutes === 0) {
      alert('Proszę wprowadzić czas większy niż 0.');
      return;
    }
    
    // Pobranie istniejących wpisów czasu
    t.get('card', 'shared', TIME_ENTRIES_KEY)
      .then(function(timeEntries) {
        const currentEntries = timeEntries || [];
        
        // Dodanie nowego wpisu
        const newEntry = {
          date: new Date().toISOString(),
          hours: hours,
          minutes: minutes,
          description: description
        };
        
        currentEntries.push(newEntry);
        
        // Zapisanie zaktualizowanych wpisów
        return t.set('card', 'shared', TIME_ENTRIES_KEY, currentEntries);
      })
      .then(function() {
        // Zapisanie szacunkowego czasu
        return t.set('card', 'shared', ESTIMATED_TIME_KEY, estimatedTime);
      })
      .then(function() {
        t.closeModal();
      });
  });
});