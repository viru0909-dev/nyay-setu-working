const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

// Mock data simulating what RabbitMQ would normally send
const mockRabbitMQMessage = {
    caseId: "2026-CR-0990",
    timestamp: "2026-06-05_20-30-00_UTC",
    fileName: "test_court.mp4"
};

function processCourtVideoMock(data) {
    const inputPath = path.resolve(__dirname, 'source_videos', data.fileName);
    const outputPath = path.resolve(__dirname, 'target_videos', `processed_${data.fileName}`);

    if (!fs.existsSync(inputPath)) {
        console.error(`❌ Error: Put a sample video named '${data.fileName}' inside the 'source_videos' folder first!`);
        return;
    }

    console.log(`🎬 [Pipeline Started] Processing Case: ${data.caseId}`);
    console.log(`🎥 Optimizing streams & burning unalterable legal watermark...`);

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
            console.log(`⏳ Processing: ${progress.percent ? progress.percent.toFixed(1) + '%' : 'In progress...'}`);
        })
        .on('end', () => {
            console.log(`\n✅ [Pipeline Success] Secure output generated at: ${outputPath}`);
            console.log(`🎯 Acceptance Criteria Met: File compressed and watermarked successfully.`);
        })
        .on('error', (err) => {
            console.error('❌ FFmpeg Processing Error: ', err.message);
        })
        .save(outputPath);
}

// Run the mock pipeline execution directly
processCourtVideoMock(mockRabbitMQMessage);