import { UUID } from "crypto";
import { ImageUrl } from "@/features/shared/types";

export interface TreatmentPlanStep {
  step_number: number;
  service_id: UUID;
  description?: string;
}

export interface TreatmentPlan {
  id: UUID;
  name: string;
  description: string;
  categories: UUID[];
  steps: TreatmentPlanStep[];
  price: number;
  total_sessions: number;
  images: ImageUrl[];
  status: "active" | "inactive";
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TreatmentSession {
  id: UUID;
  treatment_plan_step: number;
  appointment_id?: UUID; // Liên kết tới lịch hẹn cụ thể
  status: "completed" | "upcoming" | "cancelled";
  notes?: string;
  completed_at?: Date;
}

export interface TreatmentPackage {
  id: UUID;
  customer_id: UUID;
  treatment_plan_id: UUID;
  purchase_date: Date;
  purchase_invoice_id: UUID;
  total_sessions: number;
  completed_sessions: number;
  sessions: TreatmentSession[];
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
