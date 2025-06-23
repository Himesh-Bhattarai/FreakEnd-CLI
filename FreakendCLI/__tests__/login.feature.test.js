const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const request = require('supertest');

process.env.NODE_ENV = 'test';  // ensure safe cookie options

jest.mock('../templates/node-express/1.0.0/login/models/universal.User.model.js', () => ({
    findOne: jest.fn()
}));

jest.mock('bcrypt', () => ({
    compare: jest.fn()
}));

jest.mock('../templates/node-express/1.0.0/login/services/jwt.token.services.js', () => ({
    generateTokens: jest.fn()
}));

const basePath = path.resolve('./templates/node-express/1.0.0/login');

const User = require(`${basePath}/models/universal.User.model.js`);
const bcrypt = require('bcrypt');
const tokenService = require(`${basePath}/services/jwt.token.services.js`);

test('✅ login feature: full stack test', async () => {
    // Step 1: Check required files exist
    const requiredFiles = [
        'config/jwt.config.js',
        'controllers/login.controller.js',
        'middleware/jwt.token.middleware.js',
        'middleware/login.middleware.js',
        'models/universal.User.model.js',
        'routes/login.route.js',
        'services/jwt.token.services.js',
        'utils/app.error.js'
    ];

    requiredFiles.forEach(relPath => {
        const fullPath = path.join(basePath, relPath);
        expect(fs.existsSync(fullPath)).toBe(true);
    });

    // Step 2: Setup mocks behavior
    User.findOne.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue({
            _id: 'mock-id',
            email: 'test@example.com',
            username: 'tester',
            password: 'hashed_pw',
            tokenVersion: 0,
            refreshTokens: [],
            save: jest.fn().mockResolvedValue(true)
        })
    }));
      

    bcrypt.compare.mockResolvedValue(true);
    tokenService.generateTokens.mockResolvedValue({
        access: { token: 'mock-access-token' },
        refresh: { token: 'mock-refresh-token' }
    });
      
      
    // Step 3: Middleware test
    const { validateLogin } = require(`${basePath}/middleware/login.middleware.js`);
    const next = jest.fn();
    validateLogin(
        { body: { email: 'test@example.com', password: '123456' } },
        { status: () => ({ json: () => { } }) },
        next
    );
    expect(next).toHaveBeenCalled();

    // Step 4: Controller test with error debug
    const { login } = require(`${basePath}/controllers/login.controller.js`);
    const res = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
      
      
      
    const req = { body: { email: 'test@example.com', password: '123456' } };

    try {
        await login(req, res);
        console.log('res.status calls:', res.status.mock.calls);
        console.log('res.json calls:', res.json.mock.calls);

    } catch (err) {
        console.error('Login controller error:', err);
        throw err;
    }

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Login successful'
    }));

    // Step 5: Route integration test
    const app = express();
    app.use(express.json());
    const loginRoutes = require(`${basePath}/routes/login.route.js`);
    app.use('/', loginRoutes);

    const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: '123456' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login successful');
});

afterAll(() => {
    jest.resetAllMocks();
    jest.clearAllTimers();
});
