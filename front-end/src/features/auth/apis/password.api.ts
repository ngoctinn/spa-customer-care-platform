import { ChangePasswordFormValues } from "@/features/auth/schemas";
import apiClient from "@/lib/apiClient";

/**
 * Gửi yêu cầu quên mật khẩu đến server
 * @param email Email của người dùng
 */
export async function forgotPassword(
  email: string
): Promise<{ message: string }> {
  return apiClient("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Gửi thông tin để đặt lại mật khẩu mới
 * @param data Dữ liệu bao gồm token và mật khẩu mới
 */
export async function resetPassword(data: {
  token: string;
  password: string;
}): Promise<{ message: string }> {
  return apiClient("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      token: data.token,
      new_password: data.password,
    }),
  });
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
