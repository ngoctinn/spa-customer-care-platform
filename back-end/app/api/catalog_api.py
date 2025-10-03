# app/api/catalog_api.py
import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.dependencies import get_db_session
from app.schemas.catalog_schema import (
    CategoryCreate,
    CategoryPublic,
    CategoryUpdate,
    CategoryTypeEnum,
)
from app.services import catalog_service

router = APIRouter()


@router.post(
    "/categories",
    response_model=CategoryPublic,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    *,
    session: Session = Depends(get_db_session),
    category_in: CategoryCreate,
):
    """Tạo một danh mục mới cho một loại mặt hàng cụ thể."""
    return catalog_service.create_category(db=session, category_in=category_in)


@router.get("/categories", response_model=List[CategoryPublic])
def get_all_categories_by_type(
    type: CategoryTypeEnum,  # Dùng query parameter để lọc
    session: Session = Depends(get_db_session),
):
    """
    Lấy danh sách tất cả danh mục theo loại: `service`, `product`, hoặc `treatment_plan`.
    """
    return catalog_service.get_all_categories_by_type(db=session, category_type=type)


@router.get("/categories/{category_id}", response_model=CategoryPublic)
def get_category_by_id(
    category_id: uuid.UUID, session: Session = Depends(get_db_session)
):
    """Lấy thông tin chi tiết một danh mục bằng ID."""
    return catalog_service.get_category_by_id(db=session, category_id=category_id)


@router.put("/categories/{category_id}", response_model=CategoryPublic)
def update_category(
    category_id: uuid.UUID,
    category_in: CategoryUpdate,
    session: Session = Depends(get_db_session),
):
    """Cập nhật thông tin một danh mục."""
    db_category = catalog_service.get_category_by_id(
        db=session, category_id=category_id
    )
    return catalog_service.update_category(
        db=session, db_category=db_category, category_in=category_in
    )


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: uuid.UUID, session: Session = Depends(get_db_session)):
    """Xóa mềm một danh mục."""
    db_category = catalog_service.get_category_by_id(
        db=session, category_id=category_id
    )
    catalog_service.delete_category(db=session, db_category=db_category)
    return
