# app/api/treatment_plan_api.py
import uuid
from typing import List
from fastapi import APIRouter

# THAY ĐỔI: Import schema mới
from app.schemas.treatment_plans_schema import TreatmentPlanPublicWithDetails

router = APIRouter()

# Dữ liệu giả cho category, service của treatment plan
mock_tp_category = {
    "id": str(uuid.uuid4()),
    "name": "Liệu trình trị mụn",
    "description": "Các liệu trình chuyên sâu để điều trị mụn.",
    "category_type": "treatment_plan",
}

mock_service_for_tp_1 = {
    "id": str(uuid.uuid4()),
    "name": "Lấy nhân mụn y khoa",
    "description": "Làm sạch nhân mụn, tránh viêm nhiễm.",
    "price": 300000,
    "duration_minutes": 60,
    "category_id": str(uuid.uuid4()),  # Giả định category của service
}

mock_service_for_tp_2 = {
    "id": str(uuid.uuid4()),
    "name": "Điện di tinh chất B5",
    "description": "Phục hồi da sau mụn, giảm thâm.",
    "price": 450000,
    "duration_minutes": 45,
    "category_id": str(uuid.uuid4()),
}

mock_treatment_plan_data = [
    {
        "id": str(uuid.uuid4()),
        "name": "Liệu trình trị mụn chuyên sâu 5 buổi",
        "description": "Giải quyết dứt điểm mụn ẩn, mụn viêm và ngăn ngừa tái phát.",
        "price": 3500000,
        "total_sessions": 5,
        "category_id": mock_tp_category["id"],
        "category": mock_tp_category,
        "images": [
            {
                "id": str(uuid.uuid4()),
                "url": "https://place-hold.it/400x250/e63946/f1faee?text=TriMunChuyenSau",
                "alt_text": "Hình ảnh liệu trình trị mụn",
                "is_primary": True,
            }
        ],
        "steps": [
            {
                "id": str(uuid.uuid4()),
                "step_number": 1,
                "service_id": mock_service_for_tp_1["id"],
                "description": "Buổi 1, 3, 5: Làm sạch sâu và lấy nhân mụn.",
                "service": mock_service_for_tp_1,
            },
            {
                "id": str(uuid.uuid4()),
                "step_number": 2,
                "service_id": mock_service_for_tp_2["id"],
                "description": "Buổi 2, 4: Phục hồi, làm dịu da với B5.",
                "service": mock_service_for_tp_2,
            },
        ],
    }
]


@router.get("", response_model=List[TreatmentPlanPublicWithDetails])
def get_all_treatment_plans():
    """Lấy danh sách tất cả liệu trình (dữ liệu mô phỏng)."""
    return mock_treatment_plan_data
