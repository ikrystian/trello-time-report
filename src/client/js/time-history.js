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

// Function to delete a time entry
function deleteTimeEntry(entries, entryIndex) {
    entries.splice(entryIndex, 1);
    return t.set('card', 'shared', TIME_ENTRIES_KEY, entries);
}

// Funkcja inicjalizująca widok historii
document.addEventListener('DOMContentLoaded', function() {
    // Pobranie danych z karty
    Promise.all([
        t.get('card', 'shared', TIME_ENTRIES_KEY),
        t.get('card', 'shared', ESTIMATED_TIME_KEY),
        t.card('name'),
        t.member('id', 'fullName')
    ])
        .then(function([timeEntries, estimatedTime, card, member]) {
            const entries = timeEntries || [];
            const cardName = card.name;
            const currentMemberId = member.id;

            // Wyświetlenie szacunkowego czasu
            const estimatedTimeDisplay = document.getElementById('estimated-time-display');
            if (estimatedTime) {
                estimatedTimeDisplay.textContent = `${formatTime(estimatedTime)}`;

                // Dodanie przycisku do edycji szacowanego czasu
                const editEstimateButton = document.createElement('button');
                editEstimateButton.textContent = 'Edytuj';
                editEstimateButton.className = 'edit-estimate-button';
                editEstimateButton.addEventListener('click', function() {
                    t.modal({
                        title: 'Szacowany czas wykonania',
                        url: './estimated-time-form.html',
                        height: 200
                    });
                });

                estimatedTimeDisplay.appendChild(document.createTextNode(' '));
                estimatedTimeDisplay.appendChild(editEstimateButton);
            } else {
                estimatedTimeDisplay.textContent = 'Nie określono';

                // Dodanie przycisku do dodania szacowanego czasu
                const addEstimateButton = document.createElement('button');
                addEstimateButton.textContent = 'Dodaj';
                addEstimateButton.className = 'add-estimate-button';
                addEstimateButton.addEventListener('click', function() {
                    t.modal({
                        title: 'Szacowany czas wykonania',
                        url: './estimated-time-form.html',
                        height: 200
                    });
                });

                estimatedTimeDisplay.appendChild(document.createTextNode(' '));
                estimatedTimeDisplay.appendChild(addEstimateButton);
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

                const entriesHtml = entries.map((entry, index) => {
                    const username = entry.username || 'Nieznany użytkownik';
                    const isCurrentUser = entry.memberId === currentMemberId;
                    const deleteButton = isCurrentUser ? 
                        `<button class="delete-entry-button" data-entry-index="${index}">Usuń</button>` : '';
                    
                    return `
                        <div class="time-entry">
                            <p><strong>Data:</strong> ${formatDate(entry.date)}</p>
                            <p><strong>Czas:</strong> ${formatTime(entry.hours * 60 + entry.minutes)}</p>
                            <p><strong>Użytkownik:</strong> ${username}</p>
                            <p><strong>Opis:</strong> ${entry.description || 'Brak opisu'}</p>
                            ${deleteButton}
                            <hr>
                        </div>
                    `;
                }).join('');

                entriesList.innerHTML = entriesHtml;

                // Add event listeners to delete buttons
                document.querySelectorAll('.delete-entry-button').forEach(button => {
                    button.addEventListener('click', function() {
                        if (confirm('Czy na pewno chcesz usunąć ten wpis czasu?')) {
                            const entryIndex = parseInt(this.getAttribute('data-entry-index'), 10);
                            deleteTimeEntry(entries, entryIndex)
                                .then(() => {
                                    // Refresh the page to show updated entries
                                    window.location.reload();
                                })
                                .catch(error => {
                                    console.error('Error deleting time entry:', error);
                                    alert('Wystąpił błąd podczas usuwania wpisu.');
                                });
                        }
                    });
                });
            }

            // Eksport do CSV
            document.getElementById('export-button').addEventListener('click', function() {
                // Utworzenie zawartości CSV
                const csvContent = [
                    ['Nazwa zadania', 'Data', 'Godziny', 'Minuty', 'Czas łącznie', 'Użytkownik', 'Opis', 'Szacunkowy czas'],
                    ...entries.map(entry => [
                        cardName,
                        formatDate(entry.date),
                        entry.hours,
                        entry.minutes,
                        formatTime(entry.hours * 60 + entry.minutes),
                        entry.username || 'Nieznany użytkownik',
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