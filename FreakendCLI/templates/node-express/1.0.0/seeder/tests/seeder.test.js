const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app'); // Adjust path to your main app file
const User = require('../models/User');
const { SeederLog } = require('../models/seeder.models');
const SeederService = require('../services/seeder.services');

// Test database
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/freakend_test';

describe('Database Seeder', () => {
  let adminUser;
  let adminToken;
  let regularUser;
  let regularToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
    
    // Create admin user
    adminUser = new User({
      firstName: 'Admin',
      lastName: 'Test',
      email: 'admin@test.com',
      password: 'Admin@123',
      role: 'admin',
      isActive: true
    });
    await adminUser.save();
    
    // Create regular user
    regularUser = new User({
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@test.com',
      password: 'User@123',
      role: 'user',
      isActive: true
    });
    await regularUser.save();
    
    // Generate tokens
    adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET);
    regularToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    // Clean up test database
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear seeded data before each test
    await User.deleteMany({ isSeeded: true });
    await SeederLog.deleteMany({});
  });

  describe('Authentication & Authorization', () => {
    test('should require authentication token', async () => {
      const response = await request(app)
        .post('/api/seed/users')
        .send({ count: 5 });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access token required');
    });

    test('should require admin role', async () => {
      const response = await request(app)
        .post('/api/seed/users')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ count: 5 });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin access required');
    });

    test('should allow admin access', async () => {
      const response = await request(app)
        .post('/api/seed/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ count: 5 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('User Seeding', () => {
    test('should seed users successfully', async () => {
      const response = await request(app)
        .post('/api/seed/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ count: 5 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.message).toContain('Successfully seeded 5 users');
      
      // Check database
      const userCount = await User.countDocuments({ isSeeded: true });
      expect(userCount).toBe(5);
    });

    test('should validate user count limits', async () => {
      const response = await request(app)
        .post('/api/seed/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ count: 1001 });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Count must be between 1 and 1000');
    });

    test('should create seeder log entry', async () => {
      await request(app)
        .post('/api/seed/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ count: 3 });
      
      const log = await SeederLog.findOne({ operation: 'seed', model: 'User' });
      expect(log).toBeTruthy();
      expect(log.recordsAffected).toBe(3);
      expect(log.status).toBe('success');
      expect(log.executedBy.toString()).toBe(adminUser._id.toString());
    });
  });

  describe('Database Reset', () => {
    test('should require confirmation for reset', async () => {
      const response = await request(app)
        .post('/api/seed/reset')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Confirmation required');
    });

    test('should reset database with confirmation', async () => {
      // First seed some users
      await request(app)
        .post('/api/seed/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ count: 5 });
      
      // Then reset
      const response = await request(app)
        .post('/api/seed/reset')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ confirm: 'yes' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Check that seeded users are deleted
      const userCount = await User.countDocuments({ isSeeded: true });
      expect(userCount).toBe(0);
    });
  });

  describe('Seeder Statistics', () => {
    test('should return seeder statistics', async () => {
      // Seed some data first
      await request(app)
        .post('/api/seed/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ count: 3 });
      
      const response = await request(app)
        .get('/api/seed/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats.User).toBeDefined();
      expect(response.body.data.stats.User.seeded).toBe(3);
      expect(response.body.data.recentLogs).toBeDefined();
    });
  });

  describe('Input Validation & Security', () => {
    test('should sanitize input', async () => {
      const response = await request(app)
        .post('/api/seed/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          count: 5,
          '$where': 'malicious code',
          'nested': { '$gt': 'injection' }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should handle invalid count values', async () => {
      const response = await request(app)
        .post('/api/seed/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ count: -1 });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('SeederService Unit Tests', () => {
    test('should seed users via service', async () => {
      const result = await SeederService.seedUsers(5, adminUser._id);
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(5);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.data).toHaveLength(5);
    });

    test('should handle seeding errors', async () => {
      // Mock a database error
      const originalFind = User.find;
      User.find = jest.fn().mockRejectedValue(new Error('Database error'));
      
      try {
        await SeederService.seedUsers(5, adminUser._id);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Database error');
      }
      
      User.find = originalFind;
    });

    test('should get seeder statistics', async () => {
      await SeederService.seedUsers(3, adminUser._id);
      
      const result = await SeederService.getSeederStats();
      
      expect(result.success).toBe(true);
      expect(result.stats.User).toBeDefined();
      expect(result.stats.User.seeded).toBe(3);
      expect(result.recentLogs).toBeDefined();
    });
  });

  describe('Environment Configuration', () => {
    test('should validate seeder configuration', async () => {
      // Temporarily remove required env var
      const originalSecret = process.env.SEEDER_SECRET;
      delete process.env.SEEDER_SECRET;
      
      const response = await request(app)
        .post('/api/seed/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ count: 5 });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required environment variables');
      
      // Restore env var
      process.env.SEEDER_SECRET = originalSecret;
    });
  });
});