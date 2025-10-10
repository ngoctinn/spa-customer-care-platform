# app/models/catalog_model.py
import uuid
from typing import List, Optional, TYPE_CHECKING
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
    description: Optional[str] = Field(default=None)
    category_type: str = Field(index=True, nullable=False)

    # THAY ĐỔI: Cập nhật relationship với Service
    services: List["Service"] = Relationship(
        back_populates="categories", link_model=ServiceCategoryLink
    )

    products: List["Product"] = Relationship(
        back_populates="categories", link_model=ProductCategoryLink
    )
    treatment_plans: List["TreatmentPlan"] = Relationship(back_populates="category")


# ... (Phần còn lại của file Image model giữ nguyên)
class Image(BaseUUIDModel, table=True):
    __tablename__ = "image"
    url: str = Field(nullable=False)
    alt_text: Optional[str] = Field(default=None)
    products: List["Product"] = Relationship(
        back_populates="images", link_model=ProductImageLink
    )
    services: List["Service"] = Relationship(
        back_populates="images", link_model=ServiceImageLink
    )
    treatment_plans: List["TreatmentPlan"] = Relationship(
        back_populates="images", link_model=TreatmentPlanImageLink
    )
