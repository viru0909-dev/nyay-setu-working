const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');

const stdoutLog = (msg) => process.stdout.write(msg + '\n');
const stderrLog = (msg) => process.stderr.write(msg + '\n');

const MOCK_CASE_ID = "2026-CR-0990";
const MOCK_TIMESTAMP = "2026-06-05_20-30-00_UTC";
const WEBHOOK_PORT_DEFAULT = 5000;

// Mock data simulating what RabbitMQ would normally send
const mockRabbitMQMessage = {
    caseId: MOCK_CASE_ID,
    timestamp: MOCK_TIMESTAMP,
    fileName: "test_court.mp4"
};

// Hashing function using streams
function calculateSHA256(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        
        stream.on('data', (chunk) => {
            hash.update(chunk);
        });
        
        stream.on('end', () => {
            resolve(hash.digest('hex'));
        });
        
        stream.on('error', (err) => {
            reject(err);
        });
    });
}

// Function to call the mock backend webhook
function sendWebhook(payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const options = {
            hostname: 'localhost',
            port: WEBHOOK_PORT_DEFAULT,
            path: '/api/media/webhook',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(body);
                } else {
                    reject(new Error(`Webhook failed with status ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function processCourtVideoMock(data) {
    const inputPath = path.resolve(__dirname, 'source_videos', data.fileName);
    const outputPath = path.resolve(__dirname, 'target_videos', `processed_${data.fileName}`);

    // Create target directory if it doesn't exist
    const targetDir = path.dirname(outputPath);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    if (!fs.existsSync(inputPath)) {
        stderrLog(`❌ Error: Put a sample video named '${data.fileName}' inside the 'source_videos' folder first!`);
        return;
    }

    stdoutLog(`🎬 [Pipeline Started] Processing Case: ${data.caseId}`);
    stdoutLog(`🎥 Optimizing streams & burning unalterable legal watermark...`);

    ffmpeg(inputPath)
        .outputOptions([
            '-c:v libx264',         // Standard web-streaming video codec
            '-crf 23',              // Balanced high-quality compression ratio
            '-preset medium',
            // Burns a permanent legal chain-of-custody box at the bottom frame
            `-vf drawtext=text='CASE: ${data.caseId} | UTC: ${data.timestamp} | VERIFIED LEGAL EVIDENCE':x=20:y=h-50:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6`,
            '-c:a aac',             // Clear audio stream translation
            '-b:a 128k'
        ])
        .on('progress', (progress) => {
            stdoutLog(`⏳ Processing: ${progress.percent ? progress.percent.toFixed(1) + '%' : 'In progress...'}`);
        })
        .on('end', async () => {
            stdoutLog(`\n✅ [Pipeline Success] Secure output generated at: ${outputPath}`);
            stdoutLog(`🎯 Acceptance Criteria Met: File compressed and watermarked successfully.`);
            
            try {
                stdoutLog(`🔒 Generating SHA-256 checksum for the processed file...`);
                const sha256Hash = await calculateSHA256(outputPath);
                stdoutLog(`🔑 Generated Hash: ${sha256Hash}`);

                const payload = {
                    caseId: data.caseId,
                    status: 'PROCESSED',
                    storagePath: outputPath,
                    sha256Hash: sha256Hash,
                    updatedAt: new Date().toISOString()
                };

                stdoutLog(`📡 Sending status and hash to the Evidence Vault webhook...`);
                const response = await sendWebhook(payload);
                stdoutLog(`🎯 Webhook response received: ${response}`);
            } catch (err) {
                stderrLog(`❌ Error during post-processing: ${err.message}`);
            }
        })
        .on('error', (err) => {
            stderrLog(`❌ FFmpeg Processing Error: ${err.message}`);
        })
        .save(outputPath);
}

// Run the mock pipeline execution directly
processCourtVideoMock(mockRabbitMQMessage);