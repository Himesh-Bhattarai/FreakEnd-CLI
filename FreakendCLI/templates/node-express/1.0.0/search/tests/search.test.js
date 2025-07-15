const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app'); // Assuming main app file
const { User, Item, Post } = require('../models/search.models');

describe('Search API', () => {
  let authToken;
  let adminToken;
  let testUser;
  let testAdmin;
  let testItem;
  let testPost;
  
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI);
    
    // Create test users
    testUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      department: 'Engineering'
    });
    
    testAdmin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      department: 'Management'
    });
    
    // Create test item
    testItem = await Item.create({
      title: 'Test Item',
      description: 'This is a test item',
      category: 'Electronics',
      tags: ['test', 'electronics'],
      price: 99.99,
      owner: testUser._id
    });
    
    // Create test post
    testPost = await Post.create({
      title: 'Test Post',
      content: 'This is a test post content',
      author: testUser._id,
      category: 'Technology',
      tags: ['test', 'technology'],
      status: 'published',
      isPublic: true
    });
    
    // Generate tokens
    authToken = jwt.sign(
      { userId: testUser._id, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    adminToken = jwt.sign(
      { userId: testAdmin._id, role: testAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
  
  describe('GET /search/resources', () => {
    it('should return available search resources', async () => {
      const response = await request(app)
        .get('/search/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].name).toBe('users');
    });
    
    it('should require authentication', async () => {
      await request(app)
        .get('/search/resources')
        .expect(401);
    });
  });
  
  describe('GET /search/users', () => {
    it('should search users successfully', async () => {
      const response = await request(app)
        .get('/search/users?q=John&page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('John Doe');
      expect(response.body.pagination.currentPage).toBe(1);
    });
    
    it('should filter by role', async () => {
      const response = await request(app)
        .get('/search/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].role).toBe('admin');
    });
    
    it('should respect pagination', async () => {
      const response = await request(app)
        .get('/search/users?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.itemsPerPage).toBe(1);
    });
  });
  
  describe('GET /search/items', () => {
    it('should search items successfully', async () => {
      const response = await request(app)
        .get('/search/items?q=Test&page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Test Item');
    });
    
    it('should filter by category', async () => {
      const response = await request(app)
        .get('/search/items?category=Electronics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('Electronics');
    });
  });
  
  describe('GET /search/posts', () => {
    it('should search posts successfully', async () => {
      const response = await request(app)
        .get('/search/posts?q=Test&page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Test Post');
    });
    
    it('should sort results', async () => {
      const response = await request(app)
        .get('/search/posts?sort=-createdAt')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.query.sort).toBe('-createdAt');
    });
  });
  
  describe('GET /search/:resource/suggestions', () => {
    it('should return search suggestions', async () => {
      const response = await request(app)
        .get('/search/users/suggestions?q=Jo')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
    
    it('should require minimum query length', async () => {
      const response = await request(app)
        .get('/search/users/suggestions?q=J')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });