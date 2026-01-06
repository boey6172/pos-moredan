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
import Expenses from './pages/Expenses';
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
        <Route path="/expenses" element={auth ? <Expenses /> : <Navigate to="/login" />} />
        <Route path="/reports" element={auth ? <Reports /> : <Navigate to="/login" />} />
        <Route path="/sales-items" element={auth ? <SalesItems /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={auth ? "/dashboard" : "/login"} />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
