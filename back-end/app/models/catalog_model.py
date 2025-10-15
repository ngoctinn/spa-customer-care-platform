# app/models/catalog_model.py
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from app.models.base_model import BaseUUIDModel

# Import bảng liên kết mới
from app.models.association_tables import (
    ProductCategoryLink,
    ProductImageLink,
    ServiceCategoryLink,
    ServiceImageLink,
    TreatmentPlanImageLink,
)

if TYPE_CHECKING:
    from app.models.services_model import Service
    from app.models.products_model import Product
    from app.models.treatment_plans_model import TreatmentPlan
    from app.models.users_model import User


class Category(BaseUUIDModel, table=True):
    __tablename__ = "category"
    name: str = Field(index=True, nullable=False, max_length=100)
    description: str | None = Field(default=None)
    category_type: str = Field(index=True, nullable=False)

    services: list["Service"] = Relationship(
        back_populates="categories", link_model=ServiceCategoryLink
    )
    products: list["Product"] = Relationship(
        back_populates="categories", link_model=ProductCategoryLink
    )
    treatment_plans: list["TreatmentPlan"] = Relationship(back_populates="category")


class Image(BaseUUIDModel, table=True):
    __tablename__ = "image"
    url: str = Field(nullable=False)
    alt_text: str | None = Field(default=None)

    uploaded_by_user_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="user.id",
        nullable=True,  # Cho phép NULL cho các ảnh hệ thống/cũ
        index=True,
        description="ID của người dùng đã tải ảnh lên.",
    )
    uploaded_by: "User" | None = Relationship()

    products: list["Product"] = Relationship(
        back_populates="images", link_model=ProductImageLink
    )
    services: list["Service"] = Relationship(
        back_populates="images", link_model=ServiceImageLink
    )
    treatment_plans: list["TreatmentPlan"] = Relationship(
        back_populates="images", link_model=TreatmentPlanImageLink
    )
