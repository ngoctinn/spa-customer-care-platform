# app/schemas/services_schema.py
from typing import Optional
from sqlmodel import SQLModel, Field
import uuid

from app.schemas.catalog_schema import CategoryPublic, ImagePublic


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

    # THAY ĐỔI: Chấp nhận một danh sách các ID danh mục
    category_ids: list[uuid.UUID] = Field(description="Danh sách ID của các danh mục")


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
    # THAY ĐỔI: Cho phép cập nhật danh sách danh mục
    category_ids: list[uuid.UUID] | None = Field(default=None)


class ServicePublic(ServiceBase):
    id: uuid.UUID


class ServicePublicWithDetails(ServicePublic):
    model_config = {"from_attributes": True}

    # THAY ĐỔI: Hiển thị danh sách các danh mục
    categories: list[CategoryPublic] = Field(default_factory=list)
    images: list[ImagePublic] = Field(default_factory=list)


# Cần forward reference cho treatment plan schema
from . import treatment_plans_schema

treatment_plans_schema.TreatmentPlanStepPublic.model_rebuild()
