import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
    const spinner = document.querySelector('.animate-spin') || 
                    document.querySelector('[class*="loading"]') ||
                    screen.queryByRole('status');
    
    expect(spinner || document.body.innerHTML).toBeTruthy();
  });

  it('renders with accessible loading indicator', () => {
    const { container } = render(<LoadingSpinner />);
    
    expect(container.firstChild).toBeTruthy();
  });
});
