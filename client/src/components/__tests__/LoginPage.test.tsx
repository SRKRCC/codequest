import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../Login';

vi.mock('axios');

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    user: null,
    isAuthenticated: false,
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/components/particles-background', () => ({
  ParticlesBackground: () => <div data-testid="particles" />,
}));
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<LoginPage />, { wrapper: RouterWrapper });
    expect(document.body.innerHTML).not.toBe('');
  });

  it('displays the login form title', () => {
    render(<LoginPage />, { wrapper: RouterWrapper });
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  it('has email input field', () => {
    render(<LoginPage />, { wrapper: RouterWrapper });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('has password input field', () => {
    render(<LoginPage />, { wrapper: RouterWrapper });
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('has sign in button', () => {
    render(<LoginPage />, { wrapper: RouterWrapper });
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('has OAuth buttons (Google and GitHub)', () => {
    render(<LoginPage />, { wrapper: RouterWrapper });
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument();
  });

  it('has forgot password link', () => {
    render(<LoginPage />, { wrapper: RouterWrapper });
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('has sign up link', () => {
    render(<LoginPage />, { wrapper: RouterWrapper });
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: RouterWrapper });
    
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/please enter both email and password/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: RouterWrapper });
    
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    expect(passwordInput).toBeTruthy();
    
    expect(passwordInput.type).toBe('password');
    
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleButton);
    
    expect(passwordInput.type).toBe('text');
  });

  it('allows typing in email field', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: RouterWrapper });
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');
    
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('allows typing in password field', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: RouterWrapper });
    
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    await user.type(passwordInput, 'password123');
    
    expect(passwordInput.value).toBe('password123');
  });
});
