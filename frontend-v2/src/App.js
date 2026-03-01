import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS/index';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory/index';
import Expenses from './pages/Expenses';
import Salaries from './pages/Salaries';
import SalesItems from './pages/SalesItems';
import Reports from './pages/Reports/index';
import Navigation from './components/Navigation';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const DRAWER_WIDTH = 280;

function AppRoutes() {
  const { auth } = useAuth();

  const getBasename = () => {
    if (process.env.REACT_APP_HOMEPAGE) {
      const homepage = process.env.REACT_APP_HOMEPAGE.trim();
      try {
        const url = new URL(homepage);
        return url.pathname;
      } catch {
        return homepage.startsWith('/') ? homepage : `/${homepage}`;
      }
    }
    if (process.env.REACT_APP_PUBLIC_URL) {
      return process.env.REACT_APP_PUBLIC_URL;
    }
    return process.env.PUBLIC_URL || '';
  };

  return (
    <Router basename={getBasename()}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {auth && <Navigation />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            minHeight: '100vh',
            backgroundColor: 'background.default',
          }}
        >
          <Box sx={{ mt: { xs: 7, md: 8 }, p: { xs: 2, sm: 3, md: 4 } }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={auth ? <Dashboard /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/pos"
                element={auth ? <POS /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/products"
                element={auth ? <Products /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/transactions"
                element={auth ? <Transactions /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/users"
                element={auth ? <Users /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/categories"
                element={auth ? <Categories /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/inventory"
                element={auth ? <Inventory /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/expenses"
                element={auth ? <Expenses /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/salary"
                element={
                  auth && auth.user?.role === 'admin' ? (
                    <Salaries />
                  ) : auth ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/sales-items"
                element={auth ? <SalesItems /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/reports"
                element={auth ? <Reports /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/"
                element={<Navigate to={auth ? '/dashboard' : '/login'} replace />}
              />
              <Route path="*" element={<Navigate to={auth ? '/dashboard' : '/login'} replace />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

