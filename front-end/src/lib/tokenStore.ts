// src/lib/tokenStore.ts

/**
 * Một store đơn giản trong bộ nhớ để quản lý access token.
 * Giúp chia sẻ token giữa các module (như apiClient và AuthContext) mà không gây ra import vòng tròn.
 */

let accessToken: string | null = null;

export const tokenStore = {
  /**
   * Lưu access token vào bộ nhớ.
   * @param token - Chuỗi access token JWT.
   */
  setToken: (token: string): void => {
    accessToken = token;
  },

  /**
   * Lấy access token từ bộ nhớ.
   * @returns Chuỗi access token hoặc null nếu không có.
   */
  getToken: (): string | null => {
    return accessToken;
  },

  /**
   * Xóa access token khỏi bộ nhớ.
   */
  clearToken: (): void => {
    accessToken = null;
  },
};
