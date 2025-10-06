# app/models/services_model.py
import uuid
from typing import Optional, List, TYPE_CHECKING
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

    # THAY ĐỔI: Thêm relationship mới cho mối quan hệ nhiều-nhiều
    categories: List["Category"] = Relationship(
        back_populates="services", link_model=ServiceCategoryLink
    )

    images: List["Image"] = Relationship(
        back_populates="services", link_model=ServiceImageLink
    )
    primary_image_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="image.id", nullable=True
    )
    primary_image: Optional["Image"] = Relationship(
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "Service.primary_image_id",
        }
    )

    @property
    def category_ids(self) -> List[uuid.UUID]:
        """Danh sách ID của các danh mục không bị xóa mềm."""

        return [
            category.id for category in self.categories if not category.is_deleted
        ]
