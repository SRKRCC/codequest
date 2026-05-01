import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as any;

vi.mock('../../lib/axios', () => ({
  navigateTo: vi.fn(),
}));

const TestConsumer = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
      <span data-testid="user-name">{user?.name || 'no-user'}</span>
      <button onClick={login} data-testid="login-btn">Login</button>
      <button onClick={logout} data-testid="logout-btn">Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides default unauthenticated state', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Not authenticated'));
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });

  it('fetches user on mount', async () => {
    const mockUser = { _id: '123', email: 'test@example.com', name: 'Test User' };
    mockedAxios.get.mockResolvedValueOnce({ data: { user: mockUser, token: 'test-token' } });
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });
  });

  it('handles logout', async () => {
    const mockUser = { _id: '123', email: 'test@example.com', name: 'Test User' };
    mockedAxios.get.mockResolvedValueOnce({ data: { user: mockUser, token: 'test-token' } });
    mockedAxios.post.mockResolvedValueOnce({});
    
    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    await user.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });
  });
});
