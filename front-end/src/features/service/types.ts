import { UUID } from "crypto";

export interface Service {
  id: UUID;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  categories: string[];
  images: imageUrls[];
  preparation_notes: string;
  aftercare_instructions: string;
  contraindications: string;
  is_deleted: boolean;
  consumables?: ServiceConsumable[];
  created_at: Date;
  updated_at: Date;
}
export interface ServiceConsumable {
  productId: UUID;
  quantityUsed: number;
}

export interface imageUrls {
  id: UUID;
  url: string;
  isPrimary: boolean;
  altText: string;
}
