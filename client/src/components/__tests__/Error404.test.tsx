import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFoundPage from '../Error404';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('NotFoundPage (Error404)', () => {
  it('renders without crashing', () => {
    render(<NotFoundPage />, { wrapper: RouterWrapper });
    expect(document.body.innerHTML).not.toBe('');
  });

  it('displays 404 error message', () => {
    render(<NotFoundPage />, { wrapper: RouterWrapper });
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it('displays helpful error description', () => {
    render(<NotFoundPage />, { wrapper: RouterWrapper });
    expect(screen.getByText(/lost in space/i)).toBeInTheDocument();
  });

  it('has a back to home link', () => {
    render(<NotFoundPage />, { wrapper: RouterWrapper });
    const homeLink = screen.getByRole('link', { name: /back to home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('displays the 404 numbers', () => {
    render(<NotFoundPage />, { wrapper: RouterWrapper });
    const fours = screen.getAllByText('4');
    expect(fours.length).toBe(2);
  });
});
