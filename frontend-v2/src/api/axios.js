import axios from 'axios';

const instance = axios.create({
  // baseURL: process.env.REACT_APP_API_BASE_URL || 'https://yggdrasilsolution.com/backend_pos',
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
});

// Login path respects deployed base path (e.g. /pidolsbakery/login)
const getLoginPath = () => {
  const base = process.env.REACT_APP_PUBLIC_URL || process.env.REACT_APP_HOMEPAGE || '';
  const path = typeof base === 'string' && base.trim() ? base.trim() : '';
  if (path.startsWith('http')) {
    try {
      return new URL(path).pathname.replace(/\/?$/, '') + '/login';
    } catch {
      return '/login';
    }
  }
  return (path.startsWith('/') ? path : `/${path}`).replace(/\/?$/, '') + '/login';
};

// Request interceptor to add auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login (use base path when deployed)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = getLoginPath();
    }
    return Promise.reject(error);
  }
);

export default instance;






