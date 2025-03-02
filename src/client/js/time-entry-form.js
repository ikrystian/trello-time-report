/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
const TIME_ENTRIES_KEY = 'timeEntries';

// Funkcja inicjalizująca formularz
document.addEventListener('DOMContentLoaded', function() {
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

        // Sprawdzenie, czy wprowadzono jakiś czas
        if (hours === 0 && minutes === 0) {
            alert('Proszę wprowadzić czas większy niż 0.');
            return;
        }

        // Pobranie danych zalogowanego użytkownika
        Promise.all([
            t.member('id', 'fullName'),
            t.get('card', 'shared', TIME_ENTRIES_KEY)
        ])
            .then(function([member, timeEntries]) {
                const currentEntries = timeEntries || [];

                // Dodanie nowego wpisu
                const newEntry = {
                    date: new Date().toISOString(),
                    hours: hours,
                    minutes: minutes,
                    description: description,
                    username: member.fullName,
                    memberId: member.id // Add member ID for entry ownership
                };

                currentEntries.push(newEntry);

                // Zapisanie zaktualizowanych wpisów
                return t.set('card', 'shared', TIME_ENTRIES_KEY, currentEntries);
            })
            .then(function() {
                t.closeModal();
            })
            .catch(function(err) {
                console.error('Wystąpił błąd podczas zapisywania czasu:', err);
                alert('Wystąpił błąd podczas zapisywania czasu. Spróbuj ponownie.');
            });
    });
});