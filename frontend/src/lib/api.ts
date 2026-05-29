import axios from 'axios';
import { removeTokenCookie } from './cookies';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        removeTokenCookie();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        const msg = error.response?.data?.message || 'ليس لديك صلاحية';
        console.error('Forbidden:', msg);
      } else if (error.response?.status >= 500) {
        console.error('Server error:', error.response?.data);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
