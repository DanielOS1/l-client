import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { authService } from "../modules/auth/services/auth.service";
import { User } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authService.login(email, password);

      await SecureStore.setItemAsync("auth_token", token);
      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al iniciar sesión",
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authService.register(userData);

      if (token) {
        await SecureStore.setItemAsync("auth_token", token);
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al registrarse",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("auth_token");
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = await SecureStore.getItemAsync("auth_token");
    if (token) {
      // TODO: Call authService.getProfile() if implemented
      set({ token, isAuthenticated: true });
    }
  },
}));
