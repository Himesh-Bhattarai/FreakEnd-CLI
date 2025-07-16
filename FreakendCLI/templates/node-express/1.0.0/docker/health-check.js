#!/usr/bin/env node

// Health check script for Docker container
// This script is used by Docker's HEALTHCHECK instruction

const http = require('http');
const mongoose = require('mongoose');

const options = {
  host: 'localhost',
  port: process.env.PORT || 3000,
  timeout: 2000,
  path: '/health' // Your app should have a /health endpoint
};

const request = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    process.exit(0); // Success
  } else {
    process.exit(1); // Failure
  }
});

request.on('error', (err) => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('Health check timeout');
  request.destroy();
  process.exit(1);
});

request.setTimeout(options.timeout);
request.end();

// Optional: Also check MongoDB connection
const checkMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/freakend_db';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000
    });
    
    console.log('MongoDB health check: OK');
    mongoose.connection.close();
  } catch (error) {
    console.error('MongoDB health check failed:', error.message);
    process.exit(1);
  }
};

// Uncomment the line below if you want to include MongoDB in health checks
// checkMongoDB();