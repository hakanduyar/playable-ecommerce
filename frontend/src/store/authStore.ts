import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.login({ email, password });
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isLoading: false,
            });
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', response.data.token);
            }
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string, phone?: string) => {
        set({ isLoading: true });
        try {
          const response = await api.register({ name, email, password, phone });
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isLoading: false,
            });
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', response.data.token);
            }
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        set({ user: null, token: null });
      },

      fetchProfile: async () => {
        try {
          const response = await api.getProfile();
          if (response.success && response.data) {
            set({ user: response.data });
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => 
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
    }
  )
);