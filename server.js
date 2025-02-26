var cors = require('cors');
const express = require('express');
const app = express();
const port = 3000;

// Ustawienie folderu publicznego, jeśli masz statyczne pliki
app.use(cors({ origin: 'https://trello.com' }));
app.use(express.static('public'));

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Serwer działa na http://localhost:${port}`);
});