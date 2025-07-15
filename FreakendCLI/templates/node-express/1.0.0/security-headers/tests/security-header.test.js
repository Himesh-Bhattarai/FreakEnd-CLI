
const request = require('supertest');
const express = require('express');
const securityHeadersMiddleware = require('../middleware/security-header.middleware');

describe('Security Headers Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    
    // Test route
    app.get('/test', (req, res) => {
      res.json({ message: 'Test route' });
    });
  });

  afterEach(() => {
    // Reset environment variables
    delete process.env.ENABLE_SECURITY_HEADERS;
    delete process.env.CSP_DEFAULT_SRC;
    delete process.env.HSTS_MAX_AGE;
  });

  describe('When security headers are enabled', () => {
    beforeEach(() => {
      process.env.ENABLE_SECURITY_HEADERS = 'true';
      app.use(securityHeadersMiddleware);
    });

    it('should apply default security headers', async () => {
      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(response.headers['strict-transport-security']).toMatch(/max-age=31536000/);
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('should apply custom CSP from environment', async () => {
      process.env.CSP_DEFAULT_SRC = "'self' https://example.com";
      
      // Re-create app with new env
      app = express();
      app.use(securityHeadersMiddleware);
      app.get('/test', (req, res) => res.json({ message: 'Test' }));

      const response = await request(app).get('/test');

      expect(response.headers['content-security-policy']).toContain("default-src 'self' https://example.com");
    });

    it('should apply custom HSTS max age', async () => {
      process.env.HSTS_MAX_AGE = '63072000'; // 2 years
      
      // Re-create app with new env
      app = express();
      app.use(securityHeadersMiddleware);
      app.get('/test', (req, res) => res.json({ message: 'Test' }));

      const response = await request(app).get('/test');

      expect(response.headers['strict-transport-security']).toContain('max-age=63072000');
    });

    it('should include X-Request-ID header', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.headers['x-request-id']).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('should include Permissions-Policy header', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['permissions-policy']).toBeDefined();
    });
  });

  describe('When security headers are disabled', () => {
    beforeEach(() => {
      process.env.ENABLE_SECURITY_HEADERS = 'false';
      app.use(securityHeadersMiddleware);
    });

    it('should not apply security headers', async () => {
      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.headers['x-content-type-options']).toBeUndefined();
      expect(response.headers['x-frame-options']).toBeUndefined();
      expect(response.headers['strict-transport-security']).toBeUndefined();
      expect(response.headers['content-security-policy']).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      process.env.ENABLE_SECURITY_HEADERS = 'true';
    });

    it('should continue processing even with invalid configuration', async () => {
      process.env.HSTS_MAX_AGE = 'invalid';
      
      app.use(securityHeadersMiddleware);
      
      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      // Should still apply default headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Custom headers', () => {
    beforeEach(() => {
      process.env.ENABLE_SECURITY_HEADERS = 'true';
      process.env.CUSTOM_SECURITY_HEADERS = '{"X-Custom-Header": "custom-value"}';
      app.use(securityHeadersMiddleware);
    });

    it('should apply custom headers', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-custom-header']).toBe('custom-value');
    });
  });
});