# app/services/products_service.py
import uuid
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.models.catalog_model import Category
from app.models.products_model import Product
from app.schemas.catalog_schema import CategoryTypeEnum
from app.schemas.products_schema import ProductCreate, ProductUpdate
from app.services import catalog_service


def _with_product_relationships(statement):
    """Helper để load category và images cho product."""

    return statement.options(
        selectinload(Product.category),
        selectinload(Product.images),
    )


def _ensure_product_category(category: Category) -> None:
    """Đảm bảo danh mục được gán cho sản phẩm là loại product."""

    if category.category_type != CategoryTypeEnum.product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Danh mục được chọn không phải danh mục sản phẩm.",
        )


def _filter_soft_deleted_relationships(product: Product) -> Product:
    """Loại bỏ các quan hệ đã bị xóa mềm trước khi trả về."""

    product.images = [image for image in product.images if not image.is_deleted]
    return product


def create_product(db: Session, product_in: ProductCreate) -> Product:
    """Tạo mới một sản phẩm."""

    category = catalog_service.get_category_by_id(db, product_in.category_id)
    _ensure_product_category(category)

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

    db_product = Product(**product_in.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    return get_product_by_id(db, db_product.id)


def get_all_products(db: Session, skip: int = 0, limit: int = 100) -> List[Product]:
    """Lấy danh sách sản phẩm chưa bị xóa mềm."""

    statement = _with_product_relationships(
        select(Product)
        .where(Product.is_deleted == False)
        .offset(skip)
        .limit(limit)
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


def update_product(
    db: Session, db_product: Product, product_in: ProductUpdate
) -> Product:
    """Cập nhật thông tin một sản phẩm."""

    product_data = product_in.model_dump(exclude_unset=True)

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

    if "category_id" in product_data and product_data["category_id"]:
        category = catalog_service.get_category_by_id(db, product_data["category_id"])
        _ensure_product_category(category)

    for key, value in product_data.items():
        setattr(db_product, key, value)

    db.add(db_product)
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
