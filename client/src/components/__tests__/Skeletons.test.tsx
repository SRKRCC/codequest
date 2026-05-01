import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

describe('Skeleton Components', () => {
  describe('ChallengesSkeleton', async () => {
    const { default: ChallengesSkeleton } = await import('../challenges-skeleton');

    it('renders without crashing', () => {
      render(<ChallengesSkeleton />);
      expect(document.body.innerHTML).not.toBe('');
    });

    it('shows loading placeholder elements', () => {
      const { container } = render(<ChallengesSkeleton />);
      const pulsingElements = container.querySelectorAll('[class*="animate-pulse"]');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });
  });

  describe('LeaderboardSkeleton', async () => {
    const { default: LeaderboardSkeleton } = await import('../leaderboard-skeleton');

    it('renders without crashing', () => {
      render(<LeaderboardSkeleton />);
      expect(document.body.innerHTML).not.toBe('');
    });

    it('shows loading placeholder elements', () => {
      const { container } = render(<LeaderboardSkeleton />);
      const pulsingElements = container.querySelectorAll('[class*="animate-pulse"]');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });
  });

  describe('ProfileSkeleton', async () => {
    const { default: ProfileSkeleton } = await import('../profile-skeleton');

    it('renders without crashing', () => {
      render(<ProfileSkeleton />);
      expect(document.body.innerHTML).not.toBe('');
    });

    it('shows loading placeholder elements', () => {
      const { container } = render(<ProfileSkeleton />);
      const pulsingElements = container.querySelectorAll('[class*="animate-pulse"]');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });
  });
});
