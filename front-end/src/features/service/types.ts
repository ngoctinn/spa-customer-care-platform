import { ImageUrl } from "@/features/shared/types";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  categories: string[];
  images: ImageUrl[];
  preparation_notes: string;
  aftercare_instructions: string;
  contraindications: string;
  is_deleted: boolean;
  consumables?: ServiceConsumable[];
  created_at: Date;
  updated_at: Date;
}
export interface ServiceConsumable {
  productId: string;
  quantityUsed: number;
}
