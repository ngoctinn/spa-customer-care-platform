

import apiClient from "@/lib/apiClient";
import { User } from "@/features/user/types";

export async function login(email: string, password: string): Promise<void> {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  await apiClient<void>("/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
}

export async function fetchProfile(): Promise<User> {
  return apiClient<User>("/users/me");
}

export async function logout(): Promise<void> {
  await Promise.all([
    apiClient<void>("/auth/logout", { method: "POST" }),
    apiClient<void>("/api/auth/logout", { method: "POST" }),
  ]);
}
