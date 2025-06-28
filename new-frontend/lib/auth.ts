import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from './apiClient';
import { User } from './api';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string>;
}

const initialState: Omit<AuthState, 'login' | 'logout' | 'refreshAccessToken'> = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post('/auth/login', { email, password });
          const { user, token, refreshToken } = response.data;
          set({ user, token, refreshToken, isLoading: false });
        } catch (error) {
          set({ error: 'Falha na autenticação', isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ ...initialState });
        localStorage.removeItem('auth-storage');
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('Refresh token não encontrado');
        }

        try {
          const response = await apiClient.post('/auth/refresh', { refreshToken });
          const { token } = response.data;
          set({ token });
          return token;
        } catch (error) {
          set({ ...initialState });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);

// Hook personalizado para proteção de rotas
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  
  if (typeof window !== 'undefined' && !isLoading && !user) {
    window.location.href = '/login';
    return null;
  }

  return { user, isLoading };
}

// Configurar interceptor para refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const auth = useAuth.getState();
        const newToken = await auth.refreshAccessToken();
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuth.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
