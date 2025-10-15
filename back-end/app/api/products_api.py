# app/api/products_api.py
import uuid
from typing import List

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.dependencies import get_db_session
from app.schemas.products_schema import (
    ProductCreate,
    ProductPublicWithDetails,
    ProductUpdate,
)
from app.services.products_service import products_service


router = APIRouter()


@router.post(
    "",
    response_model=ProductPublicWithDetails,
    status_code=status.HTTP_201_CREATED,
)
async def create_product(
    *,
    db: Session = Depends(get_db_session),
    product_in: ProductCreate,
):
    """Tạo mới một sản phẩm."""

    return await products_service.create(
        db=db,
        product_in=product_in,
    )


@router.get("", response_model=List[ProductPublicWithDetails])
def get_all_products(
    db: Session = Depends(get_db_session), skip: int = 0, limit: int = 100
):
    """Lấy danh sách sản phẩm chưa bị xóa mềm."""

    return products_service.get_all(db=db, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=ProductPublicWithDetails)
def get_product_by_id(
    product_id: uuid.UUID, db: Session = Depends(get_db_session)
):
    """Lấy chi tiết của một sản phẩm."""

    return products_service.get_by_id(db=db, id=product_id)


@router.put("/{product_id}", response_model=ProductPublicWithDetails)
async def update_product(
    *,
    db: Session = Depends(get_db_session),
    product_id: uuid.UUID,
    product_in: ProductUpdate,
):
    """Cập nhật sản phẩm theo ID."""
    db_product = products_service.get_by_id(db=db, id=product_id)
    return await products_service.update(
        db=db,
        db_obj=db_product,
        obj_in=product_in,
    )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: uuid.UUID, db: Session = Depends(get_db_session)):
    """Xóa mềm một sản phẩm."""

    db_product = products_service.get_by_id(db=db, id=product_id)
    products_service.delete(db=db, db_obj=db_product)
    return
