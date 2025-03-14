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

// Funkcja inicjalizująca podsumowanie listy
document.addEventListener('DOMContentLoaded', function() {
    // Pobranie danych o liście
    t.get('list', 'name')
        .then(function(listName) {
            // Wyświetlenie nazwy listy
            document.getElementById('list-name').textContent = listName;
            
            // Pobranie wszystkich kart z listy
            return t.cards('id', 'name');
        })
        .then(function(cards) {
            // Pobranie danych o czasie i szacowanym czasie dla wszystkich kart
            const cardPromises = cards.map(card => {
                return Promise.all([
                    t.get(card.id, 'shared', TIME_ENTRIES_KEY),
                    t.get(card.id, 'shared', ESTIMATED_TIME_KEY)
                ]).then(([timeEntries, estimatedTime]) => {
                    return {
                        card: card,
                        timeEntries: timeEntries || [],
                        totalMinutes: calculateTotalTime(timeEntries || []),
                        estimatedTime: estimatedTime || 0
                    };
                });
            });

            return Promise.all(cardPromises);
        })
        .then(function(cardsWithData) {
            // Obliczenie łącznego czasu dla listy
            let listTotalMinutes = 0;
            let listEstimatedMinutes = 0;
            
            cardsWithData.forEach(cardData => {
                listTotalMinutes += cardData.totalMinutes;
                listEstimatedMinutes += cardData.estimatedTime;
            });

            // Wyświetlenie łącznego czasu
            document.getElementById('total-time').textContent = formatTime(listTotalMinutes);
            
            // Wyświetlenie łącznego szacowanego czasu
            document.getElementById('estimated-time').textContent = formatTime(listEstimatedMinutes);

            // Sortowanie kart według czasu (od największego)
            cardsWithData.sort((a, b) => b.totalMinutes - a.totalMinutes);

            // Wyświetlenie kart
            const cardsListElement = document.getElementById('cards-list');
            
            if (cardsWithData.length === 0) {
                cardsListElement.innerHTML = '<div class="no-time">Brak kart w tej liście</div>';
            } else {
                const cardsHtml = cardsWithData.map(cardData => {
                    return `
                        <div class="card-item">
                            <div class="card-name">${cardData.card.name}</div>
                            <div class="card-time">Czas: ${formatTime(cardData.totalMinutes)}</div>
                            ${cardData.estimatedTime > 0 ? `<div class="card-estimated-time">Szacowany: ${formatTime(cardData.estimatedTime)}</div>` : ''}
                        </div>
                    `;
                }).join('');

                cardsListElement.innerHTML = cardsHtml;
            }

            // Dopasowanie wysokości iframe
            t.sizeTo('#container').done();
        });

    // Obsługa przycisku zamknięcia
    document.getElementById('close-button').addEventListener('click', function() {
        t.closeModal();
    });
});
