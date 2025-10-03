// src/lib/apiClient.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Một trình bao bọc (wrapper) cho hàm fetch() để đơn giản hóa việc gọi API.
 * @param endpoint Đường dẫn API (ví dụ: '/services')
 * @param options Các tùy chọn của RequestInit (method, body, headers...)
 * @returns Dữ liệu JSON từ API trả về
 * @throws {Error} Ném ra lỗi nếu yêu cầu thất bại
 */
async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    // Thêm dấu / để đảm bảo đường dẫn đúng
    // Mặc định headers, có thể được ghi đè bởi options
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include", // Giữ lại để xử lý cookie
    ...options,
  });

  // Xử lý lỗi tập trung
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // Nếu không thể parse JSON, dùng status text
      throw new Error(response.statusText || "Đã có lỗi xảy ra từ máy chủ.");
    }
    // Ưu tiên thông báo lỗi chi tiết từ backend
    throw new Error(errorData.detail || "Yêu cầu API thất bại.");
  }

  // Nếu request thành công và có nội dung trả về
  if (response.status !== 204) {
    // 204 No Content
    return response.json();
  }

  // Trả về undefined nếu không có nội dung (ví dụ: phương thức DELETE)
  return undefined as T;
}

export default apiClient;
