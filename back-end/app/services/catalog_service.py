# app/services/catalog_service.py
import uuid
from typing import List
from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.catalog_model import Category
from app.schemas.catalog_schema import CategoryCreate, CategoryUpdate, CategoryTypeEnum
from app.utils.common import get_object_or_404


def create_category(db: Session, category_in: CategoryCreate) -> Category:
    """Tạo mới một danh mục chung."""
    # Kiểm tra trùng tên VÀ loại danh mục
    existing_category = db.exec(
        select(Category).where(
            Category.name == category_in.name,
            Category.category_type == category_in.category_type,
            Category.is_deleted == False,
        )
    ).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Danh mục '{category_in.name}' cho loại '{category_in.category_type}' đã tồn tại.",
        )

    db_category = Category.model_validate(category_in)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def get_all_categories_by_type(
    db: Session, category_type: CategoryTypeEnum
) -> List[Category]:
    """Lấy tất cả danh mục theo một loại cụ thể (chưa bị xóa)."""
    categories = db.exec(
        select(Category).where(
            Category.category_type == category_type, Category.is_deleted == False
        )
    ).all()
    return categories


def get_category_by_id(db: Session, category_id: uuid.UUID) -> Category:
    """Lấy danh mục bằng ID, đảm bảo nó tồn tại và chưa bị xóa."""
    return get_object_or_404(db, model=Category, obj_id=category_id)


def update_category(
    db: Session, db_category: Category, category_in: CategoryUpdate
) -> Category:
    """Cập nhật một danh mục."""
    category_data = category_in.model_dump(exclude_unset=True)
    for key, value in category_data.items():
        setattr(db_category, key, value)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, db_category: Category) -> Category:
    """Xóa mềm một danh mục."""
    # Kiểm tra xem danh mục có đang được sử dụng không
    if db_category.services or db_category.products or db_category.treatment_plans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể xóa danh mục đang được sử dụng.",
        )

    db_category.is_deleted = True
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category
