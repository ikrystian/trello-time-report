/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();
const ESTIMATED_TIME_KEY = 'estimatedTime';

// Funkcja inicjalizująca formularz
document.addEventListener('DOMContentLoaded', function() {
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');

    // Pobranie i wyświetlenie bieżącej wartości szacowanego czasu
    t.get('card', 'shared', ESTIMATED_TIME_KEY)
        .then(function(estimatedTime) {
            if (estimatedTime) {
                const hours = Math.floor(estimatedTime / 60);
                const minutes = estimatedTime % 60;

                hoursInput.value = hours;
                // Znajdujemy najbliższą dostępną opcję dla minut (0, 15, 30, 45)
                const minuteOptions = [0, 30];
                const closestMinuteOption = minuteOptions.reduce((prev, curr) => {
                    return (Math.abs(curr - minutes) < Math.abs(prev - minutes) ? curr : prev);
                });
                minutesInput.value = closestMinuteOption;
            }
        });

    // Obsługa przycisku anulowania
    document.getElementById('cancel-button').addEventListener('click', function() {
        t.closeModal();
    });

    // Obsługa formularza zapisu szacowanego czasu
    document.getElementById('time-entry-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const hours = parseInt(hoursInput.value, 10) || 0;
        const minutes = parseInt(minutesInput.value, 10) || 0;

        // Obliczenie całkowitego czasu w minutach
        const totalMinutes = (hours * 60) + minutes;

        // Zapisanie szacunkowego czasu
        t.set('card', 'shared', ESTIMATED_TIME_KEY, totalMinutes)
            .then(function() {
                console.log('Szacunkowy czas został zapisany.');
                t.closeModal();
            })
            .catch(function(error) {
                console.error('Wystąpił błąd podczas zapisywania czasu:', error);
                alert('Wystąpił błąd podczas zapisywania czasu. Spróbuj ponownie.');
            });
    });
});