# app/schemas/treatment_plans_schema.py
import uuid
from typing import Optional
from sqlmodel import SQLModel, Field
from app.schemas.catalog_schema import CategoryPublic, ImagePublic

# Cần import ServicePublic để hiển thị trong step
from app.schemas.services_schema import ServicePublic


class TreatmentPlanStepBase(SQLModel):
    step_number: int
    description: Optional[str] = None
    service_id: uuid.UUID


class TreatmentPlanStepPublic(TreatmentPlanStepBase):
    id: uuid.UUID
    service: ServicePublic  # Hiển thị thông tin dịch vụ của bước này


class TreatmentPlanBase(SQLModel):
    name: str = Field(max_length=100)
    description: str
    price: float = Field(gt=0)
    total_sessions: int = Field(gt=0)
    category_id: uuid.UUID = Field(foreign_key="category.id")


class TreatmentPlanCreate(TreatmentPlanBase):
    steps: list[TreatmentPlanStepBase] = Field(default_factory=list)


class TreatmentPlanUpdate(SQLModel):
    name: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    total_sessions: Optional[int] = Field(default=None, gt=0)
    category_id: Optional[uuid.UUID] = None


class TreatmentPlanPublic(TreatmentPlanBase):
    id: uuid.UUID


class TreatmentPlanPublicWithDetails(TreatmentPlanPublic):
    model_config = {"from_attributes": True}

    category: CategoryPublic
    images: list[ImagePublic] = Field(default_factory=list)
    steps: list[TreatmentPlanStepPublic] = Field(default_factory=list)
