/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();

document.addEventListener('DOMContentLoaded', function() {
  // Obsługa przycisku zamknięcia
  document.getElementById('close-button').addEventListener('click', function() {
    t.closeModal();
  });
});