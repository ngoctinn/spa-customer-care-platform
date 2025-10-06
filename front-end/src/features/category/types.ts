export type CategoryType = "service" | "product" | "treatment";

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  type?: CategoryType;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}
