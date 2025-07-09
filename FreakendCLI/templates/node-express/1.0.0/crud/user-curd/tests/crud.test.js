const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/crud.model');
const crudRoutes = require('../routes/crud.routes');

const app = express();
app.use(express.json());
app.use('/api/users', crudRoutes);

describe('CRUD User Management', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/freakend_test');
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phoneNumber: '+1234567890'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
      
      // Store for later tests
      authToken = response.body.data.token;
      userId = response.body.data.user._id;
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      // Create first user
      await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/users/register')
        .send(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.token).toBeDefined();
      
      authToken = response.body.data.token;
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'john.doe@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/users/profile', () => {
    beforeEach(async () => {
      // Create and login user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      authToken = response.body.data.token;
    });

    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('john.doe@example.com');
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('PUT /api/users/:id', () => {
    beforeEach(async () => {
      // Create admin user
      const adminData = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(adminData);

      authToken = response.body.data.token;
      
      // Create regular user to update
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const userResponse = await request(app)
        .post('/api/users/register')
        .send(userData);

      userId = userResponse.body.data.user._id;
    });

    it('should update user successfully', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+1987654321'
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe('Jane');
      expect(response.body.data.user.lastName).toBe('Smith');
    });

    it('should return error for invalid user ID', async () => {
      const response = await request(app)
        .put('/api/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Jane' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    beforeEach(async () => {
      // Create admin user
      const adminData = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(adminData);

      authToken = response.body.data.token;
      
      // Create regular user to delete
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const userResponse = await request(app)
        .post('/api/users/register')
        .send(userData);

      userId = userResponse.body.data.user._id;
    });

    it('should soft delete user successfully', async () => {
      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');

      // Verify user is deactivated
      const user = await User.findById(userId);
      expect(user.isActive).toBe(false);
    });

    it('should return error for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Create admin user
      const adminData = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(adminData);

      authToken = response.body.data.token;

      // Create multiple test users
      const users = [
        { firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'password123' },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', password: 'password123' },
        { firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', password: 'password123' }
      ];

      for (const user of users) {
        await request(app).post('/api/users/register').send(user);
      }
    });

    it('should get all users with pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(4); // 3 + 1 admin
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/users?role=admin')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].role).toBe('admin');
    });

    it('should search users by name', async () => {
      const response = await request(app)
        .get('/api/users?search=John')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThan(0);
      expect(response.body.data.users[0].firstName).toContain('John');
    });
  });
});