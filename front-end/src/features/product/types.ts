import { Category } from "@/features/category/types";
import { ImageUrl } from "@/features/shared/types";

export interface Product {
  id: string;
  name: string;
  description: string;
  categories: Category[];
  price: number;
  stock: number;
  images: ImageUrl[];
  primary_image_id?: string | null;
  is_retail?: boolean;
  is_consumable?: boolean;
  base_unit: string; // vd: "chai", "lọ", "hũ"
  consumable_unit?: string | null; // vd: "ml", "g"
  conversion_rate?: number | null; // Tỷ lệ quy đổi (vd: 500ml/chai)
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}
