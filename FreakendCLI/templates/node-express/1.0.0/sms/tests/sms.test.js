const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app'); // Adjust path as needed
const { OTP, SMSRateLimit } = require('../models/sms.models');
const OTPUtils = require('../utils/otp.utils');

// Mock Twilio
jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'mock-message-id',
        status: 'sent',
        to: '+1234567890',
        from: '+1987654321'
      })
    }
  }));
});

describe('SMS Service', () => {
  let testPhoneNumber;
  let generatedOTP;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_sms');
    testPhoneNumber = '+1234567890';
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await OTP.deleteMany({});
    await SMSRateLimit.deleteMany({});
  });

  describe('POST /api/sms/send-otp', () => {
    it('should send OTP successfully', async () => {
      const response = await request(app)
        .post('/api/sms/send-otp')
        .send({
          phoneNumber: testPhoneNumber,
          purpose: 'verification'
        })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('OTP already sent');
    });

    it('should handle rate limiting', async () => {
      const maxAttempts = 5;
      const promises = [];

      // Send multiple requests simultaneously
      for (let i = 0; i < maxAttempts + 1; i++) {
        promises.push(
          request(app)
            .post('/api/sms/send-otp')
            .send({
              phoneNumber: `+123456789${i}`,
              purpose: 'verification'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Last request should be rate limited
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.status).toBe(429);
    });
  });

  describe('POST /api/sms/verify-otp', () => {
    beforeEach(async () => {
      // Create a test OTP
      generatedOTP = OTPUtils.generateOTP(6);
      const otpRecord = new OTP({
        phoneNumber: testPhoneNumber,
        otpHash: generatedOTP,
        expiresAt: OTPUtils.calculateExpiryTime(5),
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });
      await otpRecord.save();
    });

    it('should verify OTP successfully', async () => {
      const response = await request(app)
        .post('/api/sms/verify-otp')
        .send({
          phoneNumber: testPhoneNumber,
          otp: generatedOTP
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.verified).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.message).toBe('OTP verified successfully');

      // Verify OTP was marked as verified in database
      const otpRecord = await OTP.findOne({ phoneNumber: testPhoneNumber });
      expect(otpRecord.isVerified).toBe(true);
      expect(otpRecord.verifiedAt).toBeTruthy();
    });

    it('should reject invalid OTP', async () => {
      const response = await request(app)
        .post('/api/sms/verify-otp')
        .send({
          phoneNumber: testPhoneNumber,
          otp: '000000'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid OTP');
      expect(response.body.remainingAttempts).toBeDefined();
    });

    it('should handle expired OTP', async () => {
      // Create expired OTP
      const expiredOTP = new OTP({
        phoneNumber: '+1987654321',
        otpHash: '123456',
        expiresAt: new Date(Date.now() - 10000), // 10 seconds ago
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });
      await expiredOTP.save();

      const response = await request(app)
        .post('/api/sms/verify-otp')
        .send({
          phoneNumber: '+1987654321',
          otp: '123456'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('OTP has expired');
    });

    it('should handle max attempts reached', async () => {
      // Make 3 failed attempts
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/sms/verify-otp')
          .send({
            phoneNumber: testPhoneNumber,
            otp: '000000'
          });
      }

      const response = await request(app)
        .post('/api/sms/verify-otp')
        .send({
          phoneNumber: testPhoneNumber,
          otp: '000000'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Maximum attempts reached');
    });

    it('should reject missing phone number', async () => {
      const response = await request(app)
        .post('/api/sms/verify-otp')
        .send({
          otp: '123456'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject missing OTP', async () => {
      const response = await request(app)
        .post('/api/sms/verify-otp')
        .send({
          phoneNumber: testPhoneNumber
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/sms/resend-otp', () => {
    it('should resend OTP successfully', async () => {
      // Send initial OTP
      const firstResponse = await request(app)
        .post('/api/sms/send-otp')
        .send({
          phoneNumber: testPhoneNumber,
          purpose: 'verification'
        })
        .expect(200);

      // Wait a moment to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      // Resend OTP
      const response = await request(app)
        .post('/api/sms/resend-otp')
        .send({
          phoneNumber: testPhoneNumber
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('OTP sent successfully');
      expect(response.body.otpId).not.toBe(firstResponse.body.otpId);
    });
  });

  describe('GET /api/sms/status/:phoneNumber', () => {
    let authToken;

    beforeEach(async () => {
      // Generate a test JWT token
      const jwt = require('jsonwebtoken');
      authToken = jwt.sign(
        { phoneNumber: testPhoneNumber },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      // Create a test OTP
      const otpRecord = new OTP({
        phoneNumber: testPhoneNumber,
        otpHash: '123456',
        expiresAt: OTPUtils.calculateExpiryTime(5),
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });
      await otpRecord.save();
    });

    it('should return OTP status with valid token', async () => {
      const response = await request(app)
        .get(`/api/sms/status/${encodeURIComponent(testPhoneNumber)}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBeDefined();
      expect(response.body.status.phoneNumber).toContain('*');
      expect(response.body.status.isExpired).toBe(false);
      expect(response.body.status.timeLeft).toBeGreaterThan(0);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get(`/api/sms/status/${encodeURIComponent(testPhoneNumber)}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get(`/api/sms/status/${encodeURIComponent(testPhoneNumber)}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });
  });

  describe('GET /api/sms/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/sms/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.service).toBe('SMS Service');
      expect(response.body.status).toBe('healthy');
      expect(response.body.configured).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('OTP Utilities', () => {
    it('should generate OTP of specified length', () => {
      const otp4 = OTPUtils.generateOTP(4);
      const otp6 = OTPUtils.generateOTP(6);
      const otp8 = OTPUtils.generateOTP(8);

      expect(otp4).toHaveLength(4);
      expect(otp6).toHaveLength(6);
      expect(otp8).toHaveLength(8);
      expect(/^\d+$/.test(otp4)).toBe(true);
      expect(/^\d+$/.test(otp6)).toBe(true);
      expect(/^\d+$/.test(otp8)).toBe(true);
    });

    it('should format phone numbers correctly', () => {
      expect(OTPUtils.formatPhoneNumber('1234567890')).toBe('+11234567890');
      expect(OTPUtils.formatPhoneNumber('+1234567890')).toBe('+1234567890');
      expect(OTPUtils.formatPhoneNumber('(123) 456-7890')).toBe('+11234567890');
    });

    it('should validate phone numbers', () => {
      expect(OTPUtils.isValidPhoneNumber('+1234567890')).toBe(true);
      expect(OTPUtils.isValidPhoneNumber('+12345678901')).toBe(true);
      expect(OTPUtils.isValidPhoneNumber('invalid')).toBe(false);
      expect(OTPUtils.isValidPhoneNumber('123')).toBe(false);
    });

    it('should mask phone numbers', () => {
      expect(OTPUtils.maskPhoneNumber('+1234567890')).toBe('+******7890');
      expect(OTPUtils.maskPhoneNumber('1234567890')).toBe('******7890');
    });

    it('should calculate expiry time correctly', () => {
      const now = new Date();
      const expiry = OTPUtils.calculateExpiryTime(5);
      const expectedExpiry = new Date(now.getTime() + 5 * 60 * 1000);
      
      expect(expiry.getTime()).toBeCloseTo(expectedExpiry.getTime(), -3);
    });
  });
});