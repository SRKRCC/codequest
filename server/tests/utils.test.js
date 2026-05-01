import { calculatePoints } from '../utils/pointsCalculator.js';
import { getISTNow, getISTDateBounds, formatISTDateString } from '../utils/timezone.js';

describe('Utility Functions', () => {
  describe('Points Calculator', () => {
    it('should return 5 points for Easy difficulty', () => {
      const points = calculatePoints('Easy');
      expect(points).toBe(5);
    });

    it('should return 10 points for Medium difficulty', () => {
      const points = calculatePoints('Medium');
      expect(points).toBe(10);
    });

    it('should return 15 points for Hard difficulty', () => {
      const points = calculatePoints('Hard');
      expect(points).toBe(15);
    });

    it('should return 0 points for invalid difficulty', () => {
      const points = calculatePoints('invalid');
      expect(points).toBe(0);
    });

    it('should return 0 for undefined difficulty', () => {
      const points = calculatePoints(undefined);
      expect(points).toBe(0);
    });

    it('should be case-sensitive (lowercase returns 0)', () => {
      const points = calculatePoints('easy');
      expect(points).toBe(0);
    });
  });

  describe('Timezone Utilities', () => {
    describe('getISTNow', () => {
      it('should return a Date object', () => {
        const now = getISTNow();
        expect(now instanceof Date).toBe(true);
      });

      it('should return a valid date', () => {
        const now = getISTNow();
        expect(isNaN(now.getTime())).toBe(false);
      });
    });

    describe('getISTDateBounds', () => {
      it('should return start and end properties', () => {
        const bounds = getISTDateBounds();
        
        // Returns {start, end} based on actual implementation
        expect(bounds).toHaveProperty('start');
        expect(bounds).toHaveProperty('end');
      });

      it('should have start before end', () => {
        const bounds = getISTDateBounds();
        
        expect(bounds.start.getTime()).toBeLessThan(bounds.end.getTime());
      });

      it('should return Date objects', () => {
        const bounds = getISTDateBounds();
        
        expect(bounds.start instanceof Date).toBe(true);
        expect(bounds.end instanceof Date).toBe(true);
      });
    });

    describe('formatISTDateString', () => {
      it('should return a string', () => {
        const result = formatISTDateString(new Date());
        expect(typeof result).toBe('string');
      });

      it('should return date in YYYY-MM-DD format', () => {
        const result = formatISTDateString(new Date());
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });

      it('should handle specific dates', () => {
        const testDate = new Date('2024-06-15T12:00:00Z');
        const result = formatISTDateString(testDate);
        
        expect(typeof result).toBe('string');
        expect(result.length).toBe(10);
      });
    });
  });
});
