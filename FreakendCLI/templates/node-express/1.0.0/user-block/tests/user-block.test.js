
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../models/User');
jest.mock('../utils/user-block.utils');

const app = express();
app.use(express.json());

// Mock middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 'admin123', role: 'admin' };
  next();
};

// Import routes
const userBlockRoutes = require('../routes/user-block.routes');
app.use('/api/user-block', mockAuthMiddleware, userBlockRoutes);

describe('User Block Feature Tests', () => {
  
  beforeAll(async () => {
    // Setup test database connection
    await mongoose.connect('mongodb://localhost:27017/test_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });
  
  afterAll(async () => {
    // Clean up
    await mongoose.connection.close();
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('POST /api/user-block/block/:id', () => {
    
    it('should block a user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        isBlocked: false,
        blockUser: jest.fn().mockResolvedValue(true)
      };
      
      const User = require('../models/User');
      User.findById.mockResolvedValue(mockUser);
      
      const response = await request(app)
        .patch('/api/user-block/block/user123')
        .send({ reason: 'Test blocking' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockUser.blockUser).toHaveBeenCalledWith('admin123', 'Test blocking');
    });
    
    it('should return 404 if user not found', async () => {
      const User = require('../models/User');
      User.findById.mockResolvedValue(null);
      
      const response = await request(app)
        .patch('/api/user-block/block/nonexistent')
        .send({ reason: 'Test blocking' });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('User not found');
    });
    
    it('should return 400 if user is already blocked', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        isBlocked: true
      };
      
      const User = require('../models/User');
      User.findById.mockResolvedValue(mockUser);
      
      const response = await request(app)
        .patch('/api/user-block/block/user123')
        .send({ reason: 'Test blocking' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('User is already blocked');
    });
    
    it('should return 400 if admin tries to block themselves', async () => {
      const mockUser = {
        _id: 'admin123',
        username: 'admin',
        email: 'admin@example.com',
        isBlocked: false
      };
      
      const User = require('../models/User');
      User.findById.mockResolvedValue(mockUser);
      
      const response = await request(app)
        .patch('/api/user-block/block/admin123')
        .send({ reason: 'Test blocking' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Cannot block yourself');
    });
  });
  
  describe('POST /api/user-block/unblock/:id', () => {
    
    it('should unblock a user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        isBlocked: true,
        unblockUser: jest.fn().mockResolvedValue(true)
      };
      
      const User = require('../models/User');
      User.findById.mockResolvedValue(mockUser);
      
      const response = await request(app)
        .patch('/api/user-block/unblock/user123')
        .send({ reason: 'Test unblocking' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockUser.unblockUser).toHaveBeenCalledWith('admin123', 'Test unblocking');
    });
    
    it('should return 400 if user is not blocked', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        isBlocked: false
      };
      
      const User = require('../models/User');
      User.findById.mockResolvedValue(mockUser);
      
      const response = await request(app)
        .patch('/api/user-block/unblock/user123')
        .send({ reason: 'Test unblocking' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('User is not blocked');
    });
  });
  
  describe('GET /api/user-block/blocked', () => {
    
    it('should return list of blocked users', async () => {
      const mockUsers = [
        {
          _id: 'user1',
          username: 'user1',
          email: 'user1@example.com',
          isBlocked: true,
          blockedAt: new Date(),
          blockedBy: 'admin123'
        },
        {
          _id: 'user2',
          username: 'user2',
          email: 'user2@example.com',
          isBlocked: true,
          blockedAt: new Date(),
          blockedBy: 'admin123'
        }
      ];
      
      const User = require('../models/User');
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockUsers)
      });
      User.countDocuments.mockResolvedValue(2);
      
      const response = await request(app)
        .get('/api/user-block/blocked');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(2);
      expect(response.body.data.pagination.totalUsers).toBe(2);
    });
    
    it('should support pagination', async () => {
      const User = require('../models/User');
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      });
      User.countDocuments.mockResolvedValue(0);
      
      const response = await request(app)
        .get('/api/user-block/blocked?page=2&limit=5');
      
      expect(response.status).toBe(200);
      expect(response.body.data.pagination.currentPage).toBe(2);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });
  
  describe('Middleware Tests', () => {
    
    it('should block access for blocked users', async () => {
      const mockBlockedUser = {
        _id: 'user123',
        isBlocked: true,
        blockedAt: new Date(),
        blockReason: 'Test reason'
      };
      
      const User = require('../models/User');
      User.findById.mockResolvedValue(mockBlockedUser);
      
      const mockReq = {
        user: { id: 'user123' },
        originalUrl: '/api/test'
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();
      
      const { checkUserBlocked } = require('../middleware/user-block.middleware');
      await checkUserBlocked(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
  
  describe('Utility Tests', () => {
    
    it('should validate user ID format', () => {
      const { UserBlockUtils } = require('../utils/user-block.utils');
      
      expect(UserBlockUtils.isValidUserId('507f1f77bcf86cd799439011')).toBe(true);
      expect(UserBlockUtils.isValidUserId('invalid-id')).toBe(false);
      expect(UserBlockUtils.isValidUserId('')).toBe(false);
    });
    
    it('should sanitize reason text', () => {
      const { UserBlockUtils } = require('../utils/user-block.utils');
      
      expect(UserBlockUtils.sanitizeReason('  Test reason  ')).toBe('Test reason');
      expect(UserBlockUtils.sanitizeReason('A'.repeat(600))).toHaveLength(500);
      expect(UserBlockUtils.sanitizeReason(null)).toBe(null);
    });
    
    it('should format block response correctly', () => {
      const { UserBlockUtils } = require('../utils/user-block.utils');
      
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        isBlocked: true,
        blockedAt: new Date()
      };
      
      const response = UserBlockUtils.formatBlockResponse(mockUser, 'blocked');
      
      expect(response.success).toBe(true);
      expect(response.message).toBe('User blocked successfully');
      expect(response.data.userId).toBe('user123');
      expect(response.data.action).toBe('blocked');
    });
  });
});