"use client";

import {
  login as apiLogin,
  fetchProfile,
  logout as apiLogout,
} from "@/features/auth/apis/auth_api";
import { loginSchema } from "@/features/auth/schemas";
import { User } from "@/features/user/types";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { z } from "zod";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (values: z.infer<typeof loginSchema>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkUserStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const userProfile = await fetchProfile();
      setUser(userProfile);
    } catch (error) {
      console.error("Không thể lấy thông tin người dùng:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkUserStatus();
  }, [checkUserStatus]);

  const login = async (values: z.infer<typeof loginSchema>) => {
    // Không cần try/catch ở đây vì component sẽ xử lý
    await apiLogin(values.email, values.password);
    // Sau khi login thành công, fetch lại profile để cập nhật context
    await checkUserStatus();
  };

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiLogout();
    } finally {
      setUser(null);
      router.replace("/auth/login");
      router.refresh();
      setIsLoading(false);
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
