import React, { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token ? { token, user: JSON.parse(user) } : null;
  });

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuth(data);
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
        const exp = decoded.exp * 1000; // convert to milliseconds
        const now = Date.now();

        if (exp < now) {
          // Token already expired
          logout();
        } else {
          // Token still valid, set a timer
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

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
