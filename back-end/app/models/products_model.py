# app/models/products_model.py
import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship
from app.models.base_model import BaseUUIDModel
from app.models.association_tables import ProductCategoryLink

if TYPE_CHECKING:
    from app.models.catalog_model import Category, Image


class Product(BaseUUIDModel, table=True):
    __tablename__ = "product"
    name: str = Field(max_length=100, nullable=False, unique=True, index=True)
    description: str = Field(nullable=False)
    price: float = Field(gt=0, nullable=False)
    stock: int = Field(default=0)
    is_retail: bool = Field(default=True)
    is_consumable: bool = Field(default=False)
    base_unit: str = Field(max_length=50)  # vd: "chai", "lọ"
    consumable_unit: Optional[str] = Field(default=None, max_length=50)  # vd: "ml", "g"
    conversion_rate: Optional[float] = Field(default=None, gt=0)  # Tỷ lệ quy đổi

    categories: List["Category"] = Relationship(
        back_populates="products", link_model=ProductCategoryLink
    )
    images: List["Image"] = Relationship(
        back_populates="product",
        sa_relationship_kwargs={"foreign_keys": "Image.product_id"},
    )
    primary_image_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="image.id", nullable=True
    )
    primary_image: Optional["Image"] = Relationship(
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "Product.primary_image_id",
        }
    )
