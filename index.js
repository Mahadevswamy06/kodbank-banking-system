const app = require('./app');
const port = process.env.PORT || 9090;

// --- SERVER START ---
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, '0.0.0.0', () => {
        console.log(`\n================================================`);
        console.log(`🏦 KODBANK FINAL VERSION READY!`);
        console.log(`================================================`);
        console.log(`📍 Localhost:  http://localhost:${port}`);
        console.log(`🌍 Multi-device: Use your local IP on port ${port}`);
        console.log(`📦 Database:    ${app.getDbStatus()}`);
        console.log(`================================================\n`);
    });
}

module.exports = app;
