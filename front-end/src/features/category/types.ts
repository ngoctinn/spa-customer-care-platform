export type CategoryType = "service" | "product" | "treatment";

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: CategoryType;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
