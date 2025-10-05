export type CategoryType = "service" | "product" | "treatment_plan";

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  category_type: CategoryType;
  /**
   * Alias cho các đoạn code cũ vẫn đang sử dụng thuộc tính `type`.
   * Nên ưu tiên dùng `category_type`.
   */
  type?: CategoryType;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}
