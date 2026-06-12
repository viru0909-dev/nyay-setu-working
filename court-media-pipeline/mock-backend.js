const http = require('http');

const PORT = 5000;

const server = http.createServer((req, res) => {
    // Check if the worker is hitting our media webhook endpoint
    if (req.method === 'POST' && req.url === '/api/media/webhook') {
        let body = '';

        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const data = JSON.parse(body);
            
            console.log(`\n🔔 [Main Backend Notification Received!]`);
            console.log(`----------------------------------------`);
            console.log(`📋 Case ID:      ${data.caseId}`);
            console.log(`⚡ New Status:   \x1b[32m${data.status}\x1b[0m`);
            console.log(`💾 File Path:   ${data.storagePath}`);
            console.log(`⏰ Timestamp:   ${data.updatedAt}`);
            console.log(`----------------------------------------`);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'State synchronization successful. Case database updated!' }));
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`🌐 Mock Main Application Tier running on http://localhost:${PORT}`);
    console.log(`📡 Awaiting pipeline webhook status updates...`);
});
