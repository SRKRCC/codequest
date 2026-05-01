
import { jest } from '@jest/globals';
import request from 'supertest';
import { User } from '../models/User.js';
import { mockCacheService } from './helpers/mocks.js';

jest.unstable_mockModule('../services/cacheService.js', () => ({
  default: mockCacheService
}));

const app = (await import('../app.js')).default;

describe('Leaderboard API (Strict)', () => {
  beforeEach(async () => {
    mockCacheService.get.mockClear();
    mockCacheService.set.mockClear();
    
    await User.deleteMany({});
    
    await User.create([
      {
        name: 'User 1',
        email: 'user1@test.com',
        username: 'user1',
        isVerified: true,
        points: 100,
        solveChallenges: {
            easy: [{ timestamp: '2023-01-01T10:00:00Z' }]
        }
      },
      {
        name: 'User 2',
        email: 'user2@test.com',
        username: 'user2',
        isVerified: true,
        points: 200,
        solveChallenges: {
            medium: [{ timestamp: '2023-01-01T12:00:00Z' }]
        }
      },
      {
        name: 'User 3',
        email: 'user3@test.com',
        username: 'user3',
        isVerified: true,
        points: 100,
        solveChallenges: {
            easy: [{ timestamp: '2023-01-01T09:00:00Z' }]
        }
      }
    ]);
  });

  it('should return leaderboard sorted by points desc, then time asc', async () => {
    mockCacheService.get.mockResolvedValue(null);

    const res = await request(app).get('/api/leaderboard');

    expect(res.status).toBe(200);
    const users = res.body.users;
    
    // Expected order:
    // 1. User 2 (200 pts)
    // 2. User 3 (100 pts, earlier time)
    // 3. User 1 (100 pts, later time)
    
    expect(users).toHaveLength(3);
    
    // User 2
    expect(users[0].username).toBe('user2');
    expect(users[0].rank).toBe(1);
    expect(users[0].points).toBe(200);

    // User 3
    expect(users[1].username).toBe('user3');
    expect(users[1].rank).toBe(2);
    expect(users[1].points).toBe(100);

    // User 1
    expect(users[2].username).toBe('user1');
    expect(users[2].rank).toBe(3);
    expect(users[2].points).toBe(100);
  });

  it('should use cached leaderboard if available', async () => {
    const cachedData = [
       { username: 'cachedUser', points: 999, rank: 1 }
    ];
    // Mock cache hit for full leaderboard
    // getCachedLeaderboard calls cacheService.get(NAMESPACE, 'full_leaderboard')
    // getLeaderBoard calls cacheService.get(NAMESPACE, 'paginated_...') before that
    
    // First call: paginated cache miss
    // Second call: full leaderboard hit
    mockCacheService.get.mockImplementation(async (namespace, key) => {
        if (key === 'full_leaderboard') return cachedData;
        return null; // paginated miss
    });

    const res = await request(app).get('/api/leaderboard');
    
    expect(res.status).toBe(200);
    expect(res.body.users[0].username).toBe('cachedUser');
    expect(mockCacheService.get).toHaveBeenCalledTimes(1); // Controller only fetches full leaderboard
  });

  it('should support pagination', async () => {
    mockCacheService.get.mockResolvedValue(null); // Force recalculation

    const res = await request(app).get('/api/leaderboard?page=1&limit=1');
    
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.totalUsers).toBe(3);
    expect(res.body.users[0].username).toBe('user2'); // Top ranked
  });

  it('should filter by username search', async () => {
    mockCacheService.get.mockResolvedValue(null);

    const res = await request(app).get('/api/leaderboard?search=user3');
    
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0].username).toBe('user3');
  });
});
