import { MediaImage as ImageUrl } from "@/features/media/types";
import { Category } from "@/features/category/types";

export interface EquipmentRequirement {
  equipment_id: string;
  quantity: number;
}

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

  required_staff: number; // Số lượng nhân viên cần
  requires_bed: boolean; // Có cần giường hay không
  fixed_equipment_requirements: EquipmentRequirement[]; // DS thiết bị cố định
  mobile_equipment_requirements: EquipmentRequirement[]; // DS thiết bị di động
}
export interface ServiceConsumable {
  productId: string;
  quantityUsed: number;
}
