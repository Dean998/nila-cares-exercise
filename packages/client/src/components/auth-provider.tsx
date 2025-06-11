import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { authApi } from "../utils/auth.api";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated on app start
    const checkAuth = async () => {
      try {
        setLoading(true);
        const user = await authApi.me();
        setUser(user);
      } catch (error) {
        // User is not authenticated or token is invalid
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setLoading, logout]);

  return <>{children}</>;
}
