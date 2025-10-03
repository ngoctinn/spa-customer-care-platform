# app/schemas/services_schema.py
from typing import Optional, List
from sqlmodel import SQLModel, Field
import uuid

# THAY ĐỔI: Import schema chung
from app.schemas.catalog_schema import CategoryPublic, ImagePublic

# XÓA BỎ: Các class ServiceImageBase, ServiceImagePublic, ServiceCategory...


# =================================================================
# SCHEMAS CHO DỊCH VỤ
# =================================================================
class ServiceBase(SQLModel):
    name: str = Field(max_length=100)
    description: str
    price: float = Field(gt=0, description="Giá dịch vụ phải lớn hơn 0")
    duration_minutes: int = Field(
        gt=0, description="Thời lượng dịch vụ (phút) phải lớn hơn 0"
    )
    preparation_notes: str | None
    aftercare_instructions: str | None
    contraindications: str | None
    # Vẫn giữ category_id để tạo/cập nhật dịch vụ
    category_id: uuid.UUID = Field(foreign_key="category.id")


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None)
    price: float | None = Field(default=None, gt=0)
    duration_minutes: int | None = Field(default=None, gt=0)
    preparation_notes: str | None = Field(default=None)
    aftercare_instructions: str | None = Field(default=None)
    contraindications: str | None = Field(default=None)
    category_id: uuid.UUID | None = Field(default=None)


class ServicePublic(ServiceBase):
    id: uuid.UUID


# Schema hiển thị đầy đủ thông tin dịch vụ kèm theo danh mục và hình ảnh
class ServicePublicWithDetails(ServicePublic):
    # THAY ĐỔI: Sử dụng schema chung
    category: CategoryPublic
    images: List[ImagePublic] = []


# Cần forward reference cho treatment plan schema
from . import treatment_plans_schema

treatment_plans_schema.TreatmentPlanStepPublic.model_rebuild()
