const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 9090;
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// --- SHARED CLOUD DATABASE CONFIG ---
// This allows your Phone and Laptop to share the same user data instantly
const MONGODB_URI = "mongodb+srv://kodbank_shared:BankPassword123@cluster0.pjtzy.mongodb.net/kodbank?retryWrites=true&w=majority";
let useMongoDB = true; // Changed to 'let' to allow fallback reassignment

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ UNIVERSAL CLOUD SYNC: ACTIVE'))
    .catch(err => {
        console.error('❌ Cloud Sync failed, using local fallback:', err.message);
        useMongoDB = false;
    });

// User Schema (Only used if MongoDB is connected)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    fullname: String,
    email: String,
    phone: String,
    balance: { type: Number, default: 100000 },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src/main/resources/static')));

// --- AUTH LOGIC (DUAL-MODE) ---

async function findUser(username) {
    if (useMongoDB) return await User.findOne({ username: username.toLowerCase() });
    return usersMemory.find(u => u.username.toLowerCase() === username.toLowerCase());
}

async function saveNewUser(userData) {
    if (useMongoDB) {
        const newUser = new User(userData);
        return await newUser.save();
    } else {
        usersMemory.push(userData);
        try {
            // Only try to write if we are NOT on Vercel (Local laptop)
            if (process.env.NODE_ENV !== 'production') {
                fs.writeFileSync(USERS_FILE, JSON.stringify(usersMemory, null, 2));
            }
        } catch (e) {
            console.log("⚠️ Cloud Write Skipped: Connect MongoDB for permanent storage on phone.");
        }
        return true;
    }
}

// --- API ROUTES ---

// 1. Check Username
app.get('/api/auth/check-username', async (req, res) => {
    const { username } = req.query;
    if (!username) return res.json(true);
    const user = await findUser(username);
    res.json(!user);
});

// 2. Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, fullname, email, phone } = req.body;
        if (!username || !password) return res.status(400).send('Required fields missing');

        const existing = await findUser(username);
        if (existing) return res.status(400).send('User already exists');

        const userData = {
            username: username.trim(),
            password,
            fullname,
            email,
            phone,
            balance: 100000,
            createdAt: new Date().toISOString()
        };

        await saveNewUser(userData);
        console.log(`✨ REGISTERED: ${username}`);
        res.send('Success');
    } catch (err) {
        res.status(500).send('Registration failed');
    }
});

// 3. Login
app.post('/api/auth/login', async (req, res) => {
    const username = (req.body.username || '').trim();
    const password = (req.body.password || '');

    console.log(`📡 Login attempt: [${username}]`);
    const user = await findUser(username);

    if (user && user.password === password) {
        console.log(`✅ SUCCESS: ${username}`);
        res.json({ token: user.username, message: 'Welcome' });
    } else {
        console.log(`❌ FAILED: ${username}`);
        res.status(401).send('Invalid credentials');
    }
});

// 4. Dashboard User Info
app.get('/api/dashboard/userinfo', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const user = await findUser(token || '');

    if (user) {
        res.json(user);
    } else {
        // Mock data for demo if user not found
        res.json(usersMemory[0]);
    }
});

// 5. Balance
app.get('/api/dashboard/balance', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const user = await findUser(token || '');
    res.json({ balance: user ? user.balance : 0 });
});

// 6. Transfer (Mock)
app.post('/api/dashboard/transfer', (req, res) => {
    res.json({ message: 'Transfer successful! Money sent.' });
});

// 7. History (Mock)
app.get('/api/dashboard/history', (req, res) => {
    res.json([
        { timestamp: new Date(), type: 'CREDIT', sender: 'System', receiver: 'You', amount: 100000, description: 'Sign-up Bonus' },
        { timestamp: new Date(Date.now() - 86400000), type: 'DEBIT', sender: 'You', receiver: 'Amazon', amount: 499, description: 'Online Shopping' }
    ]);
});

// Fallback to Home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/main/resources/static/index.html'));
});

// --- FINAL SETUP ---
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, '0.0.0.0', () => {
        console.log(`\n================================================`);
        console.log(`🏦 KODBANK FINAL VERSION READY!`);
        console.log(`================================================`);
        console.log(`📍 Localhost:  http://localhost:${port}`);
        console.log(`🌍 Multi-device: Use your local IP on port ${port}`);
        console.log(`📦 Database:    ${useMongoDB ? 'CLOUD (MongoDB Atlas)' : 'LOCAL (users.json)'}`);
        console.log(`================================================\n`);
    });
}

module.exports = app;
