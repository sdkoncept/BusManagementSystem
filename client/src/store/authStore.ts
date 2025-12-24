import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'STAFF' | 'RIDER' | 'DRIVER' | 'STORE_KEEPER';
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        set({ user: response.data.user, token: response.data.token });
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      },
      register: async (data: RegisterData) => {
        const response = await api.post('/auth/register', data);
        set({ user: response.data.user, token: response.data.token });
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      },
      logout: () => {
        set({ user: null, token: null });
        delete api.defaults.headers.common['Authorization'];
      },
      checkAuth: async () => {
        const token = localStorage.getItem('auth-storage');
        if (token) {
          try {
            const parsed = JSON.parse(token);
            if (parsed.state?.token) {
              api.defaults.headers.common['Authorization'] = `Bearer ${parsed.state.token}`;
              const response = await api.get('/auth/me');
              set({ user: response.data, token: parsed.state.token });
            }
          } catch (error) {
            console.error('Auth check failed:', error);
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
