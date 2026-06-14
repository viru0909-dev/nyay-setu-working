const amqp = require('amqplib');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');

// Load configurations from environment variables or use defaults
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'court-media-queue';
const DLQ_NAME = 'court-media-dlq';
const WEBHOOK_HOST = process.env.WEBHOOK_HOST || 'localhost';
const WEBHOOK_PORT = process.env.WEBHOOK_PORT || 5000;
const WEBHOOK_PATH = process.env.WEBHOOK_PATH || '/api/media/webhook';

// Streaming SHA-256 helper
function calculateSHA256(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', err => reject(err));
    });
}

// HTTP POST webhook dispatcher
function sendWebhook(payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const options = {
            hostname: WEBHOOK_HOST,
            port: WEBHOOK_PORT,
            path: WEBHOOK_PATH,
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
                    reject(new Error(`Webhook responded with status ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function startWorker() {
    try {
        console.log(`🔌 Connecting to RabbitMQ at: ${RABBITMQ_URL}`);
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // 1. Declare exchanges
        await channel.assertExchange('court-media-exchange', 'direct', { durable: true });
        await channel.assertExchange('court-media-dlq-exchange', 'direct', { durable: true });

        // 2. Declare and bind DLQ
        await channel.assertQueue(DLQ_NAME, { durable: true });
        await channel.bindQueue(DLQ_NAME, 'court-media-dlq-exchange', 'dead-letter');

        // 3. Declare and bind main processing queue with DLQ integration
        await channel.assertQueue(QUEUE_NAME, {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': 'court-media-dlq-exchange',
                'x-dead-letter-routing-key': 'dead-letter'
            }
        });
        await channel.bindQueue(QUEUE_NAME, 'court-media-exchange', 'process');

        console.log(`🚀 [Media Worker Started] Listening for tasks on queue: ${QUEUE_NAME}...`);
        
        channel.prefetch(1);
        
        channel.consume(QUEUE_NAME, async (msg) => {
            if (!msg) return;

            let data;
            try {
                data = JSON.parse(msg.content.toString());
                console.log(`\n🎬 [Processing Started] Case ID: ${data.caseId}`);
            } catch (err) {
                console.error('❌ Failed to parse task payload JSON:', err.message);
                // Reject failed task immediately to the DLQ (no requeue)
                channel.nack(msg, false, false);
                return;
            }

            const inputPath = path.resolve(__dirname, 'source_videos', data.fileName);
            const outputPath = path.resolve(__dirname, 'target_videos', `processed_${data.fileName}`);

            // Ensure directories exist
            const targetDir = path.dirname(outputPath);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            if (!fs.existsSync(inputPath)) {
                console.error(`❌ Error: Source video '${inputPath}' does not exist.`);
                // Route to DLQ (no requeue)
                channel.nack(msg, false, false);
                return;
            }

            // Execute FFmpeg pipeline
            ffmpeg(inputPath)
                .outputOptions([
                    '-c:v libx264',
                    '-crf 23',
                    '-preset medium',
                    `-vf drawtext=text='CASE: ${data.caseId} | UTC: ${data.timestamp} | VERIFIED LEGAL EVIDENCE':x=20:y=h-50:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6`,
                    '-c:a aac',
                    '-b:a 128k'
                ])
                .on('progress', (progress) => {
                    console.log(`⏳ Progress (Case ${data.caseId}): ${progress.percent ? progress.percent.toFixed(1) + '%' : 'Processing...'}`);
                })
                .on('end', async () => {
                    console.log(`✅ [FFmpeg Complete] Output generated at: ${outputPath}`);
                    
                    try {
                        // 1. Calculate SHA-256 hash using streams
                        console.log(`🔒 Generating SHA-256 hash...`);
                        const sha256Hash = await calculateSHA256(outputPath);
                        console.log(`🔑 SHA-256 Hash: ${sha256Hash}`);

                        // 2. Build sync payload
                        const payload = {
                            caseId: data.caseId,
                            status: 'PROCESSED',
                            storagePath: outputPath,
                            sha256Hash: sha256Hash,
                            updatedAt: new Date().toISOString()
                        };

                        // 3. Dispatch to Evidence Vault
                        console.log(`📡 Sending status to Evidence Vault Service webhook...`);
                        await sendWebhook(payload);
                        console.log(`🎯 State synchronized successfully.`);

                        // 4. Acknowledge RabbitMQ message
                        channel.ack(msg);
                        console.log(`📥 Message acknowledged successfully.`);
                    } catch (error) {
                        console.error(`❌ Post-processing hook failed:`, error.message);
                        // Reject message to route it to DLQ (no requeue)
                        channel.nack(msg, false, false);
                    }
                })
                .on('error', (err) => {
                    console.error(`❌ FFmpeg Error for Case ${data.caseId}:`, err.message);
                    // Reject message to route it to DLQ (no requeue)
                    channel.nack(msg, false, false);
                })
                .save(outputPath);
        }, { noAck: false });

    } catch (err) {
        console.error('🛑 Fatal Media Worker Connection Error:', err.message);
        console.log('🔄 Reconnecting in 5 seconds...');
        setTimeout(startWorker, 5000);
    }
}

// Start worker only when run directly
if (require.main === module) {
    startWorker();
}

module.exports = { calculateSHA256, sendWebhook, startWorker };
