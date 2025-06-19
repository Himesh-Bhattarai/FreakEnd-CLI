module.exports = {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    storage: {
      local: {
        tempDir: './uploads/documents/temp',
        processedDir: './uploads/documents/processed'
      },
      s3: {
        bucket: process.env.S3_DOCUMENTS_BUCKET,
        region: process.env.S3_REGION
      }
    }
  };