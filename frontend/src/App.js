import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import SalesItems from './pages/SalesItems';
import AppBarNav from './components/AppBarNav';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { auth, logout } = useAuth();
  return (
    <>
      {auth && <AppBarNav onLogout={logout} />}
      <Routes>
        <Route path="/login" element={<Login onLogin={auth => auth && Navigate('/pos')} />} />
        <Route path="/dashboard" element={auth ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/pos" element={auth ? <POS /> : <Navigate to="/login" />} />
        <Route path="/products" element={auth ? <Products /> : <Navigate to="/login" />} />
        <Route path="/transactions" element={auth ? <Transactions /> : <Navigate to="/login" />} />
        <Route path="/users" element={auth ? <Users /> : <Navigate to="/login" />} />
        <Route path="/categories" element={auth ? <Categories /> : <Navigate to="/login" />} />
        <Route path="/inventory" element={auth ? <Inventory /> : <Navigate to="/login" />} />
        <Route path="/reports" element={auth ? <Reports /> : <Navigate to="/login" />} />
        <Route path="/sales-items" element={auth ? <SalesItems /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={auth ? "/dashboard" : "/login"} />} />
      </Routes>
    </>
  );
}

function App() {
  // Get basename from REACT_APP_HOMEPAGE environment variable
  // REACT_APP_HOMEPAGE can be:
  // - Full URL: "https://yggdrasilsolution.com/moredansmv" → extracts "/moredansmv"
  // - Path only: "/moredansmv" → uses as-is
  // Falls back to REACT_APP_PUBLIC_URL, then PUBLIC_URL, then empty string
  const getBasename = () => {
    // Priority 1: Use REACT_APP_HOMEPAGE (primary source)
    if (process.env.REACT_APP_HOMEPAGE) {
      const homepage = process.env.REACT_APP_HOMEPAGE.trim();
      // If it's a full URL, extract the pathname
      try {
        const url = new URL(homepage);
        return url.pathname; // Returns "/moredansmv"
      } catch {
        // If it's not a valid URL, assume it's already a path
        // Ensure it starts with "/"
        return homepage.startsWith('/') ? homepage : `/${homepage}`;
      }
    }
    
    // Priority 2: Use REACT_APP_PUBLIC_URL (override)
    if (process.env.REACT_APP_PUBLIC_URL) {
      return process.env.REACT_APP_PUBLIC_URL;
    }
    
    // Priority 3: Use PUBLIC_URL from build (extracted from homepage in package.json)
    // In production build, PUBLIC_URL will be "/moredansmv" from homepage setting
    // In development, PUBLIC_URL is usually empty
    return process.env.PUBLIC_URL || '';
  };

  const basename = getBasename();

  return (
    <AuthProvider>
      <Router basename={basename}>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
