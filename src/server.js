const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware configuration
app.use(cors({
    origin: ['http://localhost:3000', 'https://trello.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to serve static files from the client directory
app.use(express.static(path.join(__dirname, 'client')));

// Basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});