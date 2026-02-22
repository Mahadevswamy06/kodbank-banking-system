const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 9090;
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Load users from file or use default
let users = [];
if (fs.existsSync(USERS_FILE)) {
    try {
        users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (e) {
        console.error("Error loading users:", e);
    }
}

if (users.length === 0) {
    users = [
        { username: 'admin', password: 'password123', fullname: 'Demo Admin', email: 'admin@kodbank.com', balance: 100000 }
    ];
}

function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.use(cors());
app.use(express.json());

// Serve static files from the static directory
app.use(express.static(path.join(__dirname, 'src/main/resources/static')));

// Auth Routes
app.get('/api/auth/check-username', (req, res) => {
    const { username } = req.query;
    if (!username) return res.json(true);
    // Case-insensitive check
    const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    res.json(!exists);
});

app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and Password are required');
    }

    // Check if user already exists (Case-insensitive for security)
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (existingUser) {
        console.log(`Registration blocked: ${username} already exists.`);
        return res.status(400).send('User ID already exists! Please use a different name.');
    }

    const newUser = {
        ...req.body,
        balance: 100000,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(); // Permanently save to the JSON database

    console.log(`✅ Success: New user "${username}" stored permanently.`);
    res.send('Registered Successfully! You can now login anytime.');
});

app.post('/api/auth/login', (req, res) => {
    const username = (req.body.username || '').trim();
    const password = (req.body.password || '');

    console.log(`Login attempt: [${username}]`);

    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (user) {
        if (user.password === password) {
            console.log(`✅ Login successful: ${username}`);
            res.json({ token: user.username, message: 'Logged in' });
        } else {
            console.log(`❌ Login failed: ${username} (Wrong password)`);
            res.status(401).send('Invalid credentials');
        }
    } else {
        console.log(`❌ Login failed: ${username} (User not found)`);
        res.status(401).send('Invalid credentials');
    }
});

app.get('/api/dashboard/userinfo', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extracts "username" from "Bearer username"

    const user = users.find(u => u.username === token);
    if (user) {
        res.json(user);
    } else {
        // Fallback or demo user
        res.json(users[0]);
    }
});

app.get('/api/dashboard/balance', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    const user = users.find(u => u.username === token);
    if (user) {
        res.json({ username: user.username, balance: user.balance });
    } else {
        res.json({ username: users[0].username, balance: users[0].balance });
    }
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
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Kodbank Server is LIVE on your network!`);
        console.log(`Local access: http://localhost:${port}`);
        console.log(`Multi-device: http://YOUR_LAPTOP_IP:${port}`);
    });
}

module.exports = app;
