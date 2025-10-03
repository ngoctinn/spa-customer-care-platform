# app/models/catalog_model.py
import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from app.models.base_model import BaseUUIDModel

# Forward references để tránh lỗi import vòng tròn
if TYPE_CHECKING:
    from app.models.services_model import Service
    from app.models.products_model import Product
    from app.models.treatment_plans_model import TreatmentPlan


# =================================================================
# MODEL CHUNG CHO DANH MỤC
# =================================================================
class Category(BaseUUIDModel, table=True):
    __tablename__ = "category"
    name: str = Field(index=True, nullable=False, max_length=100)
    description: Optional[str] = Field(default=None)
    # Trường để phân loại: 'service', 'product', 'treatment_plan'
    category_type: str = Field(index=True, nullable=False)

    # Quan hệ ngược lại từ các model con
    services: List["Service"] = Relationship(back_populates="category")
    products: List["Product"] = Relationship(back_populates="category")
    treatment_plans: List["TreatmentPlan"] = Relationship(back_populates="category")


# =================================================================
# MODEL CHUNG CHO HÌNH ẢNH
# =================================================================
class Image(BaseUUIDModel, table=True):
    __tablename__ = "image"
    url: str = Field(nullable=False)
    alt_text: Optional[str] = Field(default=None)
    is_primary: bool = Field(default=False)

    # Khóa ngoại tới các loại mặt hàng (chỉ một trong các khóa này có giá trị)
    service_id: Optional[uuid.UUID] = Field(default=None, foreign_key="service.id")
    product_id: Optional[uuid.UUID] = Field(default=None, foreign_key="product.id")
    treatment_plan_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="treatment_plan.id"
    )

    # Quan hệ ngược lại
    service: Optional["Service"] = Relationship(back_populates="images")
    product: Optional["Product"] = Relationship(back_populates="images")
    treatment_plan: Optional["TreatmentPlan"] = Relationship(back_populates="images")
