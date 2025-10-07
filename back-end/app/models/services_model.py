# app/models/services_model.py
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped
from sqlmodel import Field, Relationship

from app.models.base_model import BaseUUIDModel

# Import bảng liên kết mới
from app.models.association_tables import ServiceCategoryLink, ServiceImageLink

if TYPE_CHECKING:
    from app.models.catalog_model import Category, Image
    from app.models.treatment_plans_model import TreatmentPlanStep


class Service(BaseUUIDModel, table=True):
    __tablename__ = "service"
    name: str = Field(max_length=100, nullable=False, unique=True, index=True)
    description: str = Field(nullable=False)
    price: float = Field(gt=0, nullable=False)
    duration_minutes: int = Field(gt=0, nullable=False)

    preparation_notes: str | None = Field(
        default=None, description="Hướng dẫn chuẩn bị trước dịch vụ"
    )
    aftercare_instructions: str | None = Field(
        default=None, description="Hướng dẫn chăm sóc sau dịch vụ"
    )
    contraindications: str | None = Field(
        default=None, description="Chống chỉ định dịch vụ"
    )

    # THAY ĐỔI: Bỏ category_id và category relationship cũ
    # category_id: uuid.UUID = Field(foreign_key="category.id")
    # category: "Category" = Relationship(back_populates="services")

    # ✅ updated for SQLAlchemy 2.0
    categories: Mapped[list["Category"]] = Relationship(
        back_populates="services", link_model=ServiceCategoryLink
    )

    # ✅ updated for SQLAlchemy 2.0
    images: Mapped[list["Image"]] = Relationship(
        back_populates="services", link_model=ServiceImageLink
    )
    primary_image_id: uuid.UUID | None = Field(
        default=None, foreign_key="image.id", nullable=True
    )
    # ✅ updated for SQLAlchemy 2.0
    primary_image: Mapped["Image"] | None = Relationship(
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "Service.primary_image_id",
        }
    )

    @property
    def category_ids(self) -> list[uuid.UUID]:
        """Danh sách ID của các danh mục không bị xóa mềm."""

        return [category.id for category in self.categories if not category.is_deleted]
