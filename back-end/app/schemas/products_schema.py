# app/schemas/products_schema.py
"""Schema phục vụ CRUD sản phẩm cùng quan hệ nhiều-nhiều với hình ảnh."""

from __future__ import annotations

import uuid
from typing import List, Optional

from fastapi import UploadFile
from pydantic import field_validator
from sqlmodel import Field, SQLModel

from app.schemas.catalog_schema import CategoryPublic, ImagePublic


class ProductBase(SQLModel):
    """Các thuộc tính chung cho sản phẩm."""

    model_config = {"from_attributes": True}

    name: str = Field(max_length=100)
    description: str
    price: float = Field(gt=0)
    stock: int = Field(default=0)
    is_retail: bool = Field(default=True)
    is_consumable: bool = Field(default=False)
    base_unit: str = Field(max_length=50)
    consumable_unit: Optional[str] = Field(default=None, max_length=50)
    conversion_rate: Optional[float] = Field(default=None, gt=0)


class ProductCreate(ProductBase):
    """Payload tạo mới sản phẩm."""

    model_config = {"arbitrary_types_allowed": True}

    category_ids: List[uuid.UUID] = Field(
        default_factory=list,
        description="Danh sách ID của các danh mục sản phẩm",
    )
    existing_image_ids: List[uuid.UUID] = Field(
        default_factory=list,
        description="Danh sách ID hình ảnh cần liên kết với sản phẩm",
    )
    primary_image_id: uuid.UUID | None = Field(
        default=None,
        description="ID của hình ảnh sẽ được đặt làm ảnh chính",
    )
    new_images: List[UploadFile] = Field(default_factory=list, exclude=True)

    @field_validator("category_ids")
    @classmethod
    def _validate_category_ids(cls, value: List[uuid.UUID]) -> List[uuid.UUID]:
        if not value:
            raise ValueError("Sản phẩm phải thuộc ít nhất một danh mục.")
        return list(dict.fromkeys(value))

    @field_validator("existing_image_ids")
    @classmethod
    def _deduplicate_existing_image_ids(
        cls, value: List[uuid.UUID]
    ) -> List[uuid.UUID]:
        return list(dict.fromkeys(value))


class ProductUpdate(SQLModel):
    """Payload cập nhật sản phẩm."""

    name: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    stock: Optional[int] = Field(default=None)
    is_retail: Optional[bool] = None
    is_consumable: Optional[bool] = None
    base_unit: Optional[str] = Field(default=None, max_length=50)
    consumable_unit: Optional[str] = Field(default=None, max_length=50)
    conversion_rate: Optional[float] = Field(default=None, gt=0)
    category_ids: Optional[List[uuid.UUID]] = Field(default=None)
    # Thêm các trường khác nếu muốn cho phép cập nhật
    existing_image_ids: Optional[List[uuid.UUID]] = Field(default=None, exclude=True)
    new_images: Optional[List[UploadFile]] = Field(default=None, exclude=True)
    primary_image_id: uuid.UUID | None = Field(
        default=None,
        description="ID của hình ảnh sẽ được đặt làm ảnh chính",
    )

    model_config = {"arbitrary_types_allowed": True}

    @field_validator("category_ids")
    @classmethod
    def _validate_update_category_ids(
        cls, value: Optional[List[uuid.UUID]]
    ) -> Optional[List[uuid.UUID]]:
        if value is None:
            return None
        if not value:
            raise ValueError("Sản phẩm phải thuộc ít nhất một danh mục.")
        return list(dict.fromkeys(value))

    @field_validator("existing_image_ids")
    @classmethod
    def _deduplicate_update_existing_image_ids(
        cls, value: Optional[List[uuid.UUID]]
    ) -> Optional[List[uuid.UUID]]:
        if value is None:
            return None
        return list(dict.fromkeys(value))


class ProductPublic(ProductBase):
    id: uuid.UUID


class ProductPublicWithDetails(ProductPublic):
    categories: list[CategoryPublic] = Field(default_factory=list)
    images: list[ImagePublic] = Field(default_factory=list)
    primary_image_id: uuid.UUID | None = None
