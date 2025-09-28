// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const response = await fetch(`${API_URL}/auth/token`, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    throw new Error("Đăng nhập thất bại");
  }

  return response.json();
}

export async function fetchProfile(token: string) {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Không thể tải thông tin người dùng");
  }

  return response.json();
}
