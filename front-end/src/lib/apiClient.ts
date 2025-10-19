// src/lib/apiClient.ts
import { tokenStore } from "./tokenStore";
import { refreshToken as apiRefreshToken } from "@/features/auth/apis/auth_api";

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

let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const originalRequest = async (token: string | null): Promise<T> => {
    const { headers, body, ...restOptions } = options;

    const defaultHeaders: HeadersInit = {
      Accept: "application/json",
    };

    if (!(body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        credentials: "include",
        cache: "no-store",
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
      const isAuthEndpoint =
        endpoint.startsWith("/auth/login") ||
        endpoint.startsWith("/auth/refresh");

      if (response.status === 401 && !isAuthEndpoint) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              return originalRequest(newToken as string);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;

        try {
          const { access_token: newAccessToken } = await apiRefreshToken();
          tokenStore.setToken(newAccessToken);
          processQueue(null, newAccessToken);
          return originalRequest(newAccessToken);
        } catch (refreshError: any) {
          processQueue(refreshError, null);
          tokenStore.clearToken();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      let errorData: unknown = null;
      try {
        errorData = await response.json();
      } catch (error) {
        // Ignore
      }

      const message =
        (typeof errorData === "object" && errorData && "detail" in errorData
          ? (errorData as any).detail
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

    const text = await response.text();
    return text as unknown as T;
  };

  return originalRequest(tokenStore.getToken());
}

export default apiClient;
