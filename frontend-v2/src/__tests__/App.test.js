import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock all page components to simplify testing
jest.mock('../pages/Login', () => () => <div>Login Page</div>);
jest.mock('../pages/Dashboard', () => () => <div>Dashboard Page</div>);
jest.mock('../pages/POS/index', () => () => <div>POS Page</div>);
jest.mock('../pages/Products', () => () => <div>Products Page</div>);
jest.mock('../pages/Transactions', () => () => <div>Transactions Page</div>);
jest.mock('../pages/Users', () => () => <div>Users Page</div>);
jest.mock('../pages/Categories', () => () => <div>Categories Page</div>);
jest.mock('../pages/Inventory', () => () => <div>Inventory Page</div>);
jest.mock('../pages/Expenses', () => () => <div>Expenses Page</div>);
jest.mock('../pages/SalesItems', () => () => <div>SalesItems Page</div>);
jest.mock('../pages/Reports/index', () => () => <div>Reports Page</div>);
jest.mock('../components/Navigation', () => () => <nav>Navigation</nav>);

const renderApp = (initialPath = '/') => {
  window.history.pushState({}, 'Test page', initialPath);
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render without crashing', () => {
    renderApp();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    renderApp('/dashboard');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should show navigation when authenticated', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));

    renderApp('/dashboard');
    // Navigation should be present when authenticated
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });
});

