
import { jest } from '@jest/globals';

export const mockNodemailer = {
  createTransporter: jest.fn().mockReturnValue({
    verify: jest.fn().mockResolvedValue(true),
    sendMail: jest.fn().mockResolvedValue({ messageId: 'opt-123' }),
  }),
};

export const mockBullMQ = {
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'job-123' }),
    close: jest.fn().mockResolvedValue(),
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(),
  })),
};

export const mockPlatforms = {
  fetchLeetCodeData: jest.fn().mockResolvedValue({
    solved: 100,
    rank: 5000,
    rating: 1500
  }),
  fetchCodeforcesData: jest.fn().mockResolvedValue({
    solved: 50,
    rank: 'Expert',
    rating: 1600
  })
};

export const mockCacheService = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockResolvedValue(true),
  flush: jest.fn().mockResolvedValue(true),
  getStats: jest.fn().mockReturnValue({ keys: 0 }),
  isRedisConnected: jest.fn().mockReturnValue(true),
  isRedisAvailable: true
};

export const mockCloudinary = {
  uploader: {
    upload: jest.fn().mockResolvedValue({
      secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/profile.jpg',
      public_id: 'profile_123'
    }),
    destroy: jest.fn().mockResolvedValue({ result: 'ok' })
  },
  config: jest.fn()
};
