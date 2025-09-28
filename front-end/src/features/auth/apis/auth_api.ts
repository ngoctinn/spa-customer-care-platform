// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const response = await fetch(`${API_URL}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    credentials: "include", // <-- Rất quan trọng: để trình duyệt gửi và nhận cookies
  });

  if (!response.ok) {
    // Bạn có thể xử lý lỗi chi tiết hơn ở đây
    const errorData = await response.json();
    throw new Error(errorData.detail || "Đăng nhập thất bại");
  }

  // Không cần return response.json() nữa vì token đã nằm trong cookie
  return response.json();
}

export async function fetchProfile() {
  // <-- Bỏ tham số token
  const response = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Chưa đăng nhập hoặc phiên đã hết hạn.");
    }
    throw new Error("Không thể tải thông tin người dùng");
  }

  return response.json();
}
