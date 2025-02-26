/* global TrelloPowerUp */

// Inicjalizacja Power-Up
var Promise = TrelloPowerUp.Promise;

// Kluczowe identyfikatory do przechowywania danych
const TIME_ENTRIES_KEY = 'timeEntries';
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

// Funkcja do formatowania daty
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL');
}

// Funkcja do obliczania łącznego czasu dla karty
function calculateTotalTime(timeEntries) {
  if (!timeEntries || !timeEntries.length) return 0;
  
  return timeEntries.reduce((total, entry) => {
    return total + (entry.hours * 60 + entry.minutes);
  }, 0);
}

// Główna logika Power-Up
TrelloPowerUp.initialize({
  // Przyciski na tablicy
  'board-buttons': function(t) {
    return [{
      icon: {
        dark: 'https://img.icons8.com/ios-filled/50/000000/clock--v1.png',
        light: 'https://img.icons8.com/ios-filled/50/ffffff/clock--v1.png'
      },
      text: 'Raporty czasu',
      callback: function(t) {
        return t.modal({
          title: 'Raporty czasu dla całej tablicy',
          url: './time-report.html',
          height: 500
        });
      }
    }];
  },
  // Dodanie znacznika czasu na karty
  'card-badges': function(t) {
    return t.get('card', 'shared', TIME_ENTRIES_KEY)
      .then(function(timeEntries) {
        if (!timeEntries || !timeEntries.length) return [];
        
        const totalMinutes = calculateTotalTime(timeEntries);
        
        return [{
          text: `Czas: ${formatTime(totalMinutes)}`,
          color: 'blue'
        }];
      });
  },
  // Szczegółowe informacje o czasie na kartach
  'card-detail-badges': function(t) {
    return t.get('card', 'shared', TIME_ENTRIES_KEY)
      .then(function(timeEntries) {
        if (!timeEntries || !timeEntries.length) return [];
        
        const totalMinutes = calculateTotalTime(timeEntries);
        
        return [{
          title: 'Czas spędzony',
          text: formatTime(totalMinutes),
          color: 'blue',
          callback: function(t) {
            return t.modal({
              title: 'Historia czasu',
              url: './time-history.html',
              height: 500
            });
          }
        }];
      });
  },
  // Przyciski dostępne w menu karty
  'card-buttons': function(t) {
    return [{
      icon: 'https://img.icons8.com/ios-filled/50/000000/clock--v1.png',
      text: 'Raportuj czas',
      callback: function(t) {
        return t.modal({
          title: 'Raportowanie czasu',
          url: './time-entry-form.html',
          height: 400
        });
      }
    }];
  },
  // Sekcja po opisie karty
  'card-back-section': function(t) {
    return t.get('card', 'shared', TIME_ENTRIES_KEY)
      .then(function(timeEntries) {
        if (!timeEntries || !timeEntries.length) {
          return {
            title: 'Raportowanie czasu',
            icon: 'https://img.icons8.com/ios-filled/50/000000/clock--v1.png',
            content: {
              type: 'iframe',
              url: t.signUrl('./empty-time-list.html'),
              height: 80
            }
          };
        }
        
        return {
          title: 'Raportowanie czasu',
          icon: 'https://img.icons8.com/ios-filled/50/000000/clock--v1.png',
          content: {
            type: 'iframe',
            url: t.signUrl('./time-list.html'),
            height: timeEntries.length <= 3 ? 50 + timeEntries.length * 60 : 250
          }
        };
      });
  },
  // Rejestracja innych możliwości Power-Up
  'show-settings': function(t) {
    return t.modal({
      title: 'Ustawienia raportowania czasu',
      url: './settings.html',
      height: 400
    });
  }
}, {
  appKey: 'your-app-key',
  appName: 'Time Tracker Power-Up'
});