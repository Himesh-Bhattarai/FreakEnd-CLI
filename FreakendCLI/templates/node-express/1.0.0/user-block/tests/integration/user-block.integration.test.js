
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../app'); // Assume main app file exists

describe('User Block Integration Tests', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let testUser;
  
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_user_block', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Create test users
    const User = require('../../models/User');
    
    // Create admin user
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'hashedPassword123',
      role: 'admin',
      isBlocked: false
    });
    
    // Create regular user
    testUser = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'hashedPassword123',
      role: 'user',
      isBlocked: false
    });
    
    // Generate tokens
    adminToken = jwt.sign(
      { id: adminUser._id, role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
    
    userToken = jwt.sign(
      { id: testUser._id, role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });
  
  afterAll(async () => {
    // Clean up test data
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });
  
  describe('Complete User Block Flow', () => {
    
    it('should complete full block/unblock cycle', async () => {
      // 1. Block user
      const blockResponse = await request(app)
        .patch(`/api/user-block/block/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Integration test blocking' });
      
      expect(blockResponse.status).toBe(200);
      expect(blockResponse.body.success).toBe(true);
      expect(blockResponse.body.data.isBlocked).toBe(true);
      
      // 2. Verify user is blocked in database
      const User = require('../../models/User');
      const blockedUser = await User.findById(testUser._id);
      expect(blockedUser.isBlocked).toBe(true);
      expect(blockedUser.blockReason).toBe('Integration test blocking');
      
      // 3. Test blocked user cannot access protected routes
      const protectedResponse = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(protectedResponse.status).toBe(403);
      expect(protectedResponse.body.error.message).toBe('Access denied. Your account has been blocked.');
      
      // 4. Check blocked users list
      const blockedListResponse = await request(app)
        .get('/api/user-block/blocked')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(blockedListResponse.status).toBe(200);
      expect(blockedListResponse.body.data.users).toHaveLength(1);
      expect(blockedListResponse.body.data.users[0]._id).toBe(testUser._id.toString());
      
      // 5. Unblock user
      const unblockResponse = await request(app)
        .patch(`/api/user-block/unblock/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Integration test unblocking' });
      
      expect(unblockResponse.status).toBe(200);
      expect(unblockResponse.body.success).toBe(true);
      expect(unblockResponse.body.data.isBlocked).toBe(false);
      
      // 6. Verify user is unblocked in database
      const unblockedUser = await User.findById(testUser._id);
      expect(unblockedUser.isBlocked).toBe(false);
      expect(unblockedUser.unblockReason).toBe('Integration test unblocking');
      
      // 7. Test user can now access protected routes
      const allowedResponse = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(allowedResponse.status).not.toBe(403);
    });
    
    it('should maintain block history', async () => {
      // Block and unblock user multiple times
      await request(app)
        .patch(`/api/user-block/block/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'First block' });
      
      await request(app)
        .patch(`/api/user-block/unblock/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'First unblock' });
      
      await request(app)
        .patch(`/api/user-block/block/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Second block' });
      
      // Check block history
      const historyResponse = await request(app)
        .get(`/api/user-block/block-history/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body.data.blockHistory).toHaveLength(3);
      
      const history = historyResponse.body.data.blockHistory;
      expect(history[0].action).toBe('blocked'); // Most recent
      expect(history[0].reason).toBe('Second block');
      expect(history[1].action).toBe('unblocked');
      expect(history[1].reason).toBe('First unblock');
      expect(history[2].action).toBe('blocked');
      expect(history[2].reason).toBe('First block');
    });
  });
  
  describe('Permission Tests', () => {
    
    it('should deny access to non-admin users', async () => {
      const response = await request(app)
        .patch(`/api/user-block/block/${testUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Unauthorized attempt' });
      
      expect(response.status).toBe(403);
      expect(response.body.error.message).toBe('Admin privileges required');
    });
    
    it('should deny access to unauthenticated users', async () => {
      const response = await request(app)
        .patch(`/api/user-block/block/${testUser._id}`)
        .send({ reason: 'Unauthenticated attempt' });
      
      expect(response.status).toBe(401);
    });
  });
});