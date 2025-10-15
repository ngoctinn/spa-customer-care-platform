# app/models/treatment_plans_model.py
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING
from sqlmodel import Field, Relationship
from app.models.base_model import BaseUUIDModel
from app.models.association_tables import TreatmentPlanImageLink

if TYPE_CHECKING:
    from app.models.catalog_model import Category, Image
    from app.models.services_model import Service


class TreatmentPlanStep(BaseUUIDModel, table=True):
    __tablename__ = "treatment_plan_step"
    step_number: int = Field(nullable=False)
    description: str | None = Field(default=None)

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
    images: list["Image"] = Relationship(
        back_populates="treatment_plans", link_model=TreatmentPlanImageLink
    )
    primary_image_id: uuid.UUID | None = Field(
        default=None, foreign_key="image.id", nullable=True
    )
    primary_image: "Image" | None = Relationship(
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "TreatmentPlan.primary_image_id",
        }
    )
    steps: list["TreatmentPlanStep"] = Relationship(back_populates="treatment_plan")
