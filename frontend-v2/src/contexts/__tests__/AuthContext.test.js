import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { jwtDecode } from 'jwt-decode';

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

const TestComponent = () => {
  const { auth, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{auth ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{auth?.user?.username || 'no-user'}</div>
      <button onClick={() => login({ token: 'test-token', user: { username: 'testuser' } })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Mock jwtDecode to return a valid token structure
    jwtDecode.mockImplementation((token) => {
      if (token === 'existing-token' || token === 'test-token') {
        return { exp: Math.floor(Date.now() / 1000) + 3600 }; // Valid for 1 hour
      }
      return { exp: Math.floor(Date.now() / 1000) - 3600 }; // Expired
    });
  });

  it('should provide initial auth state from localStorage', async () => {
    localStorage.setItem('token', 'existing-token');
    localStorage.setItem('user', JSON.stringify({ username: 'existing-user' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('existing-user');
  });

  it('should provide null auth state when no token in localStorage', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('should login and update auth state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    await act(async () => {
      screen.getByText('Login').click();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    expect(setItemSpy).toHaveBeenCalledWith('token', 'test-token');
    expect(setItemSpy).toHaveBeenCalledWith('user', JSON.stringify({ username: 'testuser' }));
    
    setItemSpy.mockRestore();
  });

  it('should logout and clear auth state', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));

    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(removeItemSpy).toHaveBeenCalledWith('token');
    expect(removeItemSpy).toHaveBeenCalledWith('user');
    
    removeItemSpy.mockRestore();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within AuthProvider');

    consoleError.mockRestore();
  });
});

