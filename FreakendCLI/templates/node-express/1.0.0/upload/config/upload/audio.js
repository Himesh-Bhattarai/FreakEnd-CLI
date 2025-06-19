module.exports = {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/webm'
    ],
    storage: {
      local: {
        tempDir: './uploads/audio/temp',
        processedDir: './uploads/audio/processed'
      },
      s3: {
        bucket: process.env.S3_AUDIO_BUCKET,// Ensure this environment variable is set
        region: process.env.S3_REGION // Ensure this environment variable is set
      }
    },
    bitrate: '128k',
    sampleRate: 44100
  };