# app/api/products_api.py
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlmodel import Session

from app.core.dependencies import get_db_session
from app.schemas.products_schema import (
    ProductCreate,
    ProductPublicWithDetails,
    ProductUpdate,
)
from app.services import products_service


router = APIRouter()


@router.post(
    "",
    response_model=ProductPublicWithDetails,
    status_code=status.HTTP_201_CREATED,
)
async def create_product(
    *,
    session: Session = Depends(get_db_session),
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    is_retail: bool = Form(True),
    is_consumable: bool = Form(False),
    base_unit: str = Form(...),
    consumable_unit: Optional[str] = Form(None),
    conversion_rate: Optional[float] = Form(None),
    category_ids: List[uuid.UUID] = Form(...),
    existing_image_ids: Optional[List[uuid.UUID]] = Form(None),
    images: List[UploadFile] = File([]),
):
    """Tạo mới một sản phẩm."""

    product_in = ProductCreate(
        name=name,
        description=description,
        price=price,
        stock=stock,
        is_retail=is_retail,
        is_consumable=is_consumable,
        base_unit=base_unit,
        consumable_unit=consumable_unit,
        conversion_rate=conversion_rate,
        category_ids=category_ids,
        existing_image_ids=existing_image_ids or [],
    )

    return await products_service.create_product(
        db=session,
        product_in=product_in,
        new_images=images,
        existing_image_ids=product_in.existing_image_ids,
    )


@router.get("", response_model=List[ProductPublicWithDetails])
def get_all_products(
    session: Session = Depends(get_db_session), skip: int = 0, limit: int = 100
):
    """Lấy danh sách tất cả sản phẩm chưa bị xóa mềm."""

    return products_service.get_all_products(db=session, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=ProductPublicWithDetails)
def get_product_by_id(
    product_id: uuid.UUID, session: Session = Depends(get_db_session)
):
    """Lấy thông tin chi tiết của một sản phẩm."""

    return products_service.get_product_by_id(db=session, product_id=product_id)


@router.put("/{product_id}", response_model=ProductPublicWithDetails)
async def update_product(
    *,
    product_id: uuid.UUID,
    session: Session = Depends(get_db_session),
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    stock: Optional[int] = Form(None),
    is_retail: Optional[bool] = Form(None),
    is_consumable: Optional[bool] = Form(None),
    base_unit: Optional[str] = Form(None),
    consumable_unit: Optional[str] = Form(None),
    conversion_rate: Optional[float] = Form(None),
    category_ids: Optional[List[uuid.UUID]] = Form(None),
    existing_image_ids: Optional[List[uuid.UUID]] = Form(None),
    images: List[UploadFile] = File([]),
):
    """Cập nhật thông tin một sản phẩm."""

    db_product = products_service.get_product_by_id(db=session, product_id=product_id)

    product_in = ProductUpdate(
        name=name,
        description=description,
        price=price,
        stock=stock,
        is_retail=is_retail,
        is_consumable=is_consumable,
        base_unit=base_unit,
        consumable_unit=consumable_unit,
        conversion_rate=conversion_rate,
        category_ids=category_ids,
    )

    if existing_image_ids is not None:
        product_in.existing_image_ids = existing_image_ids

    if category_ids is not None:
        product_in.category_ids = category_ids

    return await products_service.update_product(
        db=session,
        db_product=db_product,
        product_in=product_in,
        new_images=images,
        existing_image_ids=existing_image_ids,
    )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: uuid.UUID, session: Session = Depends(get_db_session)):
    """Xóa mềm một sản phẩm."""

    db_product = products_service.get_product_by_id(db=session, product_id=product_id)
    products_service.delete_product(db=session, db_product=db_product)
    return
