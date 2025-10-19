import apiClient from "@/lib/apiClient";

/**
 * Gửi token xác minh email đến backend.
 * @param token Token từ URL.
 * @returns Promise chứa thông điệp thành công.
 */
export async function verifyEmail(token: string): Promise<{ message: string }> {
  return apiClient("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

/**
 * Yêu cầu gửi lại email xác thực.
 * @param email Email của người dùng cần gửi lại.
 * @returns Promise chứa thông điệp thành công.
 */
export async function resendVerificationEmail(
  email: string
): Promise<{ message: string }> {
  return apiClient("/auth/resend-verification-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
