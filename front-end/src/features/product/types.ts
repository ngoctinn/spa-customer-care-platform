import { ImageUrl } from "@/features/shared/types";

export interface Product {
  id: string;
  name: string;
  description: string;
  categories: string[];
  price: number;
  stock: number;
  images: ImageUrl[];
  status: "active" | "inactive";
  is_retail: boolean;
  is_consumable: boolean;
  base_unit: string; // vd: "chai", "lọ", "hũ"
  consumable_unit?: string; // vd: "ml", "g"
  conversion_rate?: number; // Tỷ lệ quy đổi (vd: 500ml/chai)
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
