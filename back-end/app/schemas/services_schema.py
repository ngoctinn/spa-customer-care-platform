# app/schemas/services_schema.py
from typing import List
from uuid import UUID

from pydantic import ConfigDict
from sqlmodel import Field, SQLModel

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


class ServiceCreatePayload(ServiceBase):
    """Payload nhận từ request khi tạo dịch vụ mới."""

    category_ids: List[UUID] = Field(
        default_factory=list, description="Danh sách ID của các danh mục"
    )
    model_config = ConfigDict(from_attributes=True)


class ServiceUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None)
    price: float | None = Field(default=None, gt=0)
    duration_minutes: int | None = Field(default=None, gt=0)
    preparation_notes: str | None = Field(default=None)
    aftercare_instructions: str | None = Field(default=None)
    contraindications: str | None = Field(default=None)
    category_ids: List[UUID] | None = Field(default=None)


class ServicePublic(ServiceBase):
    id: UUID
    categories: List[CategoryPublic] = Field(default_factory=list)
    images: List[ImagePublic] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)


class ServicePublicWithDetails(ServicePublic):
    category_ids: List[UUID] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)


# Cần forward reference cho treatment plan schema
from . import treatment_plans_schema

treatment_plans_schema.TreatmentPlanStepPublic.model_rebuild()
