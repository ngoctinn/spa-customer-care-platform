# app/models/treatment_plans_model.py
import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship
from app.models.base_model import BaseUUIDModel

if TYPE_CHECKING:
    from app.models.catalog_model import Category, Image
    from app.models.services_model import Service


class TreatmentPlanStep(BaseUUIDModel, table=True):
    __tablename__ = "treatment_plan_step"
    step_number: int = Field(nullable=False)
    description: Optional[str] = Field(default=None)

    treatment_plan_id: uuid.UUID = Field(foreign_key="treatment_plan.id")
    service_id: uuid.UUID = Field(foreign_key="service.id")  # Mỗi bước là một dịch vụ

    treatment_plan: "TreatmentPlan" = Relationship(back_populates="steps")
    service: "Service" = Relationship()


class TreatmentPlan(BaseUUIDModel, table=True):
    __tablename__ = "treatment_plan"
    name: str = Field(max_length=100, nullable=False, unique=True, index=True)
    description: str = Field(nullable=False)
    price: float = Field(gt=0, nullable=False)
    total_sessions: int = Field(gt=0)

    category_id: uuid.UUID = Field(foreign_key="category.id")
    category: "Category" = Relationship(back_populates="treatment_plans")
    images: List["Image"] = Relationship(back_populates="treatment_plan")
    steps: List["TreatmentPlanStep"] = Relationship(back_populates="treatment_plan")
