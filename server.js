require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const PROXY_MAP = {
    '/api/game/': { domain: 'https://cekid.democishop.my.id' },
    '/cekbank': { domain: 'https://ytdlpyton.nvlgroup.my.id' },
    '/listbank': { domain: 'https://ytdlpyton.nvlgroup.my.id' },
    '/api/download/': { domain: 'https://anabot.my.id', apiKeyName: 'APIKEY_1' },
    '/api/tools/': { domain: 'https://anabot.my.id', apiKeyName: 'APIKEY_1' },
    '/api/games/': { domain: 'https://api.tamaaago.biz.id', apiKeyName: 'APIKEY_2' }
};

app.get('/api/list-game-ids', async (req, res) => {
    try {
        const apiResponse = await fetch('https://cekid.democishop.my.id/api');
        const data = await apiResponse.json();
        res.json({ ...data, creator: 'Odzreshop' });
    } catch (error) {
        res.status(500).json({ creator: 'Odzreshop', error: 'Failed to fetch API list.' });
    }
});

app.get(['/api/game/*', '/cekbank', '/listbank', '/api/download/*', '/api/tools/*', '/api/games/*'], async (req, res) => {
    const requestPath = req.originalUrl;
    let proxyConfig = null;
    
    for (const prefix in PROXY_MAP) {
        if (requestPath.startsWith(prefix)) {
            proxyConfig = PROXY_MAP[prefix];
            break;
        }
    }

    if (!proxyConfig) {
        return res.status(404).json({ creator: 'Odzreshop', error: 'Proxy route not found' });
    }
    
    const targetUrl = new URL(requestPath, proxyConfig.domain);

    if (proxyConfig.apiKeyName && process.env[proxyConfig.apiKeyName]) {
        targetUrl.searchParams.set('apikey', process.env[proxyConfig.apiKeyName]);
    }

    try {
        const apiResponse = await fetch(targetUrl.toString(), {
            headers: { 'Accept': 'application/json', 'User-Agent': 'OdzreShop-API-Tester/1.0' }
        });
        const data = await apiResponse.json();
        const modifiedData = { ...data, creator: 'Odzreshop' };
        res.json(modifiedData);
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ creator: 'Odzreshop', error: 'Failed to proxy the request.' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
