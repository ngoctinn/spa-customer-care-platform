# app/services/products_service.py

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
from .base_service import BaseService  # Import lớp cha


# Các hàm helper vẫn giữ lại vì chúng đặc thù cho Product
def _with_product_relationships(statement):
    return statement.options(
        selectinload(Product.categories),
        selectinload(Product.images),
        selectinload(Product.primary_image),
    )


def _ensure_product_category(category: Category) -> None:
    if category.category_type != CategoryTypeEnum.product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Danh mục được chọn không phải danh mục sản phẩm.",
        )


def _get_valid_product_categories(
    db: Session, category_ids: List[uuid.UUID]
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
    product.categories = [cat for cat in product.categories if not cat.is_deleted]
    product.images = [img for img in product.images if not img.is_deleted]
    valid_image_ids = {img.id for img in product.images}
    if product.primary_image_id not in valid_image_ids:
        product.primary_image_id = None
    return product


# Lớp ProductService kế thừa từ BaseService
class ProductService(BaseService[Product, ProductCreate, ProductUpdate]):
    def __init__(self):
        super().__init__(Product)

    # Ghi đè (override) để thêm logic xử lý eager loading
    def get_all(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Product]:
        query = _with_product_relationships(
            select(self.model)
            .where(self.model.is_deleted == False)
            .offset(skip)
            .limit(limit)
        )
        products = db.exec(query).unique().all()
        return [_filter_soft_deleted_relationships(p) for p in products]

    def get_by_id(self, db: Session, *, id: uuid.UUID) -> Product:
        query = _with_product_relationships(
            select(self.model).where(
                self.model.id == id, self.model.is_deleted == False
            )
        )
        product = db.exec(query).unique().first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product với ID {id} không được tìm thấy.",
            )
        return _filter_soft_deleted_relationships(product)

    # Ghi đè (override) để thêm logic đặc thù
    async def create(
        self,
        db: Session,
        *,
        product_in: ProductCreate,
    ) -> Product:
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
                "category_ids",
                "existing_image_ids",
                "new_images",
                "primary_image_id",
            }
        )
        db_product = self.model(
            **product_data
        )  # Không dùng super().create() ở đây vì cần gán categories trước khi commit
        db_product.categories = categories
        db.add(db_product)
        db.commit()
        db.refresh(db_product)

        await sync_images_for_entity(
            db,
            entity=db_product,
            owner_type="product",
            existing_image_ids=product_in.existing_image_ids,
            primary_image_id=product_in.primary_image_id,
        )
        db.commit()
        db.refresh(db_product)
        return self.get_by_id(db, id=db_product.id)

    async def update(
        self,
        db: Session,
        *,
        db_obj: Product,
        obj_in: ProductUpdate,
    ) -> Product:
        product_data = obj_in.model_dump(exclude_unset=True)

        if "name" in product_data and product_data["name"] != db_obj.name:
            existing = db.exec(
                select(Product).where(
                    Product.name == product_data["name"],
                    Product.id != db_obj.id,
                    Product.is_deleted == False,
                )
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Sản phẩm với tên '{product_data['name']}' đã tồn tại.",
                )

        if "category_ids" in product_data:
            db_obj.categories = _get_valid_product_categories(
                db, product_data.pop("category_ids")
            )

        # Gọi super().update() để cập nhật các trường còn lại
        super().update(db, db_obj=db_obj, obj_in=ProductUpdate(**product_data))

        await sync_images_for_entity(
            db,
            entity=db_obj,
            owner_type="product",
            existing_image_ids=obj_in.existing_image_ids,
            primary_image_id=obj_in.primary_image_id,
            alt_text=db_obj.name,
        )
        db.commit()
        db.refresh(db_obj)
        return self.get_by_id(db, id=db_obj.id)


# Tạo một instance duy nhất để import vào API
products_service = ProductService()
