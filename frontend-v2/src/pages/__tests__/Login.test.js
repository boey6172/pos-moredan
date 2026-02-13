import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import axios from '../../api/axios';

// Mock axios
jest.mock('../../api/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderLogin = () => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </ThemeProvider>
  );
};

const mockedAxios = axios;

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should render login form', () => {
    renderLogin();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should disable submit button when fields are empty', () => {
    renderLogin();
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when fields are filled', () => {
    renderLogin();
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('should toggle password visibility', () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByLabelText(/toggle password visibility/i);

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should handle successful login', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        user: { username: 'testuser' },
      },
    };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    renderLogin();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
        username: 'testuser',
        password: 'testpass',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('should display error message on login failure', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    };
    mockedAxios.post.mockRejectedValueOnce(mockError);

    renderLogin();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should handle Enter key press to submit', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        user: { username: 'testuser' },
      },
    };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    renderLogin();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.keyPress(passwordInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });
});

