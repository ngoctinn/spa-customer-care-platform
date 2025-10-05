import { ImageUrl } from "@/features/shared/types";
import { Category } from "@/features/category/types";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  categories: Category[];
  images: ImageUrl[];
  primary_image_id?: string | null;
  preparation_notes?: string | null;
  aftercare_instructions?: string | null;
  contraindications?: string | null;
  is_deleted?: boolean;
  consumables?: ServiceConsumable[];
  created_at?: string;
  updated_at?: string;
}
export interface ServiceConsumable {
  productId: string;
  quantityUsed: number;
}
