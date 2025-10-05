import { ImageUrl } from "@/features/shared/types";

export interface TreatmentPlanStep {
  step_number: number;
  service_id: string;
  description?: string;
}

export interface TreatmentPlan {
  id: string;
  name: string;
  description: string;
  categories: string[];
  steps: TreatmentPlanStep[];
  price: number;
  total_sessions: number;
  images: ImageUrl[];
  primary_image_id?: string | null;
  status: "active" | "inactive";
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TreatmentSession {
  id: string;
  treatment_plan_step: number;
  appointment_id?: string; // Liên kết tới lịch hẹn cụ thể
  status: "completed" | "upcoming" | "cancelled";
  notes?: string;
  completed_at?: Date;
}

export interface TreatmentPackage {
  id: string;
  customer_id: string;
  treatment_plan_id: string;
  purchase_date: Date;
  purchase_invoice_id: string;
  total_sessions: number;
  completed_sessions: number;
  sessions: TreatmentSession[];
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
