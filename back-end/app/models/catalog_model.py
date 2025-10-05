# app/models/catalog_model.py
import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from app.models.base_model import BaseUUIDModel

# Import bảng liên kết mới
from app.models.association_tables import ProductCategoryLink, ServiceCategoryLink

if TYPE_CHECKING:
    from app.models.services_model import Service
    from app.models.products_model import Product
    from app.models.treatment_plans_model import TreatmentPlan


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
    service_id: Optional[uuid.UUID] = Field(default=None, foreign_key="service.id")
    product_id: Optional[uuid.UUID] = Field(default=None, foreign_key="product.id")
    treatment_plan_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="treatment_plan.id"
    )
    service: Optional["Service"] = Relationship(
        back_populates="images",
        sa_relationship_kwargs={"foreign_keys": "Image.service_id"},
    )
    product: Optional["Product"] = Relationship(
        back_populates="images",
        sa_relationship_kwargs={"foreign_keys": "Image.product_id"},
    )
    treatment_plan: Optional["TreatmentPlan"] = Relationship(
        back_populates="images",
        sa_relationship_kwargs={"foreign_keys": "Image.treatment_plan_id"},
    )

