const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

const PROXY_MAP = {
    '/api/game/': 'https://cekid.democishop.my.id',
    '/cekbank': 'https://ytdlpyton.nvlgroup.my.id',
    '/api/download/': 'https://anabot.my.id',
    '/api/tools/': 'https://anabot.my.id'
};

app.get('/api/list-game-ids', async (req, res) => {
    try {
        const apiResponse = await fetch('https://cekid.democishop.my.id/api');
        const data = await apiResponse.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch API list.' });
    }
});

app.get(['/api/game/*', '/cekbank', '/api/download/*', '/api/tools/*'], async (req, res) => {
    const path = req.originalUrl;
    let targetDomain = '';
    
    for (const prefix in PROXY_MAP) {
        if (path.startsWith(prefix)) {
            targetDomain = PROXY_MAP[prefix];
            break;
        }
    }

    if (!targetDomain) {
        return res.status(404).json({ error: 'Proxy route not found' });
    }
    
    const targetUrl = targetDomain + path;

    try {
        const apiResponse = await fetch(targetUrl, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'OdzreShop-API-Tester/1.0' }
        });
        const data = await apiResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'Failed to proxy the request.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
