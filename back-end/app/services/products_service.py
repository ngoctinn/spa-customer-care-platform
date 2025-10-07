# app/services/products_service.py
"""Service layer cho quản lý sản phẩm."""

import uuid
from typing import List, Optional

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.models.catalog_model import Category
from app.models.products_model import Product
from app.schemas.catalog_schema import CategoryTypeEnum
from app.schemas.products_schema import ProductCreate, ProductUpdate
from app.services import catalog_service
from app.services.images_service import sync_images_for_entity


def _with_product_relationships(statement):
    """Helper để load category và images cho product."""

    return statement.options(
        selectinload(Product.categories),
        selectinload(Product.images),
        selectinload(Product.primary_image),
    )


def _ensure_product_category(category: Category) -> None:
    """Đảm bảo danh mục được gán cho sản phẩm là loại product."""

    if category.category_type != CategoryTypeEnum.product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Danh mục được chọn không phải danh mục sản phẩm.",
        )


def _get_valid_product_categories(
    db: Session, category_ids: Optional[List[uuid.UUID]]
) -> List[Category]:
    if not category_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sản phẩm phải thuộc ít nhất một danh mục.",
        )

    categories: List[Category] = []
    seen_ids: set[uuid.UUID] = set()
    for category_id in category_ids:
        if category_id in seen_ids:
            continue
        seen_ids.add(category_id)
        category = catalog_service.get_category_by_id(db, category_id)
        _ensure_product_category(category)
        categories.append(category)

    return categories


def _filter_soft_deleted_relationships(product: Product) -> Product:
    """Loại bỏ các quan hệ đã bị xóa mềm trước khi trả về."""

    product.categories = [
        category for category in product.categories if not category.is_deleted
    ]
    product.images = [image for image in product.images if not image.is_deleted]
    valid_image_ids = {image.id for image in product.images}
    if product.primary_image_id not in valid_image_ids:
        product.primary_image_id = None
    return product


async def create_product(
    db: Session,
    product_in: ProductCreate,
    *,
    new_images: Optional[List[UploadFile]] = None,
    existing_image_ids: Optional[List[uuid.UUID]] = None,
    primary_image_id: Optional[uuid.UUID] = None,
) -> Product:
    """Tạo mới một sản phẩm."""

    categories = _get_valid_product_categories(db, product_in.category_ids)

    existing_product = db.exec(
        select(Product).where(
            Product.name == product_in.name, Product.is_deleted == False
        )
    ).first()
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sản phẩm với tên '{product_in.name}' đã tồn tại.",
        )

    product_data = product_in.model_dump(
        exclude={
            "existing_image_ids",
            "new_images",
            "category_ids",
            "primary_image_id",
        }
    )
    db_product = Product(**product_data)
    db_product.categories = categories
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    await sync_images_for_entity(
        db,
        entity=db_product,
        owner_type="product",
        new_images=new_images,
        existing_image_ids=(
            existing_image_ids
            if existing_image_ids is not None
            else product_in.existing_image_ids
        ),
        primary_image_id=(
            primary_image_id
            if primary_image_id is not None
            else product_in.primary_image_id
        ),
        alt_text=db_product.name,
    )
    db.commit()
    db.refresh(db_product)

    return get_product_by_id(db, db_product.id)


def get_all_products(db: Session, skip: int = 0, limit: int = 100) -> List[Product]:
    """Lấy danh sách sản phẩm chưa bị xóa mềm."""

    statement = _with_product_relationships(
        select(Product).where(Product.is_deleted == False).offset(skip).limit(limit)
    )
    products = db.exec(statement).unique().all()
    return [_filter_soft_deleted_relationships(product) for product in products]


def get_product_by_id(db: Session, product_id: uuid.UUID) -> Product:
    """Lấy thông tin chi tiết của một sản phẩm."""

    statement = _with_product_relationships(
        select(Product).where(
            Product.id == product_id,
            Product.is_deleted == False,
        )
    )
    product = db.exec(statement).unique().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product với ID {product_id} không được tìm thấy.",
        )
    return _filter_soft_deleted_relationships(product)


async def update_product(
    db: Session,
    db_product: Product,
    product_in: ProductUpdate,
    *,
    new_images: Optional[List[UploadFile]] = None,
    existing_image_ids: Optional[List[uuid.UUID]] = None,
    primary_image_id: Optional[uuid.UUID] = None,
) -> Product:
    """Cập nhật thông tin một sản phẩm."""

    product_data = product_in.model_dump(exclude_unset=True)
    product_data.pop("existing_image_ids", None)
    product_data.pop("new_images", None)
    product_data.pop("primary_image_id", None)

    if "name" in product_data:
        existing_product = db.exec(
            select(Product).where(
                Product.name == product_data["name"],
                Product.id != db_product.id,
                Product.is_deleted == False,
            )
        ).first()
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Sản phẩm với tên '{product_data['name']}' đã tồn tại.",
            )

    if "category_ids" in product_data:
        new_category_ids = product_data.pop("category_ids")
        categories = _get_valid_product_categories(db, new_category_ids)
        db_product.categories = categories

    for key, value in product_data.items():
        setattr(db_product, key, value)

    db.add(db_product)
    db.flush()

    await sync_images_for_entity(
        db,
        entity=db_product,
        owner_type="product",
        new_images=new_images,
        existing_image_ids=(
            existing_image_ids
            if existing_image_ids is not None
            else product_in.existing_image_ids
        ),
        primary_image_id=(
            primary_image_id
            if primary_image_id is not None
            else product_in.primary_image_id
        ),
        alt_text=db_product.name,
    )

    db.commit()
    db.refresh(db_product)

    return get_product_by_id(db, db_product.id)


def delete_product(db: Session, db_product: Product) -> Product:
    """Xóa mềm một sản phẩm."""

    db_product.is_deleted = True
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product
