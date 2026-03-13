import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token ? { token, user: user ? JSON.parse(user) : null } : null;
  });

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuth(data);
  };

  const refreshUser = async () => {
    if (!auth?.token) return;
    try {
      const res = await axios.get('/api/auth/me');
      const user = res.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      setAuth((prev) => (prev ? { ...prev, user } : null));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(null);
  };

  useEffect(() => {
    let logoutTimer;

    if (auth?.token) {
      try {
        const decoded = jwtDecode(auth.token);
        const exp = decoded.exp * 1000;
        const now = Date.now();

        if (exp < now) {
          logout();
        } else {
          logoutTimer = setTimeout(logout, exp - now);
        }
      } catch (err) {
        console.error('Failed to decode token:', err);
        logout();
      }
    }

    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, [auth]);

  useEffect(() => {
    if (auth?.token && auth?.user && (!auth.user.permissions || auth.user.permissions.length === 0)) {
      refreshUser();
    }
  }, [auth?.token]);

  const hasPermission = (code) => auth?.user?.permissions?.includes(code) || auth?.user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ auth, login, logout, refreshUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};






