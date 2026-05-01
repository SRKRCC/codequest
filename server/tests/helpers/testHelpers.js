
import request from 'supertest';
import { User } from '../../models/User.js';
import { Challenge } from '../../models/Challenge.js';
import { redisRateLimitMiddleware } from '../../middleware/redisRateLimiter.js';
export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    name: 'Test Setup User',
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
    username: `user${Date.now()}`,
    isVerified: true
  };
  
  const userData = { ...defaultUser, ...overrides };
  
  if (userData.password && !userData.password.startsWith('$2a$')) {
     const bcrypt = (await import('bcryptjs')).default;
     userData.password = await bcrypt.hash(userData.password, 10);
  }
  


  const user = await User.create(userData);
  return { user, originalPassword: overrides.password || defaultUser.password };
};

export const loginAs = async (app, user, password) => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({
            email: user.email,
            password: password
        });
    
    if (!res.headers['set-cookie']) {
        console.error('Login Failed:', res.status, res.body);
    }
    return res.headers['set-cookie'];
};

export const createTestChallenge = async (overrides = {}) => {
    const defaultChallenge = {
        title: `Test Challenge ${Date.now()}`,
        description: 'A test challenge description',
        category: ['Arrays'],
        difficulty: 'Easy',
        points: 10,
        problemLink: 'https://example.com/problem',
        platform: 'LeetCode',
        isPOTD: false
    };

    return await Challenge.create({ ...defaultChallenge, ...overrides });
};

export const clearRateLimits = async (redisClient) => {
    if (redisClient) {
    }
};
