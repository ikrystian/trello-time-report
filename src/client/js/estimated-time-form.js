/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
const ESTIMATED_TIME_KEY = 'estimatedTime';

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

// Funkcja inicjalizująca formularz
document.addEventListener('DOMContentLoaded', function() {
  const estimatedTimeInput = document.getElementById('estimated-time');
  const timeDisplay = document.getElementById('time-display');

  // Aktualizacja wyświetlanego czasu przy zmianie wartości
  estimatedTimeInput.addEventListener('input', function() {
    const minutes = parseInt(estimatedTimeInput.value, 10) || 0;
    timeDisplay.textContent = minutes > 0 ? `Wyświetlane jako: ${formatTime(minutes)}` : '';
  });

  // Pobranie i wyświetlenie bieżącej wartości szacowanego czasu
  t.get('card', 'shared', ESTIMATED_TIME_KEY)
    .then(function(estimatedTime) {
      if (estimatedTime) {
        estimatedTimeInput.value = estimatedTime;
        estimatedTimeInput.dispatchEvent(new Event('input')); // Aktualizacja czasu wyświetlanego
      }
    });

  // Obsługa przycisku anulowania
  document.getElementById('cancel-button').addEventListener('click', function() {
    t.closeModal();
  });

  // Obsługa formularza zapisu szacowanego czasu
  document.getElementById('estimated-time-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const estimatedTime = parseInt(estimatedTimeInput.value, 10) || 0;

    // Zapisanie szacunkowego czasu
    t.set('card', 'shared', ESTIMATED_TIME_KEY, estimatedTime)
      .then(function() {
        console.log('Szacunkowy czas został zapisany.');
        t.closeModal();
      });
  });
});