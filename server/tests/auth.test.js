
import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

// Mock emailService directly to avoid nodemailer issues
const mockEmailService = {
  sendOTPEmail: jest.fn().mockResolvedValue(true),
  sendResetPassEmail: jest.fn().mockResolvedValue(true),
  deleteConfirmationMail: jest.fn().mockResolvedValue(true)
};

jest.unstable_mockModule('../utils/emailService.js', () => mockEmailService);

// Dynamic import app after mocks
const app = (await import('../app.js')).default;

describe('Auth API (Strict)', () => {
    afterAll(() => {
        jest.restoreAllMocks();
    });

  beforeEach(async () => {
    // Clear mocks
    mockEmailService.sendOTPEmail.mockClear();
    mockEmailService.sendResetPassEmail.mockClear();
    
    // Clear users
    await User.deleteMany({});
  });

  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
    username: 'testu_1',
    registrationNumber: 'REG123456',
    branch: 'Computer Science',
    collegeName: 'Test College',
    isAffiliate: false
  };

  describe('Registration & Verification Flow', () => {
    it('should register successfully and send OTP email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      if (res.status !== 201) {
          console.error('Registration failed:', JSON.stringify(res.body, null, 2));
      }

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("OTP sent to email. Verify to complete registration.");
      
      const user = await User.findOne({ email: validUser.email });
      expect(user).toBeDefined();
      expect(user.isVerified).toBe(false);
      expect(user.otp).toBeDefined();
      
      expect(mockEmailService.sendOTPEmail).toHaveBeenCalledWith(
          expect.stringContaining(validUser.email), 
          expect.any(String)
      );
    });

    it('should verify email with correct OTP', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const user = await User.findOne({ email: validUser.email });
      
      const res = await request(app)
        .post('/api/auth/verify')
        .send({
          email: validUser.email,
          otp: user.otp
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Email verified and user registered successfully!");

      const verifiedUser = await User.findOne({ email: validUser.email });
      expect(verifiedUser.isVerified).toBe(true);
      expect(verifiedUser.otp).toBeNull();
    });

    it('should reject invalid OTP', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      
      const res = await request(app)
        .post('/api/auth/verify')
        .send({
          email: validUser.email,
          otp: 123456 // Wrong OTP
        });

      expect(res.status).toBe(500); 
      expect(res.body.error).toBe("Invalid OTP");
      
      const user = await User.findOne({ email: validUser.email });
      expect(user.isVerified).toBe(false);
    });
  });

  describe('Login Flow', () => {
    beforeEach(async () => {
      const bcrypt = (await import('bcryptjs')).default;
      const hashedPassword = await bcrypt.hash(validUser.password, 10);
      
      await User.create({
        ...validUser,
        password: hashedPassword,
        isVerified: true
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Login Successful");
      
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('jwt=');
    });

    it('should block unverified users', async () => {
      await User.updateOne({ email: validUser.email }, { isVerified: false });
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email not verified");
    });
  });

  describe('Password Reset Flow', () => {
    beforeEach(async () => {
      const bcrypt = (await import('bcryptjs')).default;
      const hashedPassword = await bcrypt.hash(validUser.password, 10);
      await User.create({
        ...validUser,
        password: hashedPassword,
        isVerified: true
      });
    });

    it('should send reset link', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: validUser.email });

      expect(res.status).toBe(200);
      expect(mockEmailService.sendResetPassEmail).toHaveBeenCalled();
       
      const user = await User.findOne({ email: validUser.email });
      expect(user.resetPasswordToken).toBeDefined();
    });

    it('should reset password with valid token', async () => {
      await request(app).post('/api/auth/forgot-password').send({ email: validUser.email });
      const user = await User.findOne({ email: validUser.email });
      const token = user.resetPasswordToken;

      const newPassword = "NewPassword123!";
      const res = await request(app)
        .post(`/api/auth/reset-password/${token}`)
        .send({ newPassword });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password reset successful");

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: newPassword
        });

      expect(loginRes.status).toBe(200);
    });
  });
});
