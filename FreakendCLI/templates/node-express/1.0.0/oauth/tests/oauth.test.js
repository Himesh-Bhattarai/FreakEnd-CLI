const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const OAuthUser = require('../models/oauth.model');
const oauthRoutes = require('../routes/oauth.routes');
const OAuthUtils = require('../utils/oauth.utils');

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.GITHUB_CLIENT_ID = 'test-github-client-id';
process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret';
process.env.FRONTEND_SUCCESS_URL = 'http://localhost:3000/dashboard';
process.env.FRONTEND_ERROR_URL = 'http://localhost:3000/login';

// Create test app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'test-session-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use('/api/oauth', oauthRoutes);

// Test database connection
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_oauth';

describe('OAuth Feature Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
    
    // Create test user
    testUser = new OAuthUser({
      email: 'test@example.com',
      username: 'testuser',
      fullName: 'Test User',
      isEmailVerified: true,
      oauthProviders: [{
        provider: 'github',
        providerId: '12345',
        providerData: { username: 'testuser' }
      }]
    });
    await testUser.save();
    
    // Generate auth token
    authToken = OAuthUtils.generateJWT(testUser);
  });

  afterAll(async () => {
    // Clean up test data
    await OAuthUser.deleteMany({});
    await mongoose.connection.close();
  });

  describe('OAuth Initiation', () => {
    test('should initiate GitHub OAuth', async () => {
      const response = await request(app)
        .get('/api/oauth/github')
        .expect(302);

      expect(response.headers.location).toContain('github.com');
    });

    test('should reject invalid provider', async () => {
      const response = await request(app)
        .get('/api/oauth/invalid-provider')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('invalid_provider');
    });

    test('should handle redirect URI sanitization', async () => {
      const response = await request(app)
        .get('/api/oauth/github')
        .query({ redirect_uri: 'javascript:alert(1)' })
        .expect(400);

      expect(response.body.error.type).toBe('invalid_redirect_uri');
    });
  });

  describe('User Profile Management', () => {
    test('should get user profile', async () => {
      const response = await request(app)
        .get('/api/oauth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.providers).toHaveLength(1);
    });

    test('should update user profile', async () => {
      const updateData = {
        fullName: 'Updated Test User',
        preferences: {
          notifications: { email: false }
        }
      };

      const response = await request(app)
        .put('/api/oauth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fullName).toBe('Updated Test User');
      expect(response.body.data.preferences.notifications.email).toBe(false);
    });

    test('should reject unauthorized profile access', async () => {
      const response = await request(app)
        .get('/api/oauth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('unauthorized');
    });
  });

  describe('OAuth Provider Management', () => {
    test('should get user connections', async () => {
      const response = await request(app)
        .get('/api/oauth/connections')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.connections).toHaveLength(1);
      expect(response.body.data.connections[0].provider).toBe('github');
    });

    test('should generate link URL for new provider', async () => {
      const response = await request(app)
        .post('/api/oauth/link/google')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.linkUrl).toContain('/api/oauth/google');
    });

    test('should prevent linking already linked provider', async () => {
      const response = await request(app)
        .post('/api/oauth/link/github')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error.type).toBe('provider_already_linked');
    });

    test('should prevent unlinking last provider', async () => {
      const response = await request(app)
        .delete('/api/oauth/unlink/github')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error.type).toBe('cannot_unlink_last_provider');
    });
  });

  describe('Token Management', () => {
    test('should refresh JWT token', async () => {
      const response = await request(app)
        .post('/api/oauth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/oauth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error.type).toBe('invalid_token');
    });
  });

  describe('Account Management', () => {
    test('should require proper confirmation for account deletion', async () => {
      const response = await request(app)
        .delete('/api/oauth/account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ confirmPassword: 'wrong-confirmation' })
        .expect(400);

      expect(response.body.error.type).toBe('invalid_confirmation');
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting to OAuth endpoints', async () => {
      // Make multiple requests to trigger rate limit
      const requests = Array(10).fill().map(() => 
        request(app).get('/api/oauth/invalid-provider')
      );

      await Promise.all(requests);

      // Next request should be rate limited
      const response = await request(app)
        .get('/api/oauth/invalid-provider')
        .expect(429);

      expect(response.body.error.type).toBe('rate_limit_exceeded');
    });
  });

  describe('Utility Functions', () => {
    test('should generate valid JWT token', () => {
      const token = OAuthUtils.generateJWT(testUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    test('should validate email format', () => {
      expect(OAuthUtils.isValidEmail('test@example.com')).toBe(true);
      expect(OAuthUtils.isValidEmail('invalid-email')).toBe(false);
    });

    test('should sanitize redirect URLs', () => {
      const safeUrl = OAuthUtils.sanitizeRedirectURL('http://localhost:3000/dashboard');
      expect(safeUrl).toBe('http://localhost:3000/dashboard');

      const unsafeUrl = OAuthUtils.sanitizeRedirectURL('javascript:alert(1)');
      expect(unsafeUrl).toBe(null);
    });

    test('should generate unique usernames', () => {
      const username1 = OAuthUtils.generateUsernameFromEmail('test@example.com');
      const username2 = OAuthUtils.generateUsernameFromEmail('test@example.com');
      expect(username1).not.toBe(username2);
    });
  });

  describe('Model Methods', () => {
    test('should add OAuth provider to user', async () => {
      const user = new OAuthUser({
        email: 'test2@example.com',
        username: 'testuser2',
        fullName: 'Test User 2'
      });

      user.addOAuthProvider('google', 'google123', { profileUrl: 'https://google.com' });
      expect(user.oauthProviders).toHaveLength(1);
      expect(user.oauthProviders[0].provider).toBe('google');
    });

    test('should check if user has OAuth provider', () => {
      expect(testUser.hasOAuthProvider('github')).toBe(true);
      expect(testUser.hasOAuthProvider('google')).toBe(false);
    });

    test('should remove OAuth provider', () => {
      const user = new OAuthUser({
        email: 'test3@example.com',
        username: 'testuser3',
        fullName: 'Test User 3',
        oauthProviders: [
          { provider: 'github', providerId: '123' },
          { provider: 'google', providerId: '456' }
        ]
      });

      user.removeOAuthProvider('github');
      expect(user.oauthProviders).toHaveLength(1);
      expect(user.oauthProviders[0].provider).toBe('google');
    });
  });
});