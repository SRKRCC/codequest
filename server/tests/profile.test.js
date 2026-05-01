
import { jest } from '@jest/globals';
import request from 'supertest';
import { User } from '../models/User.js';
import { mockCacheService, mockCloudinary } from './helpers/mocks.js';

// Mock dependencies
jest.unstable_mockModule('../services/cacheService.js', () => ({
  default: mockCacheService
}));

jest.unstable_mockModule('../config/cloudinary.js', () => ({
  default: mockCloudinary
}));

// Mock updateRanks from leaderBoardCache as it is called in updateUserStreak
jest.unstable_mockModule('../utils/leaderBoardCache.js', () => ({
    updateRanks: jest.fn().mockResolvedValue([]),
    getCachedLeaderboard: jest.fn().mockResolvedValue([]),
    getLeaderBoard: jest.fn().mockResolvedValue({ users: [] }),
    warmupLeaderboardCache: jest.fn().mockResolvedValue(true)
}));

const app = (await import('../app.js')).default;
const { createTestUser, loginAs } = await import('./helpers/testHelpers.js');

describe('Profile API (Strict)', () => {
  beforeEach(async () => {
    // Clear mocks
    mockCacheService.get.mockClear();
    mockCacheService.set.mockClear();
    mockCloudinary.uploader.upload.mockClear();
    
    // Clear DB
    await User.deleteMany({});
  });

  describe('GET /api/profile', () => {
    it('should return authenticated user profile', async () => {
      const { user, originalPassword } = await createTestUser();
      const cookie = await loginAs(app, user, originalPassword);

      mockCacheService.get.mockResolvedValue(null); // Cache miss

      const res = await request(app)
        .get('/api/profile/me')
        .set('Cookie', cookie);

      if (res.status !== 200) console.error('GET /me Error:', res.status, res.body);
      expect(res.status).toBe(200);
      expect(res.body.username).toBe(user.username);
      expect(res.body.email).toBe(user.email);
      expect(res.body.password).toBeUndefined(); // Security check
      
      // Should attempt to cache the profile
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should return cached profile if available', async () => {
      const { user, originalPassword } = await createTestUser();
      const cookie = await loginAs(app, user, originalPassword);

      const cachedProfile = { ...user.toObject(), name: 'Cached Name' };
      mockCacheService.get.mockResolvedValue(cachedProfile);

      const res = await request(app)
        .get('/api/profile/me')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Cached Name'); // Should come from cache
      expect(mockCacheService.get).toHaveBeenCalled();
    });
  });

  describe('PUT /api/profile', () => {
    it('should update user profile details', async () => {
      const { user, originalPassword } = await createTestUser();
      const cookie = await loginAs(app, user, originalPassword);

      const updateData = {
        name: 'Updated Name',
        about: 'New about me',
        branch: 'IT',
        otherLinks: [{ platform: 'github', url: 'https://github.com/new' }]
      };

      const res = await request(app)
        .put('/api/profile/update')
        .set('Cookie', cookie)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('Updated Name');
      expect(res.body.user.otherLinks).toHaveLength(1);
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).toBe('Updated Name');
    });

    it('should handle image upload', async () => {
      const { user, originalPassword } = await createTestUser();
      const cookie = await loginAs(app, user, originalPassword);

      const res = await request(app)
        .put('/api/profile/update')
        .set('Cookie', cookie)
        .send({
          image: 'data:image/jpeg;base64,sampleimage'
        });

      expect(res.status).toBe(200);
      expect(mockCloudinary.uploader.upload).toHaveBeenCalled();
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.profilePicture).toContain('res.cloudinary.com');
    });
  });

  describe('GET /api/user/:username (Public Profile)', () => {
    it('should return public profile', async () => {
      const { user } = await createTestUser({ username: 'publicuser' });
      mockCacheService.get.mockResolvedValue(null);

      const res = await request(app).get('/api/user/publicuser');

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe('publicuser');
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.email).toBeDefined(); // Controller sends email
    });

    it('should return 404 for non-existent user', async () => {
      mockCacheService.get.mockResolvedValue(null);
      const res = await request(app).get('/api/user/unknownuser');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/profile/streak', () => {
    it('should update streak if solved yesterday', async () => {
      const { user, originalPassword } = await createTestUser();
      const cookie = await loginAs(app, user, originalPassword);

      // Simulate solved yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      user.potdSolved = [{ timestamp: yesterday.toISOString() }];
      user.streak = 5;
      await user.save();

      const res = await request(app)
        .put('/api/profile/streak')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.streak).toBe(6);
      expect(res.body.success).toBe(true);
    });

    it('should reset streak if not solved yesterday', async () => {
      const { user, originalPassword } = await createTestUser();
      const cookie = await loginAs(app, user, originalPassword);

      // Simulate solved 2 days ago
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      user.potdSolved = [{ timestamp: twoDaysAgo.toISOString() }];
      user.streak = 5;
      await user.save();

      const res = await request(app)
        .put('/api/profile/streak')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.streak).toBe(1);
    });
  });
});
