"use client";

import { createContext, ReactNode, useCallback, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";

import {
  login as apiLogin,
  logout as apiLogout,
} from "@/features/auth/apis/auth_api";
import { loginSchema } from "@/features/auth/schemas";
import { useUser } from "@/features/auth/hooks/useUser";
import { User } from "@/features/user/types";
import { tokenStore } from "@/lib/tokenStore";

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
  const { data: user, isLoading } = useUser();

  const login = async (values: z.infer<typeof loginSchema>): Promise<void> => {
    const { access_token } = await apiLogin(values.email, values.password);
    tokenStore.setToken(access_token);
    await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    router.push("/dashboard");
  };

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      tokenStore.clearToken();
      queryClient.setQueryData(["user-profile"], null);
      await queryClient.clear();
      router.push("/auth/login");
    }
  }, [router, queryClient]);

  return (
    <AuthContext.Provider
      // @ts-ignore
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
