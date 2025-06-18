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
    console.log('Generating node-express backend structure...');

    // Create folders
    createDir(path.join(targetDir, 'config'));
    createDir(path.join(targetDir, 'routes'));
    createDir(path.join(targetDir, 'controllers'));
    createDir(path.join(targetDir, 'models'));

    // Create files
    writeFile(path.join(targetDir, 'server.js'), `
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const loginRoutes = require('./routes/login');

dotenv.config();
const app = express();
app.use(express.json());
app.use('/login', loginRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log('Server running')))
    .catch(err => console.error(err));
`);

    writeFile(path.join(targetDir, '.env'), 'MONGO_URI=your-mongo-uri-here');

    writeFile(path.join(targetDir, 'config', 'db.js'), `
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
`);

    writeFile(path.join(targetDir, 'routes', 'login.js'), `
const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/loginController');

router.post('/', loginUser);

module.exports = router;
`);

    writeFile(path.join(targetDir, 'controllers', 'loginController.js'), `
exports.loginUser = (req, res) => {
    res.send('Login logic here');
};
`);

    writeFile(path.join(targetDir, 'models', 'userModel.js'), `
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
});

module.exports = mongoose.model('User', UserSchema);
`);

    console.log('Installing dependencies...');
    execSync('npm init -y && npm install express mongoose dotenv', { cwd: targetDir, stdio: 'inherit' });
    console.log('Project ready. Run with: node server.js');
}

module.exports = generateInitNodeExpress;
