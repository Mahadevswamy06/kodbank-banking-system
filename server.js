const express = require('express');
const path = require('express').static;
const app = express();
const port = 8080;

app.use(express.json());
app.use(express.static('src/main/resources/static'));

// Mock DB
let users = [];

// Auth Routes
app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).send('Username already exists');
    }
    users.push({ ...req.body, balance: 100000 });
    res.send('Registered');
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ token: 'mock-jwt-token', message: 'Logged in' });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.get('/api/dashboard/userinfo', (req, res) => {
    // Return the first user or a demo user if empty
    const user = users.length > 0 ? users[0] : { username: 'KodMember', balance: 100000 };
    res.json(user);
});

app.get('/api/dashboard/balance', (req, res) => {
    const user = users.length > 0 ? users[0] : { username: 'KodMember', balance: 100000 };
    res.json({ username: user.username, balance: user.balance });
});

app.listen(port, () => {
    console.log(`Kodbank Backend running at http://localhost:${port}`);
});
