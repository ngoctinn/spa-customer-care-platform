// src/lib/queryString.ts

/**
 * Tạo chuỗi query string từ một object các tham số.
 * Tự động loại bỏ các giá trị null/undefined.
 */
export function buildQueryString(
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}
