import { User } from "../store/auth.store";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/v1";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "AuthApiError";
  }
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for cookies
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AuthApiError(error.message || "Login failed", response.status);
    }

    return response.json();
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AuthApiError(
        error.message || "Registration failed",
        response.status
      );
    }

    return response.json();
  },

  logout: async (): Promise<void> => {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AuthApiError(error.message || "Logout failed", response.status);
    }
  },

  me: async (): Promise<User> => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AuthApiError(
        error.message || "Failed to get user info",
        response.status
      );
    }

    return response.json();
  },
};
