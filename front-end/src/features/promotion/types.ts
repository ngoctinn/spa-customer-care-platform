// src/features/promotion/types.ts

/**
 * @interface Promotion
 * @description Đại diện cho một mã khuyến mãi trong hệ thống.
 */
export interface Promotion {
  id: string;
  title: string; // Đã đổi từ name
  description: string;
  discount_percent: number; // Đã đổi từ discount_percentage
  start_date: string; // ISO 8601 date string
  end_date: string; // ISO 8601 date string
  is_active: boolean;
  image_url?: string | null;
  applicable_service_ids?: string[];
  applicable_plan_ids?: string[];
  gift_product_ids?: string[];
  status?: "active" | "inactive" | "scheduled";
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * @type PromotionFormValues
 * @description Kiểu dữ liệu cho form thêm/sửa khuyến mãi.
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
