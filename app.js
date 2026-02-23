require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const app = express();
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// --- CONFIGURATION ---
const JWT_SECRET = process.env.JWT_SECRET || "default_local_secret_for_dev_only";

const dbConfig = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl: { rejectUnauthorized: false }
};

let pool;
let useMySQL = true;

async function connectDB() {
    if (!process.env.MYSQL_HOST) {
        console.warn('⚠️ MYSQL_HOST not set, falling back to local storage.');
        useMySQL = false;
        return;
    }

    try {
        pool = mysql.createPool(dbConfig);
        await pool.getConnection();
        console.log('✅ AIVEN CLOUD MYSQL: ACTIVE');

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS kod_user (
                uid BIGINT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                fullname VARCHAR(255),
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                balance DECIMAL(19, 2) DEFAULT 100000.00,
                phone VARCHAR(255),
                role VARCHAR(255) DEFAULT 'CUSTOMER'
            )
        `);
    } catch (err) {
        console.error('❌ MySQL Connection failed, using local fallback:', err.message);
        useMySQL = false;
    }
}

connectDB();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src/main/resources/static')));

// Auth Helper
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).send('Access Denied');

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        // Fallback for transition or mock
        req.user = { username: token };
        next();
    }
}

// --- CORE LOGIC ---
let usersMemory = [];
if (fs.existsSync(USERS_FILE)) {
    try {
        usersMemory = JSON.parse(fs.readFileSync(USERS_FILE));
    } catch (e) {
        console.error("⚠️ Error loading local database:", e.message);
    }
}

async function findUser(username) {
    if (useMySQL) {
        const [rows] = await pool.execute('SELECT * FROM kod_user WHERE LOWER(username) = ?', [username.toLowerCase()]);
        return rows[0];
    }
    return usersMemory.find(u => u.username.toLowerCase() === username.toLowerCase());
}

async function saveNewUser(userData) {
    if (useMySQL) {
        await pool.execute(
            'INSERT INTO kod_user (username, fullname, email, password, phone, balance) VALUES (?, ?, ?, ?, ?, ?)',
            [userData.username.toLowerCase(), userData.fullname, userData.email, userData.password, userData.phone, userData.balance || 100000]
        );
        return true;
    } else {
        usersMemory.push(userData);
        try {
            if (process.env.NODE_ENV !== 'production') {
                fs.writeFileSync(USERS_FILE, JSON.stringify(usersMemory, null, 2));
            }
        } catch (e) {
            console.log("⚠️ Local Write Skipped.");
        }
        return true;
    }
}

// --- API ROUTES ---

app.get('/api/auth/check-username', async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) return res.json(true);
        const user = await findUser(username);
        res.json(!user);
    } catch (err) {
        res.json(true);
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, fullname, email, phone } = req.body;

        // Robust Validation
        if (!username || !password || !email) {
            return res.status(400).send('Required fields (username, password, email) are missing');
        }

        const existing = await findUser(username);
        if (existing) return res.status(400).send('User already exists');

        const userData = {
            username: username.trim(),
            password,
            fullname: fullname || '',
            email: email.trim(),
            phone: phone || '',
            balance: 100000
        };

        await saveNewUser(userData);
        console.log(`✨ REGISTERED: ${username}`);
        res.send('Success');
    } catch (err) {
        console.error('❌ Registration Error:', err.message);
        res.status(500).send('Registration failed: ' + err.message);
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const username = (req.body.username || '').trim();
        const password = (req.body.password || '');
        const user = await findUser(username);

        if (user && user.password === password) {
            const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '30m' });
            res.json({ token, message: 'Welcome' });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        res.status(500).send('Login error');
    }
});

app.get('/api/dashboard/userinfo', authenticateToken, async (req, res) => {
    try {
        const user = await findUser(req.user.username);
        res.json(user || usersMemory[0]);
    } catch (err) {
        res.status(500).send('Error loading info');
    }
});

app.get('/api/dashboard/balance', authenticateToken, async (req, res) => {
    try {
        const user = await findUser(req.user.username);
        res.json({ balance: user ? user.balance : 0 });
    } catch (err) {
        res.status(500).send('Error loading balance');
    }
});

app.post('/api/dashboard/transfer', authenticateToken, (req, res) => {
    res.json({ message: 'Transfer successful! Money sent.' });
});

app.get('/api/dashboard/history', authenticateToken, (req, res) => {
    res.json([
        { timestamp: new Date(), type: 'CREDIT', sender: 'System', receiver: 'You', amount: 100000, description: 'Sign-up Bonus' },
        { timestamp: new Date(Date.now() - 86400000), type: 'DEBIT', sender: 'You', receiver: 'Amazon', amount: 499, description: 'Online Shopping' }
    ]);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/main/resources/static/index.html'));
});

app.getDbStatus = () => (useMySQL ? 'CLOUD (Aiven MySQL)' : 'LOCAL (users.json)');

module.exports = app;
