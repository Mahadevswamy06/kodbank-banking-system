require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 9090;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI && MONGODB_URI.includes('<username>')) {
    console.error('⚠️ ACTION REQUIRED: Update your .env file with your real MongoDB URI!');
}

mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/kodbank')
    .then(() => console.log('✅ Connected to MongoDB Cloud Database'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// User Schema
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

app.use(cors());
app.use(express.json());

// Serve static files from the static directory
app.use(express.static(path.join(__dirname, 'src/main/resources/static')));

// Auth Routes
app.get('/api/auth/check-username', async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) return res.json(true);
        const user = await User.findOne({ username: username.toLowerCase().trim() });
        res.json(!user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, fullname, email, phone } = req.body;

        if (!username || !password) {
            return res.status(400).send('Username and Password are required');
        }

        const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).send('User ID already exists!');
        }

        const newUser = new User({
            username,
            password,
            fullname,
            email,
            phone,
            balance: 100000
        });

        await newUser.save();
        console.log(`✨ REGISTERED & SAVED TO CLOUD: "${username}"`);
        res.send('Registered Successfully! Your data is now safe in the cloud.');
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).send('Error saving user');
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const username = (req.body.username || '').trim().toLowerCase();
        const password = (req.body.password || '');

        const user = await User.findOne({ username });

        if (user) {
            if (user.password === password) {
                console.log(`✅ CLOUD LOGIN SUCCESS: ${username}`);
                res.json({ token: user.username, message: 'Logged in successfully' });
            } else {
                res.status(401).send('Invalid password');
            }
        } else {
            res.status(401).send('User ID does not exist');
        }
    } catch (err) {
        res.status(500).send('Login Error');
    }
});

app.get('/api/dashboard/userinfo', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        const user = await User.findOne({ username: token });
        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        res.status(500).send('Error fetching info');
    }
});

app.get('/api/dashboard/balance', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        const user = await User.findOne({ username: token });
        if (user) {
            res.json({ username: user.username, balance: user.balance });
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        res.status(500).send('Error fetching balance');
    }
});

app.post('/api/dashboard/transfer', (req, res) => {
    res.send('Transfer successful');
});

app.get('/api/dashboard/history', (req, res) => {
    res.json([
        { timestamp: new Date(), type: 'CREDIT', sender: 'System', receiver: 'You', amount: 100000, description: 'Welcome Bonus' }
    ]);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/main/resources/static/index.html'));
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Kodbank CLOUD Server is LIVE!`);
    });
}

module.exports = app;
