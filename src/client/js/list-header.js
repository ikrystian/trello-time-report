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

// Funkcja do obliczania łącznego czasu
function calculateTotalTime(timeEntries) {
    if (!timeEntries || !timeEntries.length) return 0;

    return timeEntries.reduce((total, entry) => {
        return total + (entry.hours * 60 + entry.minutes);
    }, 0);
}

// Funkcja inicjalizująca nagłówek listy
document.addEventListener('DOMContentLoaded', function() {
    // Pobranie ID listy
    t.list('id')
        .then(function(list) {
            // Pobranie wszystkich kart z listy
            return Promise.all([
                t.cards('id', 'name', 'idList'),
                list
            ]);
        })
        .then(function([cards, list]) {
            // Filtrowanie kart dla danej listy
            const listCards = cards.filter(card => card.idList === list.id);
            
            // Pobranie danych o czasie dla wszystkich kart w liście
            const timePromises = listCards.map(card => {
                return t.get(card.id, 'shared', TIME_ENTRIES_KEY)
                    .then(timeEntries => {
                        return {
                            card: card,
                            timeEntries: timeEntries || [],
                            totalMinutes: calculateTotalTime(timeEntries || [])
                        };
                    });
            });

            // Pobranie danych o szacowanym czasie dla wszystkich kart w liście
            const estimatedPromises = listCards.map(card => {
                return t.get(card.id, 'shared', ESTIMATED_TIME_KEY)
                    .then(estimatedTime => {
                        return {
                            card: card,
                            estimatedTime: estimatedTime || 0
                        };
                    });
            });

            return Promise.all([
                Promise.all(timePromises),
                Promise.all(estimatedPromises)
            ]);
        })
        .then(function([cardsWithTime, cardsWithEstimatedTime]) {
            // Obliczenie łącznego czasu dla listy
            let listTotalMinutes = 0;
            cardsWithTime.forEach(cardData => {
                listTotalMinutes += cardData.totalMinutes;
            });

            // Obliczenie łącznego szacowanego czasu dla listy
            let listEstimatedMinutes = 0;
            cardsWithEstimatedTime.forEach(cardData => {
                listEstimatedMinutes += cardData.estimatedTime;
            });

            // Wyświetlenie łącznego czasu
            document.getElementById('list-time').textContent = `Łączny czas: ${formatTime(listTotalMinutes)}`;
            
            // Wyświetlenie szacowanego czasu
            document.getElementById('estimated-time').textContent = `Szacowany czas: ${formatTime(listEstimatedMinutes)}`;
            
            // Dodanie obsługi kliknięcia, aby otworzyć modal z szczegółami
            document.getElementById('list-time').addEventListener('click', function() {
                t.modal({
                    title: 'Podsumowanie czasu dla listy',
                    url: './list-summary.html',
                    height: 500
                });
            });

            document.getElementById('estimated-time').addEventListener('click', function() {
                t.modal({
                    title: 'Podsumowanie czasu dla listy',
                    url: './list-summary.html',
                    height: 500
                });
            });

            // Dopasowanie wysokości iframe
            t.sizeTo('#container').done();
        });
});
