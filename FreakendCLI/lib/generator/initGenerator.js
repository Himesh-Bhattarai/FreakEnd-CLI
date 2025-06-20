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
    writeFile(path.join(targetDir, 'server.js'), `
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config();
const app = express();
app.use(express.json());


const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log('Server running')))
    .catch(err => console.error(err));
`);

    writeFile(path.join(targetDir, '.env'), 'MONGO_URI=your-mongo-uri-here  // Replace with your actual MongoDB URI\nPORT=5000\n');

    writeFile(path.join(targetDir, 'config', 'db.js'), `
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || " ", { // Use your MongoDB URI here
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 4500000 // Close sockets after 45m of inactivity
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit process with failure
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from DB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to app termination');
    process.exit(0);
});

module.exports = connectDB;
`);

    // writeFile(path.join(targetDir, 'routes'))
    // writeFile(path.join(targetDir, 'controllers'))
    // writeFile(path.join(targetDir, 'models'))

    console.log('Installing dependencies...')
    execSync('npm init -y && npm install express mongoose dotenv', { cwd: targetDir, stdio: 'inherit' })
    console.log('Project ready. Run with: node server.js')
}

module.exports = generateInitNodeExpress;
