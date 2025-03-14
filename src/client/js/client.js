/* global TrelloPowerUp */

// Inicjalizacja Power-Up
var Promise = TrelloPowerUp.Promise;

// Kluczowe identyfikatory do przechowywania danych - definiujemy jako zmienne globalne
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

// Funkcja do obliczania łącznego czasu dla listy
function calculateListTotalTime(t, listId) {
    return Promise.all([
        t.cards('id', 'name', 'idList'),
        t.lists('id', 'name')
    ])
    .then(function([cards, lists]) {
        // Filtrowanie kart dla danej listy
        const listCards = cards.filter(card => card.idList === listId);
        
        // Pobranie danych o czasie dla wszystkich kart w liście
        const cardPromises = listCards.map(card => {
            return t.get(card.id, 'shared', TIME_ENTRIES_KEY)
                .then(timeEntries => {
                    return {
                        card: card,
                        timeEntries: timeEntries || [],
                        totalMinutes: calculateTotalTime(timeEntries || [])
                    };
                });
        });

        return Promise.all(cardPromises);
    })
    .then(function(cardsWithTime) {
        // Obliczenie łącznego czasu dla listy
        let listTotalMinutes = 0;
        cardsWithTime.forEach(cardData => {
            listTotalMinutes += cardData.totalMinutes;
        });

        return listTotalMinutes;
    });
}

// Funkcja do obliczania łącznego szacowanego czasu dla listy
function calculateListEstimatedTime(t, listId) {
    return Promise.all([
        t.cards('id', 'name', 'idList')
    ])
    .then(function([cards]) {
        // Filtrowanie kart dla danej listy
        const listCards = cards.filter(card => card.idList === listId);
        
        // Pobranie danych o szacowanym czasie dla wszystkich kart w liście
        const cardPromises = listCards.map(card => {
            return t.get(card.id, 'shared', ESTIMATED_TIME_KEY)
                .then(estimatedTime => {
                    return {
                        card: card,
                        estimatedTime: estimatedTime || 0
                    };
                });
        });

        return Promise.all(cardPromises);
    })
    .then(function(cardsWithEstimatedTime) {
        // Obliczenie łącznego szacowanego czasu dla listy
        let listEstimatedMinutes = 0;
        cardsWithEstimatedTime.forEach(cardData => {
            listEstimatedMinutes += cardData.estimatedTime;
        });

        return listEstimatedMinutes;
    });
}

// Główna logika Power-Up
TrelloPowerUp.initialize({
    // Nagłówek listy
    'list-header': function(t) {
        return {
            title: 'Podsumowanie czasu',
            icon: 'https://img.icons8.com/ios-filled/50/000000/clock--v1.png',
            url: './list-header.html',
            height: 30
        };
    },
    
    // Przyciski na listach
    'list-actions': function(t) {
        return t.list('id')
            .then(function(list) {
                return Promise.all([
                    calculateListTotalTime(t, list.id),
                    calculateListEstimatedTime(t, list.id)
                ])
                .then(function([totalMinutes, estimatedMinutes]) {
                    return [{
                        text: `Czas listy: ${formatTime(totalMinutes)}`,
                        callback: function(t) {
                            return t.modal({
                                title: 'Podsumowanie czasu dla listy',
                                url: './list-summary.html',
                                height: 500
                            });
                        }
                    },
                    {
                        text: `Szacowany czas: ${formatTime(estimatedMinutes)}`,
                        callback: function(t) {
                            return t.modal({
                                title: 'Podsumowanie czasu dla listy',
                                url: './list-summary.html',
                                height: 500
                            });
                        }
                    }];
                });
            });
    },
    
    // Przyciski na tablicy
    'board-buttons': function (t) {
        return [{
            icon: {
                dark: 'https://img.icons8.com/ios-filled/50/000000/clock--v1.png',
                light: 'https://img.icons8.com/ios-filled/50/ffffff/clock--v1.png'
            },
            text: 'Raporty czasu',
            callback: function (t) {
                return t.modal({
                    title: 'Raporty czasu dla całej tablicy',
                    url: './time-report.html',
                    height: 500
                });
            }
        }];
    },
    // Dodanie znacznika czasu na karty
    'card-badges': function (t) {
        return Promise.all([
            t.get('card', 'shared', TIME_ENTRIES_KEY),
            t.get('card', 'shared', ESTIMATED_TIME_KEY)
        ])
            .then(function ([timeEntries, estimatedTime]) {
                const badges = [];

                // Badge dla zaraportowanego czasu
                if (timeEntries && timeEntries.length) {
                    const totalMinutes = calculateTotalTime(timeEntries);
                    badges.push({
                        text: `Czas: ${formatTime(totalMinutes)}`,
                        color: 'blue'
                    });
                }

                // Badge dla szacowanego czasu
                if (estimatedTime) {
                    badges.push({
                        text: `Szacowany: ${formatTime(estimatedTime)}`,
                        color: 'green'
                    });
                }

                return badges;
            });
    },
    // Szczegółowe informacje o czasie na kartach
    'card-detail-badges': function (t) {
        return Promise.all([
            t.get('card', 'shared', TIME_ENTRIES_KEY),
            t.get('card', 'shared', ESTIMATED_TIME_KEY)
        ])
            .then(function ([timeEntries, estimatedTime]) {
                const badges = [];

                // Badge dla zaraportowanego czasu
                if (timeEntries && timeEntries.length) {
                    const totalMinutes = calculateTotalTime(timeEntries);
                    badges.push({
                        title: 'Czas spędzony',
                        text: formatTime(totalMinutes),
                        color: 'blue',
                        callback: function (t) {
                            return t.modal({
                                title: 'Historia czasu',
                                url: './time-history.html',
                                height: 500
                            });
                        }
                    });
                }

                // Badge dla szacowanego czasu
                if (estimatedTime) {
                    badges.push({
                        title: 'Szacowany czas',
                        text: formatTime(estimatedTime),
                        color: 'green',
                        callback: function (t) {
                            return t.modal({
                                title: 'Szacowany czas',
                                url: './estimated-time-form.html',
                                height: 200
                            });
                        }
                    });
                }

                return badges;
            });
    },
    // Przyciski dostępne w menu karty
    'card-buttons': function (t) {
        return [
            {
                icon: 'https://img.icons8.com/ios-filled/50/000000/clock--v1.png',
                text: 'Raportuj czas',
                callback: function (t) {
                    return t.modal({
                        title: 'Raportowanie czasu',
                        url: './time-entry-form.html',
                        height: 400
                    });
                }
            },
            {
                icon: 'https://img.icons8.com/ios-filled/50/000000/estimate.png',
                text: 'Ustaw szacowany czas',
                callback: function (t) {
                    return t.modal({
                        title: 'Szacowany czas wykonania',
                        url: './estimated-time-form.html',
                        height: 200
                    });
                }
            }
        ];
    },
    // Sekcja po opisie karty
    'card-back-section': function (t) {
        return t.get('card', 'shared', TIME_ENTRIES_KEY)
            .then(function (timeEntries) {
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
    'show-settings': function (t) {
        return t.modal({
            title: 'Ustawienia raportowania czasu',
            url: './settings.html',
            height: 400
        });
    }
}, {
    appKey: '88df51e8c59291881f573b738be03d43',
    appName: 'Time Tracker Power-Up'
});
