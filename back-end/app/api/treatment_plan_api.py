import uuid
from fastapi import APIRouter
from typing import List

from sqlmodel import Session

router = APIRouter()
""" export interface TreatmentPlanStep {
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
 """
treatment_plan = {
    "id": str(uuid.uuid4()),
    "name": "Kế hoạch điều trị mẫu",
    "description": "Mô tả kế hoạch điều trị mẫu",
    "categories": ["Chăm sóc da", "Trị mụn"],
    "steps": [
        {
            "step_number": 1,
            "service_id": str(uuid.uuid4()),
            "description": "Bước 1: Làm sạch da",
        },
        {
            "step_number": 2,
            "service_id": str(uuid.uuid4()),
            "description": "Bước 2: Điều trị mụn",
        },
    ],
    "price": 2000000,
    "total_sessions": 5,
    "images": [
        {
            "url": "https://place-hold.it/300x200",
            "alt": "Hình ảnh kế hoạch điều trị mẫu",
            "is_primary": True,
        }
    ],
    "is_deleted": False,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-10T15:30:00Z",
}


@router.get("/treatment-plans", response_model=List[str])
def get_treatment_plan():
    """Lấy thông tin kế hoạch điều trị mẫu."""
    return [
        treatment_plan for _, TYPE_CHECKING in range(10)
    ]  # Trả về danh sách kế hoạch điều trị giả
