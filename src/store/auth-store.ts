import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthService, AuthResponse } from "@/lib/auth-service";

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (otp: string) => Promise<AuthResponse | undefined>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<AuthResponse | undefined>;
  refreshSession: () => Promise<AuthResponse | undefined>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (otp: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await AuthService.verifyOtp(otp);

          if (!response.data.success) {
            set({ error: response.data.message, isLoading: false });
            return;
          }

          localStorage.setItem("auth_token", response.data.token);
          if (response.data.user) {
            localStorage.setItem("user_data", JSON.stringify(response.data.user));
          }

          set({
            user: response.data.user,
            token: response.data.token,
            isLoading: false,
          });

          return response.data;
        } catch (error: any) {
          set({ error: error.message || "Login failed", isLoading: false });
        }
      },

      logout: async () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        set({ user: null, token: null });
      },

      clearError: () => set({ error: null }),

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const response = await AuthService.checkAuth();

          if (response.data.success && response.data.user) {
            set({
              user: response.data.user,
              token: response.data.token,
              isLoading: false,
            });
          } else {
            set({ user: null, token: null, isLoading: false });
          }

          return response.data;
        } catch {
          set({ user: null, token: null, isLoading: false });
        }
      },

      refreshSession: async () => {
        try {
          const response = await AuthService.refreshSession();

          if (response.data.success && response.data.user) {
            localStorage.setItem("auth_token", response.data.token);
            localStorage.setItem("user_data", JSON.stringify(response.data.user));

            set({
              user: response.data.user,
              token: response.data.token,
            });
          } else {
            set({ user: null, token: null });
          }

          return response.data;
        } catch {
          set({ user: null, token: null });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
