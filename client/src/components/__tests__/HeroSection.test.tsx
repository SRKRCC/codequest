import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HeroSection } from '../hero-section';
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/components/particles-background', () => ({
  ParticlesBackground: () => <div data-testid="particles" />,
}));

const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('HeroSection', () => {
  const defaultStats = {
    usersCount: 1500,
    challengesCount: 250,
  };

  it('renders without crashing', () => {
    render(<HeroSection stats={defaultStats} />, { wrapper: RouterWrapper });
    expect(document.body.innerHTML).not.toBe('');
  });

  it('displays the main headline', () => {
    render(<HeroSection stats={defaultStats} />, { wrapper: RouterWrapper });
    expect(screen.getByText(/Level Up Your/i)).toBeInTheDocument();
    expect(screen.getByText(/Coding Skills/i)).toBeInTheDocument();
  });

  it('displays the tagline', () => {
    render(<HeroSection stats={defaultStats} />, { wrapper: RouterWrapper });
    expect(screen.getByText(/Daily coding challenges for everyone/i)).toBeInTheDocument();
  });

  it('displays the description', () => {
    render(<HeroSection stats={defaultStats} />, { wrapper: RouterWrapper });
    expect(screen.getByText(/CodeQuest delivers daily coding challenges/i)).toBeInTheDocument();
  });

  it('shows user count from stats', () => {
    render(<HeroSection stats={defaultStats} />, { wrapper: RouterWrapper });
    expect(screen.getByText(/1,500 active users/i)).toBeInTheDocument();
  });

  it('shows challenge count from stats', () => {
    render(<HeroSection stats={defaultStats} />, { wrapper: RouterWrapper });
    expect(screen.getByText(/250 coding challenges/i)).toBeInTheDocument();
  });

  it('has call-to-action buttons', () => {
    render(<HeroSection stats={defaultStats} />, { wrapper: RouterWrapper });
    expect(screen.getByText(/Start Your Journey/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore Challenges/i)).toBeInTheDocument();
  });

  it('links to register for non-authenticated users', () => {
    render(<HeroSection stats={defaultStats} />, { wrapper: RouterWrapper });
    const startLink = screen.getByText(/Start Your Journey/i).closest('a');
    expect(startLink).toHaveAttribute('href', '/register');
  });

  it('handles zero stats gracefully', () => {
    const zeroStats = { usersCount: 0, challengesCount: 0 };
    render(<HeroSection stats={zeroStats} />, { wrapper: RouterWrapper });
    expect(screen.getByText(/0 active users/i)).toBeInTheDocument();
  });
});
