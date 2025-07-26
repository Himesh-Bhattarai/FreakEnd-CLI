// lib/generator/initGenerator.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function createDir(targetPath) {
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
    }
}

function writeFile(targetPath, content) {
    fs.writeFileSync(targetPath, content);
}

function generateInitNodeExpress(targetDir) {
    console.log('🔧 Generating node-express backend structure...');

    // Create folders
    const folders = ['config', 'routes', 'controllers', 'models', 'utils', 'middleware', 'services', 'docs'];
    folders.forEach(folder => createDir(path.join(targetDir, folder)));

    // Create base files
    writeFile(path.join(targetDir, 'server.js'), `const express = require('express');
const dotenv = require('dotenv');
const signin = require('./routes/signin.routes');
const connectDB = require('./config/db'); 

dotenv.config();
const app = express();
app.use(express.json());
app.use("/", signin);

const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(\`Server is running on port \${PORT}\`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();`);

    writeFile(path.join(targetDir, '.env'), `MONGO_URI=your-mongo-uri-here\nPORT=5000`);

    writeFile(path.join(targetDir, 'config', 'db.js'), `const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
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

module.exports = connectDB;`);

    // Handle npm init + install
    console.log('📦 Setting up project with npm...');

    try {
        if (!fs.existsSync(path.join(targetDir, 'package.json'))) {
            execSync('npm init -y', { cwd: targetDir, stdio: 'inherit' });
            console.log('✅ npm init complete');
        } else {
            console.log('⚠️ package.json already exists. Skipping npm init.');
        }

        if (!fs.existsSync(path.join(targetDir, 'node_modules'))) {
            execSync('npm install express mongoose dotenv', { cwd: targetDir, stdio: 'inherit' });
            console.log('✅ Dependencies installed');
        } else {
            console.log('⚠️ node_modules already exists. Skipping npm install.');
        }
    } catch (err) {
        console.error('❌ Error during npm setup:', err.message);
    }

    console.log('🎉 Project ready. Run it with: node server.js');
}

module.exports = generateInitNodeExpress;
