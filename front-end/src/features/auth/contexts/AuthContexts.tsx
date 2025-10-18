"use client";

import {
  login as apiLogin,
  fetchProfile,
  logout as apiLogout,
} from "@/features/auth/apis/auth_api";
import { loginSchema } from "@/features/auth/schemas";
import { useUser } from "@/features/auth/hooks/useUser";
import { User } from "@/features/user/types";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
} from "react";
import { z } from "zod";

import { useUser } from "@/features/auth/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (values: z.infer<typeof loginSchema>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError } = useUser();

  const login = async (values: z.infer<typeof loginSchema>) => {
    await apiLogin(values.email, values.password);
    await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    router.push("/admin/dashboard");
  };

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      queryClient.setQueryData(["user-profile"], null);
      router.push("/auth/login");
    }
  }, [router, queryClient]);

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, isLoading, login, logout }}
    >
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
