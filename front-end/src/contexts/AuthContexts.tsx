// src/contexts/AuthContexts.tsx
"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User } from "@/features/user/types";
import { fetchProfile, login as apiLogin } from "@/features/auth/apis/auth_api";
import { z } from "zod";
import { loginSchema } from "@/features/auth/schemas";
import { useRouter } from "next/navigation";

// Định nghĩa một hàm logout giả, sau này bạn có thể gọi API logout ở đây
const apiLogout = async () => {
  // Giả lập việc gọi API logout, ví dụ:
  // await fetch('/api/auth/logout', { method: 'POST' });
  return Promise.resolve();
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (values: z.infer<typeof loginSchema>) => Promise<void>;
  logout: () => void;
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  const login = async (values: z.infer<typeof loginSchema>) => {
    // Không cần try/catch ở đây vì component sẽ xử lý
    await apiLogin(values.email, values.password);
    // Sau khi login thành công, fetch lại profile để cập nhật context
    await checkUserStatus();
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    // Điều hướng về trang chủ sau khi logout
    router.push("/");
  };

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
