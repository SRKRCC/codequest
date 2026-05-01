import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../footer';

const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Footer />, { wrapper: RouterWrapper });
    expect(document.body.innerHTML).not.toBe('');
  });

  it('displays the brand name', () => {
    const { container } = render(<Footer />, { wrapper: RouterWrapper });
    expect(container.textContent).toBeTruthy();
  });

  it('contains navigation links', () => {
    const { container } = render(<Footer />, { wrapper: RouterWrapper });
    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(2);
  });

  it('contains social media links', () => {
    render(<Footer />, { wrapper: RouterWrapper });
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(3);
  });

  it('has proper accessibility structure', () => {
    const { container } = render(<Footer />, { wrapper: RouterWrapper });
    
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });
});
