const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const { captureScreenshot } = require('./controllers/screenshot');
const { cleanScrape } = require('./controllers/scrape');

app.post('/screenshot', async (req, res) => {
    try {
        await captureScreenshot(req, res);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/scrape', async (req, res) => {
    try {
        await cleanScrape(req, res);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, () => {
    console.log(`Puppeteer Service running on port ${PORT}`);
});
