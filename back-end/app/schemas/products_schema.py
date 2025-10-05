# app/schemas/products_schema.py
import uuid
from typing import Optional
from sqlmodel import SQLModel, Field
from app.schemas.catalog_schema import CategoryPublic, ImagePublic


class ProductBase(SQLModel):
    name: str = Field(max_length=100)
    description: str
    price: float = Field(gt=0)
    stock: int = Field(default=0)
    is_retail: bool = Field(default=True)
    is_consumable: bool = Field(default=False)
    base_unit: str = Field(max_length=50)
    consumable_unit: Optional[str] = Field(default=None, max_length=50)
    conversion_rate: Optional[float] = Field(default=None, gt=0)
    category_id: uuid.UUID = Field(foreign_key="category.id")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(SQLModel):
    name: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    stock: Optional[int] = Field(default=None)
    category_id: Optional[uuid.UUID] = None
    # Thêm các trường khác nếu muốn cho phép cập nhật


class ProductPublic(ProductBase):
    id: uuid.UUID


class ProductPublicWithDetails(ProductPublic):
    model_config = {"from_attributes": True}

    category: CategoryPublic
    images: list[ImagePublic] = Field(default_factory=list)
