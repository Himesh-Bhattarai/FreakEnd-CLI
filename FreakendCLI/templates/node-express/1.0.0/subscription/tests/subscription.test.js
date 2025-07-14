const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Assuming main app file
const Subscription = require('../models/subscription.models');
const SubscriptionPlan = require('../models/subscriptionPlan.models');
const User = require('../models/user.models'); // Assuming user model exists

describe('Subscription System', () => {
  let authToken;
  let userId;
  let freePlanId;
  let proPlanId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI);
    
    // Create test user
    const user = new User({
      email: 'test@example.com',
      password: 'testpassword',
      name: 'Test User'
    });
    await user.save();
    userId = user._id;

    // Generate auth token (implement based on your auth system)
    authToken = generateTestToken(userId);

    // Create test plans
    const freePlan = new SubscriptionPlan({
      name: 'free',
      displayName: 'Free Plan',
      price: 0,
      currency: 'USD',
      interval: 'month',
      isFree: true,
      limitations: {
        maxUsers: 5,
        maxStorage: 100,
        maxApiCalls: 1000
      }
    });
    await freePlan.save();
    freePlanId = freePlan._id;

    const proPlan = new SubscriptionPlan({
      name: 'pro',
      displayName: 'Pro Plan',
      price: 29.99,
      currency: 'USD',
      interval: 'month',
      trialDays: 14,
      limitations: {
        maxUsers: 50,
        maxStorage: 10000,
        maxApiCalls: 100000
      }
    });
    await proPlan.save();
    proPlanId = proPlan._id;
  });

  afterAll(async () => {
    // Clean up test data
    await Subscription.deleteMany({});
    await SubscriptionPlan.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/subscriptions/plans', () => {
    it('should create a new subscription plan', async () => {
      const planData = {
        name: 'enterprise',
        displayName: 'Enterprise Plan',
        price: 99.99,
        currency: 'USD',
        interval: 'month',
        features: [
          { name: 'unlimited-users', description: 'Unlimited users' },
          { name: 'priority-support', description: 'Priority support' }
        ],
        limitations: {
          maxUsers: -1,
          maxStorage: -1,
          maxApiCalls: -1
        }
      };

      const response = await request(app)
        .post('/api/subscriptions/plans')
        .send(planData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('enterprise');
      expect(response.body.data.price).toBe(99.99);
    });

    it('should fail with invalid plan data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        price: -10 // Invalid: negative price
      };

      const response = await request(app)
        .post('/api/subscriptions/plans')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/subscriptions/plans', () => {
    it('should fetch all active plans', async () => {
      const response = await request(app)
        .get('/api/subscriptions/plans')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should fetch specific plan by ID', async () => {
      const response = await request(app)
        .get(`/api/subscriptions/plans/${freePlanId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('free');
    });
  });

  describe('POST /api/subscriptions/subscribe/:planId', () => {
    it('should subscribe user to free plan', async () => {
      const response = await request(app)
        .post(`/api/subscriptions/subscribe/${freePlanId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.plan.name).toBe('free');
    });

    it('should subscribe user to pro plan with free trial', async () => {
      // First cancel existing subscription
      await Subscription.deleteMany({ userId });

      const response = await request(app)
        .post(`/api/subscriptions/subscribe/${proPlanId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ useFreeTrial: true })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('trial');
      expect(response.body.data.isInTrial).toBe(true);
    });

    it('should fail if user already has active subscription', async () => {
      const response = await request(app)
        .post(`/api/subscriptions/subscribe/${freePlanId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already has an active subscription');
    });
  });

  describe('GET /api/subscriptions/my-subscription', () => {
    it('should fetch user subscription', async () => {
      const response = await request(app)
        .get('/api/subscriptions/my-subscription')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.hasActiveSubscription).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /api/subscriptions/cancel/:subscriptionId', () => {
    it('should cancel user subscription', async () => {
      const subscription = await Subscription.findOne({ userId });
      
      const response = await request(app)
        .post(`/api/subscriptions/cancel/${subscription._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Test cancellation' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('canceled');
    });
  });

  describe('POST /api/subscriptions/upgrade/:subscriptionId', () => {
    it('should upgrade subscription to higher plan', async () => {
      // Create new subscription first
      const subscription = new Subscription({
        userId,
        planId: freePlanId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
      await subscription.save();

      const response = await request(app)
        .post(`/api/subscriptions/upgrade/${subscription._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ newPlanId: proPlanId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.plan.name).toBe('pro');
    });
  });

  describe('POST /api/subscriptions/usage/:subscriptionId', () => {
    it('should update subscription usage', async () => {
      const subscription = await Subscription.findOne({ userId });
      
      const response = await request(app)
        .post(`/api/subscriptions/usage/${subscription._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          usage: {
            apiCalls: 50,
            storage: 200,
            users: 3
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.usage.apiCalls).toBe(50);
    });
  });
});

// Helper function to generate test JWT token
function generateTestToken(userId) {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}