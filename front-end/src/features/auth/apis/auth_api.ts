import apiClient from "@/lib/apiClient";
import { User } from "@/features/user/types";

/**
 * @description Đăng nhập và trả về access token.
 * @param email
 * @param password
 * @returns Access token.
 */
export async function login(
  email: string,
  password: string
): Promise<{ access_token: string }> {
  return apiClient<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * @description Lấy thông tin người dùng đang đăng nhập.
 * @returns Thông tin chi tiết của người dùng.
 */
export async function fetchProfile(): Promise<User> {
  return apiClient<User>("/auth/me");
}

/**
 * @description Làm mới access token bằng refresh token trong cookie.
 * @returns Access token mới.
 */
export async function refreshToken(): Promise<{ access_token: string }> {
  return apiClient<{ access_token: string }>("/auth/refresh", {
    method: "POST",
  });
}

/**
 * @description Đăng xuất khỏi hệ thống.
 */
export async function logout(): Promise<void> {
  // Gọi cả hai endpoint để đảm bảo cookie được xóa ở cả backend và Next.js server
  await Promise.allSettled([
    apiClient<void>("/auth/logout", { method: "POST" }),
    fetch("/api/auth/logout", { method: "POST" }), // Dùng fetch gốc cho Next.js API route
  ]);
}