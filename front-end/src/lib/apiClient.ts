// src/lib/apiClient.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError<T = unknown> extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: T
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isFormData(body: BodyInit | null | undefined): body is FormData {
  if (typeof FormData === "undefined" || !body) {
    return false;
  }

  return body instanceof FormData;
}

/**
 * Một trình bao bọc (wrapper) cho hàm fetch() để đơn giản hóa việc gọi API.
 * @param endpoint Đường dẫn API (ví dụ: '/services')
 * @param options Các tùy chọn của RequestInit (method, body, headers...)
 * @returns Dữ liệu JSON từ API trả về
 * @throws {ApiError} Ném ra lỗi nếu yêu cầu thất bại
 */
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers, body, cache, ...restOptions } = options;

  const defaultHeaders: HeadersInit = {};

  if (!isFormData(body)) {
    defaultHeaders["Content-Type"] = "application/json";
    defaultHeaders["Accept"] = "application/json";
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      credentials: "include",
      cache: cache ?? "no-store",
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      body,
      ...restOptions,
    });
  } catch (error) {
    throw new ApiError(
      "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.",
      0,
      error
    );
  }

  if (!response.ok) {
    let errorData: unknown = null;

    try {
      errorData = await response.json();
    } catch (error) {
      // Không parse được JSON, giữ nguyên errorData = null
    }

    const message =
      (typeof errorData === "object" && errorData && "detail" in errorData
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (errorData as any).detail
        : undefined) ||
      response.statusText ||
      "Yêu cầu API thất bại.";

    throw new ApiError(message, response.status, errorData ?? undefined);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  // Nếu không phải JSON, trả về response text
  const text = await response.text();
  return text as unknown as T;
}

export default apiClient;
