# app/models/services_model.py
import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from app.models.base_model import BaseUUIDModel

# Import các model chung thay vì định nghĩa lại
if TYPE_CHECKING:
    from app.models.catalog_model import Category, Image
    from app.models.treatment_plans_model import TreatmentPlanStep


# dịch vụ
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

    # THAY ĐỔI: Khóa ngoại trỏ đến bảng 'category' chung
    category_id: uuid.UUID = Field(foreign_key="category.id")

    # THAY ĐỔI: Quan hệ trỏ đến model 'Category' và 'Image'
    category: "Category" = Relationship(back_populates="services")
    images: List["Image"] = Relationship(back_populates="service")
