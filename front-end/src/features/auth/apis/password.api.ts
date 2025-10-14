import { ChangePasswordFormValues } from "@/features/auth/schemas";
import apiClient from "@/lib/apiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Gửi yêu cầu quên mật khẩu đến server
 * @param email Email của người dùng
 */
export async function forgotPassword(
  email: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Yêu cầu thất bại, vui lòng thử lại.");
  }
  return response.json();
}

/**
 * Gửi thông tin để đặt lại mật khẩu mới
 * @param data Dữ liệu bao gồm token và mật khẩu mới
 */
export async function resetPassword(data: {
  token: string;
  password: string;
}): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: data.token,
      new_password: data.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Đặt lại mật khẩu thất bại.");
  }
  return response.json();
}

/**
 * Đổi mật khẩu cho người dùng đã đăng nhập
 * @param data Dữ liệu bao gồm mật khẩu cũ và mật khẩu mới
 * */
export async function changePassword(
  data: ChangePasswordFormValues
): Promise<{ message: string }> {
  // This looks correct according to your API spec. No changes needed here.
  return apiClient("/users/me/update-password", {
    method: "POST",
    body: JSON.stringify({
      current_password: data.oldPassword,
      new_password: data.newPassword,
    }),
  });
}
