import { create } from 'zustand';
import api from '@/lib/api';
import { setTokenCookie, removeTokenCookie } from '@/lib/cookies';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  phone: string | null;
  bio: string | null;
  is_active: boolean;
  kyc_status: string;
  creator_profile: any;
  advertiser_profile: any;
  wallet: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string, role: string, extraData?: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data;
    setTokenCookie(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isLoading: false });
  },

  register: async (name, email, password, password_confirmation, role, extraData = {}) => {
    const res = await api.post('/auth/register', {
      name, email, password, password_confirmation, role, ...extraData,
    });
    const { user, token } = res.data;
    setTokenCookie(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    removeTokenCookie();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isLoading: false });
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        set({ user: JSON.parse(cachedUser), token });
      }
      const res = await api.get('/auth/me');
      set({ user: res.data, token, isLoading: false });
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch {
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        set({ isLoading: false });
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ isLoading: false });
      }
    }
  },

  isAuthenticated: () => {
    return !!get().token || !!localStorage.getItem('token');
  },
}));
