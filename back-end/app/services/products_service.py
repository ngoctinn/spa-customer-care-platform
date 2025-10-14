# app/services/products_service.py
import uuid
from typing import List
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.messages import CategoryMessages, ProductMessages
from app.core.exceptions import ProductExceptions
from app.models.catalog_model import Category
from app.models.products_model import Product
from app.schemas.catalog_schema import CategoryTypeEnum
from app.schemas.products_schema import ProductCreate, ProductUpdate
from app.services import catalog_service
from app.services.images_service import sync_images_for_entity
from .base_service import BaseService


def _ensure_product_category(category: Category) -> None:
    if category.category_type != CategoryTypeEnum.product:
        raise ProductExceptions.invalid_category_for_product()


def _get_valid_product_categories(
    db: Session, category_ids: List[uuid.UUID]
) -> List[Category]:
    if not category_ids:
        raise ProductExceptions.product_must_have_category()
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


class ProductService(BaseService[Product, ProductCreate, ProductUpdate]):
    def __init__(self):
        super().__init__(Product)

    def _get_load_options(self):
        return [
            selectinload(Product.categories),
            selectinload(Product.images),
            selectinload(Product.primary_image),
        ]

    def _filter_relationships(self, product: Product) -> Product:
        """Lọc các mối quan hệ soft-deleted."""
        # Lọc danh mục
        product.categories = [cat for cat in product.categories if not cat.is_deleted]
        # Lọc hình ảnh
        product.images = [img for img in product.images if not img.is_deleted]

        # Dọn dẹp primary_image_id nếu ảnh chính đã bị xóa mềm
        valid_image_ids = {img.id for img in product.images}
        if product.primary_image_id and product.primary_image_id not in valid_image_ids:
            product.primary_image_id = None

        return product

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
            raise ProductExceptions.product_name_exists()

        product_data = product_in.model_dump(
            exclude={
                "category_ids",
                "existing_image_ids",
                "primary_image_id",
            }
        )
        db_product = self.model(**product_data)
        db_product.categories = categories
        db.add(db_product)

        await sync_images_for_entity(
            db,
            entity=db_product,
            owner_type="product",
            existing_image_ids=product_in.existing_image_ids,
            primary_image_id=product_in.primary_image_id,
        )

        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise ProductExceptions.product_save_error()

        db.refresh(db_product)
        return self.get_by_id(db, id=db_product.id)

    async def update(
        self,
        db: Session,
        *,
        db_obj: Product,
        obj_in: ProductUpdate,
    ) -> Product:
        # Tương tự như create, chúng ta sẽ thực hiện tất cả các thay đổi
        # và chỉ commit một lần ở cuối.
        product_data = obj_in.model_dump(exclude_unset=True)

        if "name" in product_data and product_data["name"] != db_obj.name:
            # ... (logic kiểm tra tên tồn tại giữ nguyên)
            existing = db.exec(
                select(Product).where(
                    Product.name == product_data["name"],
                    Product.id != db_obj.id,
                    Product.is_deleted == False,
                )
            ).first()
            if existing:
                raise ProductExceptions.product_name_exists()

        if "category_ids" in product_data:
            db_obj.categories = _get_valid_product_categories(
                db, product_data.pop("category_ids")
            )

        # 1. Cập nhật các trường cơ bản
        # Gọi super().update nhưng không commit ngay
        obj_data_for_base = {
            k: v
            for k, v in product_data.items()
            if k not in ["existing_image_ids", "primary_image_id"]
        }
        for field, value in obj_data_for_base.items():
            setattr(db_obj, field, value)
        db.add(db_obj)

        # 2. Đồng bộ hình ảnh
        await sync_images_for_entity(
            db,
            entity=db_obj,
            owner_type="product",
            existing_image_ids=obj_in.existing_image_ids,
            primary_image_id=obj_in.primary_image_id,
        )

        # 3. Commit một lần duy nhất
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise ProductExceptions.product_save_error()

        db.refresh(db_obj)
        return self.get_by_id(db, id=db_obj.id)


# Tạo một instance duy nhất để import vào API
products_service = ProductService()
