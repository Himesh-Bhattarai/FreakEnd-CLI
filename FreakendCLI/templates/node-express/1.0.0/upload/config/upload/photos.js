module.exports = {
    maxFileSize: 10 * 1024 * 1024, // 10MB Adjusyt as needed
    
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    storage: {
      local: {
        tempDir: './uploads/photos/temp',
        processedDir: './uploads/photos/processed'
      },
      s3: {
        bucket: process.env.S3_PHOTOS_BUCKET,
        region: process.env.S3_REGION
      }
    },
    transformations: {
      thumbnail: {
        width: 320,
        height: 240
      },
      medium: {
        width: 800,
        height: 600
      }
    }
  };