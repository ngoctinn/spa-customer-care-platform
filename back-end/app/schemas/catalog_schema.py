# app/schemas/catalog_schema.py
import uuid
from typing import Any, Optional
from sqlmodel import SQLModel, Field
from enum import Enum


# =================================================================
# SCHEMAS CHUNG CHO HÌNH ẢNH
# =================================================================
class ImageBase(SQLModel):
    url: str
    alt_text: str | None = Field(default=None)
    is_primary: bool = Field(default=False)


class ImagePublic(ImageBase):
    id: uuid.UUID


# =================================================================
# SCHEMAS CHUNG CHO DANH MỤC
# =================================================================
class CategoryTypeEnum(str, Enum):
    service = "service"
    product = "product"
    treatment_plan = "treatment_plan"


class CategoryBase(SQLModel):
    name: str = Field(max_length=100)
    description: str | None


class CategoryCreate(CategoryBase):
    category_type: CategoryTypeEnum


class CategoryUpdate(SQLModel):
    name: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = None


class CategoryPublic(CategoryBase):
    id: uuid.UUID
    category_type: str


class CategoryPublicWithItems(CategoryPublic):
    model_config = {"from_attributes": True}

    # Dùng Any để linh hoạt, sẽ được thay thế ở các schema con
    items: list[Any] = Field(default_factory=list)
