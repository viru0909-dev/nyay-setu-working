const http = require('http');

const PORT = 5000;
const stdoutLog = (msg) => process.stdout.write(msg + '\n');

const server = http.createServer((req, res) => {
    // Check if the worker is hitting our media webhook endpoint
    if (req.method === 'POST' && req.url === '/api/media/webhook') {
        let body = '';

        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const data = JSON.parse(body);
            
            stdoutLog(`\n🔔 [Main Backend Notification Received!]`);
            stdoutLog(`----------------------------------------`);
            stdoutLog(`📋 Case ID:      ${data.caseId}`);
            stdoutLog(`⚡ New Status:   \x1b[32m${data.status}\x1b[0m`);
            stdoutLog(`💾 File Path:   ${data.storagePath}`);
            stdoutLog(`🔒 SHA-256 Hash: \x1b[36m${data.sha256Hash || 'N/A'}\x1b[0m`);
            stdoutLog(`⏰ Timestamp:   ${data.updatedAt}`);
            stdoutLog(`----------------------------------------`);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'State synchronization successful. Case database updated!' }));
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    stdoutLog(`🌐 Mock Main Application Tier running on http://localhost:${PORT}`);
    stdoutLog(`📡 Awaiting pipeline webhook status updates...`);
});
