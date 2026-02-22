const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Serve static files from the static directory
app.use(express.static(path.join(__dirname, 'src/main/resources/static')));

// Mock DB (Note: This will reset on every serverless function cold start)
let users = [];

// Auth Routes
app.get('/api/auth/check-username', (req, res) => {
    const { username } = req.query;
    const exists = users.find(u => u.username === username);
    res.json(!exists);
});

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
    const user = users.length > 0 ? users[0] : { username: 'KodMember', balance: 100000, fullname: 'Kod Member', email: 'member@kodbank.com' };
    res.json(user);
});

app.get('/api/dashboard/balance', (req, res) => {
    const user = users.length > 0 ? users[0] : { username: 'KodMember', balance: 100000 };
    res.json({ username: user.username, balance: user.balance });
});

app.post('/api/dashboard/transfer', (req, res) => {
    const { receiverUsername, amount } = req.body;
    // Mock transfer logic
    res.send('Transfer successful');
});

app.get('/api/dashboard/history', (req, res) => {
    // Mock history
    res.json([
        { timestamp: new Date(), type: 'CREDIT', sender: 'System', receiver: 'You', amount: 100000, description: 'Welcome Bonus' }
    ]);
});

// Fallback to index.html for any unknown routes (for SPA behavior if needed)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/main/resources/static/index.html'));
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Kodbank Backend running at http://localhost:${port}`);
    });
}

module.exports = app;
