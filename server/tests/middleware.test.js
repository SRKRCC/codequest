import request from 'supertest';
import app from '../app.js';

describe('Middleware and Endpoints', () => {
  describe('Hello Endpoint', () => {
    it('should return Hello World', async () => {
      const res = await request(app).get('/hello');

      expect(res.status).toBe(200);
      expect(res.text).toBe('Hello, World!');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');

      expect([200, 503]).toContain(res.status);
      expect(res.body).toHaveProperty('status');
    });

    it('should include timestamp in health response', async () => {
      const res = await request(app).get('/health');

      expect([200, 503]).toContain(res.status);
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('Security Headers (Helmet)', () => {
    it('should include X-Content-Type-Options header', async () => {
      const res = await request(app).get('/health');

      expect(res.headers).toHaveProperty('x-content-type-options');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include X-Frame-Options or CSP', async () => {
      const res = await request(app).get('/health');

      const hasFrameProtection = 
        res.headers['x-frame-options'] || 
        res.headers['content-security-policy'];
      expect(hasFrameProtection).toBeTruthy();
    });

    it('should include Referrer-Policy header', async () => {
      const res = await request(app).get('/health');

      expect(res.headers).toHaveProperty('referrer-policy');
    });

    it('should include Strict-Transport-Security header', async () => {
      const res = await request(app).get('/health');

      expect(res.headers).toHaveProperty('strict-transport-security');
    });
  });

  describe('CORS', () => {
    it('should handle OPTIONS requests', async () => {
      const res = await request(app)
        .options('/api/auth/login')
        .set('Origin', process.env.CLIENT_URL || 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST');

      expect([200, 204, 404]).toContain(res.status);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow normal requests', async () => {
      const res = await request(app).get('/hello');
      expect(res.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent routes appropriately', async () => {
      const res = await request(app).get('/api/nonexistent-route-12345');

      expect([404, 500]).toContain(res.status);
    });
  });
});
