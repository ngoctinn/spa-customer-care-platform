# app/services/products_service.py
"""Service layer cho quản lý sản phẩm."""

import uuid
from typing import List, Optional

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core import supabase_client
from app.models.catalog_model import Category, Image
from app.models.products_model import Product
from app.schemas.catalog_schema import CategoryTypeEnum
from app.schemas.products_schema import ProductCreate, ProductUpdate
from app.services import catalog_service


def _with_product_relationships(statement):
    """Helper để load category và images cho product."""

    return statement.options(
        selectinload(Product.categories),
        selectinload(Product.images),
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
    return product


def _get_active_product_images(product: Product) -> List[Image]:
    return sorted(
        [image for image in product.images if not image.is_deleted],
        key=lambda image: (not image.is_primary, image.created_at),
    )


def _get_image_by_id(db: Session, image_id: uuid.UUID) -> Image:
    image = db.exec(
        select(Image).where(Image.id == image_id, Image.is_deleted == False)
    ).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Image với ID {image_id} không được tìm thấy.",
        )
    return image


async def _sync_product_images(
    db: Session,
    *,
    product: Product,
    new_images: Optional[List[UploadFile]] = None,
    existing_image_ids: Optional[List[uuid.UUID]] = None,
) -> None:
    current_images = _get_active_product_images(product)

    if existing_image_ids is None:
        existing_image_ids = [image.id for image in current_images]
    else:
        existing_image_ids = list(existing_image_ids)

    keep_image_ids = set(existing_image_ids)
    for image in current_images:
        if image.id not in keep_image_ids:
            image.product_id = None
            image.is_primary = False
            db.add(image)

    ordered_images: List[Image] = []
    seen_ids: set[uuid.UUID] = set()
    for image_id in existing_image_ids:
        if image_id in seen_ids:
            continue
        seen_ids.add(image_id)
        image = _get_image_by_id(db, image_id)
        image.product_id = product.id
        image.service_id = None
        image.treatment_plan_id = None
        image.is_primary = False
        db.add(image)
        ordered_images.append(image)

    for image_file in new_images or []:
        if not getattr(image_file, "filename", None):
            continue
        image_url = await supabase_client.upload_image(file=image_file)
        if not image_url:
            continue
        db_image = Image(
            url=image_url,
            alt_text=product.name,
            product_id=product.id,
            is_primary=False,
        )
        db.add(db_image)
        db.flush()
        ordered_images.append(db_image)

    for index, image in enumerate(ordered_images):
        image.is_primary = index == 0
        db.add(image)


async def create_product(
    db: Session,
    product_in: ProductCreate,
    *,
    new_images: Optional[List[UploadFile]] = None,
    existing_image_ids: Optional[List[uuid.UUID]] = None,
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
        exclude={"existing_image_ids", "new_images", "category_ids"}
    )
    db_product = Product(**product_data)
    db_product.categories = categories
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    await _sync_product_images(
        db,
        product=db_product,
        new_images=new_images,
        existing_image_ids=existing_image_ids
        if existing_image_ids is not None
        else product_in.existing_image_ids,
    )
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


async def update_product(
    db: Session,
    db_product: Product,
    product_in: ProductUpdate,
    *,
    new_images: Optional[List[UploadFile]] = None,
    existing_image_ids: Optional[List[uuid.UUID]] = None,
) -> Product:
    """Cập nhật thông tin một sản phẩm."""

    product_data = product_in.model_dump(exclude_unset=True)
    product_data.pop("existing_image_ids", None)
    product_data.pop("new_images", None)

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

    await _sync_product_images(
        db,
        product=db_product,
        new_images=new_images,
        existing_image_ids=
        existing_image_ids
        if existing_image_ids is not None
        else product_in.existing_image_ids,
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
