// lib/generator/initGenerator.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createFile } = require('fs-extra');

function createDir(targetPath) {
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
    }
}

function writeFile(targetPath, content) {
    fs.writeFileSync(targetPath, content);
}

function generateInitNodeExpress(targetDir) {
    console.log('Generating node-express backend structure...');

    // Create folders
    createDir(path.join(targetDir, 'config'));
    createDir(path.join(targetDir, 'routes'));
    createDir(path.join(targetDir, 'controllers'));
    createDir(path.join(targetDir, 'models'));
    createDir(path.join(targetDir, 'utils'));
    createDir(path.join(targetDir, 'middleware'));
    createDir(path.join(targetDir, 'services'));
    createDir(path.join(targetDir, 'docs'));

    // Create files
    writeFile(path.join(targetDir, 'server.js'), `const express = require('express');
const dotenv = require('dotenv');
const signin = require('./routes/signin.routes');
const connectDB = require('./config/db'); // Import the database connection

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/", signin);

// Database connection and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB(); // Establish database connection
        app.listen(PORT, () => {
            // console.log(Server is running on port ${ PORT });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
`);

    writeFile(path.join(targetDir, '.env'), 'MONGO_URI=your-mongo-uri-here  // Replace with your actual MongoDB URI\nPORT=5000\n');

    writeFile(path.join(targetDir, 'config', 'db.js'), `const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000 // 45 seconds (not 45 minutes)
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = connectDB`);

    // writeFile(path.join(targetDir, 'routes'))
    // writeFile(path.join(targetDir, 'controllers'))
    // writeFile(path.join(targetDir, 'models'))

    console.log('Installing dependencies...')
    execSync('npm init -y && npm install express mongoose dotenv', { cwd: targetDir, stdio: 'inherit' })
    console.log('Project ready. Run with: node server.js')
}

module.exports = generateInitNodeExpress;
