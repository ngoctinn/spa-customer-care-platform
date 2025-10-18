/**
 * @file src/features/promotion/types/index.ts
 * @description Kiểu dữ liệu cho tính năng khuyến mãi.
 */

/**
 * @interface Promotion
 * @description Đại diện cho một mã khuyến mãi trong hệ thống.
 * @property {string} id - Mã định danh duy nhất.
 * @property {string} name - Tên của chương trình khuyến mãi.
 * @property {string} [description] - Mô tả chi tiết.
 * @property {number} discount_percentage - Phần trăm giảm giá (từ 0 đến 100).
 * @property {string} start_date - Ngày bắt đầu hiệu lực (chuỗi ISO 8601).
 * @property {string} end_date - Ngày kết thúc hiệu lực (chuỗi ISO 8601).
 * @property {string} created_at - Ngày tạo.
 * @property {boolean} is_active - Trạng thái của khuyến mãi.
 */
export interface Promotion {
  id: string;
  name: string;
  description?: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  created_at: string;
  is_active: boolean;
}

/**
 * @type PromotionFormValues
 * @description Kiểu dữ liệu cho form thêm/sửa khuyến mãi, dùng cho react-hook-form.
 */
export type PromotionFormValues = {
  name: string;
  description?: string;
  discount_percentage: number;
  date_range: {
    from: Date;
    to: Date;
  };
};
