import { Category } from "@/features/category/types";
import { MediaImage as ImageUrl } from "@/features/media/types";
import type { Service } from "@/features/service/types";

export interface TreatmentPlanStep {
  id: string;
  step_number: number;
  service_id: string;
  description?: string | null;
  service?: Service;
}

export interface TreatmentPlan {
  id: string;
  name: string;
  description: string;
  categories: Category[];
  steps: TreatmentPlanStep[];
  price: number;
  total_sessions: number;
  images: ImageUrl[];
  primary_image_id?: string | null;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TreatmentSession {
  id: string;
  treatment_plan_step: number;
  appointment_id?: string; // Liên kết tới lịch hẹn cụ thể
  status: "completed" | "upcoming" | "cancelled";
  notes?: string;
  completed_at?: string;
}

export interface TreatmentPackage {
  id: string;
  customer_id: string;
  treatment_plan_id: string;
  purchase_date: string;
  purchase_invoice_id: string;
  total_sessions: number;
  completed_sessions: number;
  sessions: TreatmentSession[];
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}
