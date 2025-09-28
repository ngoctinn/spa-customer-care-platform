// src/features/auth/apis/register_api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function register(
  email: string,
  full_name: string,
  password: string
) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, full_name, password }),
    credentials: "include", // <-- Rất quan trọng: để trình duyệt gửi và nhận cookies
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Đăng ký thất bại");
  }
  return response.json();
}
