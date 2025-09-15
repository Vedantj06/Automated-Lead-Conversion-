import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService, User, AuthResponse } from '@/lib/auth-service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  sendOTP: (email: string) => Promise<AuthResponse>;
  verifyOTP: (email: string, otp: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => void;
  refreshSession: () => Promise<AuthResponse>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      sendOTP: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await AuthService.sendOTP(email);
          
          if (!response.success) {
            set({ error: response.message, isLoading: false });
          } else {
            set({ isLoading: false });
          }
          
          return response;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to send OTP';
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      verifyOTP: async (email: string, otp: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await AuthService.verifyOTP(email, otp);
          
          if (response.success && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              error: response.message,
              isLoading: false,
            });
          }
          
          return response;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to verify OTP';
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await AuthService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      checkAuth: () => {
        const isAuth = AuthService.isAuthenticated();
        const user = AuthService.getCurrentUser();
        
        set({
          isAuthenticated: isAuth,
          user: user,
        });
      },

      refreshSession: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await AuthService.refreshSession();
          
          if (response.success && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: response.message,
            });
          }
          
          return response;
        } catch (error: any) {
          const errorMessage = error.message || 'Session refresh failed';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          return { success: false, message: errorMessage };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);