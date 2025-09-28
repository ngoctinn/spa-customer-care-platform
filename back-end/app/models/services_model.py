# app/models/services_model.py
import uuid
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from app.models.base_model import BaseUUIDModel


# danh mục dịch vụ
class ServiceCategory(BaseUUIDModel, table=True):
    __tablename__ = "service_category"

    name: str = Field(index=True, nullable=False, unique=True)
    description: str | None = Field(default=None)

    # Một danh mục có thể có nhiều dịch vụ
    services: List["Service"] = Relationship(back_populates="category")


# hình ảnh cho dịch vụ
class ServiceImage(BaseUUIDModel, table=True):
    __tablename__ = "service_image"

    service_id: uuid.UUID = Field(foreign_key="service.id", nullable=False)
    url: str = Field(nullable=False)
    alt_text: str | None = Field(default=None)

    # Mỗi hình ảnh thuộc về một dịch vụ
    service: "Service" = Relationship(back_populates="images")


# dịch vụ
class Service(BaseUUIDModel, table=True):
    __tablename__ = "service"
    name: str = Field(max_length=100, nullable=False, unique=True, index=True)
    description: str = Field(nullable=False)
    price: float = Field(gt=0, nullable=False)
    duration_minutes: int = Field(gt=0, nullable=False)
    is_active: bool = Field(default=True, nullable=False)

    preparation_notes: str | None = Field(
        default=None, description="Hướng dẫn chuẩn bị trước dịch vụ"
    )
    aftercare_instructions: str | None = Field(
        default=None, description="Hướng dẫn chăm sóc sau dịch vụ"
    )
    contraindications: str | None = Field(
        default=None, description="Chống chỉ định dịch vụ"
    )

    category_id: uuid.UUID = Field(foreign_key="service_category.id")

    # Mỗi dịch vụ thuộc về một danh mục
    category: ServiceCategory = Relationship(back_populates="services")
    # Một dịch vụ có thể có nhiều hình ảnh
    images: List[ServiceImage] = Relationship(back_populates="service")
