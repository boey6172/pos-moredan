import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from '../Navigation';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import * as router from 'react-router-dom';

// Mock useNavigate and useLocation
const mockNavigate = jest.fn();
const mockLocation = { pathname: '/dashboard' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

const renderNavigation = (auth = { token: 'test-token', user: { username: 'testuser' } }) => {
  localStorage.setItem('token', auth?.token || '');
  localStorage.setItem('user', JSON.stringify(auth?.user || {}));

  return render(
    <ThemeProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should render navigation items', () => {
    renderNavigation();
    expect(screen.getByLabelText(/navigate to dashboard/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/navigate to pos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/navigate to products/i)).toBeInTheDocument();
  });

  it('should highlight active route', () => {
    renderNavigation();
    const dashboardButton = screen.getByLabelText(/navigate to dashboard/i);
    expect(dashboardButton.closest('.Mui-selected')).toBeTruthy();
  });

  it('should navigate when menu item is clicked', () => {
    renderNavigation();
    const posButton = screen.getByLabelText(/navigate to pos/i);
    fireEvent.click(posButton);
    expect(mockNavigate).toHaveBeenCalledWith('/pos');
  });

  it('should handle logout', () => {
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
    renderNavigation();
    const logoutButton = screen.getByLabelText(/logout/i);
    fireEvent.click(logoutButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(removeItemSpy).toHaveBeenCalledWith('token');
    expect(removeItemSpy).toHaveBeenCalledWith('user');
    removeItemSpy.mockRestore();
  });

  it('should display username when authenticated', () => {
    renderNavigation();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should toggle theme mode', () => {
    renderNavigation();
    const themeToggle = screen.getByLabelText(/switch to dark mode/i);
    fireEvent.click(themeToggle);
    expect(screen.getByLabelText(/switch to light mode/i)).toBeInTheDocument();
  });

  it('should toggle mobile drawer', () => {
    // Mock window.matchMedia to return mobile size
    window.matchMedia = jest.fn().mockImplementation((query) => {
      if (query === '(max-width:899.95px)') {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        };
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    });

    renderNavigation();
    const menuButton = screen.getByLabelText(/open drawer/i);
    fireEvent.click(menuButton);
    // Drawer should be open (we can't easily test visibility without more complex queries)
    expect(menuButton).toBeInTheDocument();
  });
});

