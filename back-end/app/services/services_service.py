# app/services/services_service.py
import uuid
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload, Load
from sqlmodel import Session, select

from app.core.messages import CategoryMessages, ServiceMessages
from app.models.catalog_model import Category
from app.models.services_model import Service
from app.schemas.catalog_schema import CategoryTypeEnum
from app.schemas.services_schema import ServiceCreate, ServiceUpdate
from app.services import catalog_service
from app.services.images_service import sync_images_for_entity
from .base_service import BaseService


class ServiceService(BaseService[Service, ServiceCreate, ServiceUpdate]):
    def __init__(self):
        super().__init__(Service)

    def _get_load_options(self) -> List[Load]:
        """Tải các mối quan hệ cần thiết cho Service."""
        return [
            selectinload(Service.categories),
            selectinload(Service.images),
            selectinload(Service.primary_image),
        ]

    def _filter_relationships(self, service: Service) -> Service:
        """Lọc các mối quan hệ soft-deleted."""
        service.categories = [cat for cat in service.categories if not cat.is_deleted]
        service.images = [img for img in service.images if not img.is_deleted]

        # Dọn dẹp primary_image_id nếu ảnh chính đã bị xóa mềm
        valid_image_ids = {img.id for img in service.images}
        if service.primary_image_id and service.primary_image_id not in valid_image_ids:
            service.primary_image_id = None

        return service

    async def create(
        self,
        db: Session,
        *,
        service_in: ServiceCreate,
    ) -> Service:
        # --- BẮT ĐẦU LOGIC GIAO TÁC ---
        # 1. Kiểm tra dữ liệu đầu vào (validations)
        if not service_in.category_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ServiceMessages.SERVICE_MUST_HAVE_CATEGORY,
            )

        categories = []
        for cat_id in service_in.category_ids:
            category = catalog_service.get_category_by_id(db, cat_id)
            if category.category_type != CategoryTypeEnum.service:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=CategoryMessages.CATEGORY_INVALID_FOR_SERVICE.format(
                        category_id=cat_id
                    ),
                )
            categories.append(category)

        existing_service = db.exec(
            select(Service).where(
                Service.name == service_in.name, Service.is_deleted == False
            )
        ).first()
        if existing_service:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ServiceMessages.SERVICE_NAME_EXISTS.format(name=service_in.name),
            )

        # 2. Chuẩn bị các đối tượng để thêm vào DB
        service_data = service_in.model_dump(
            exclude={"category_ids", "existing_image_ids", "primary_image_id"}
        )
        db_service = self.model(**service_data)
        db_service.categories = categories
        db.add(db_service)

        # 3. Đồng bộ hình ảnh (chỉ thêm vào session, chưa commit)
        await sync_images_for_entity(
            db,
            entity=db_service,
            owner_type="service",
            existing_image_ids=service_in.existing_image_ids,
            primary_image_id=service_in.primary_image_id,
        )

        # 4. Commit một lần duy nhất để đảm bảo tính nguyên tử
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=ServiceMessages.SERVICE_SAVE_ERROR.format(error=e),
            )

        db.refresh(db_service)
        # --- KẾT THÚC LOGIC GIAO TÁC ---

        return self.get_by_id(db, id=db_service.id)

    # Ghi đè phương thức update
    async def update(
        self,
        db: Session,
        *,
        db_obj: Service,
        obj_in: ServiceUpdate,
    ) -> Service:
        # --- BẮT ĐẦU LOGIC GIAO TÁC ---
        service_data = obj_in.model_dump(exclude_unset=True)

        # 1. Cập nhật categories nếu có
        if "category_ids" in service_data and service_data["category_ids"] is not None:
            new_categories = []
            for cat_id in service_data.pop("category_ids"):
                category = catalog_service.get_category_by_id(db, cat_id)
                if category.category_type != CategoryTypeEnum.service:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=CategoryMessages.CATEGORY_INVALID_FOR_SERVICE.format(
                            category_id=cat_id
                        ),
                    )
                new_categories.append(category)
            db_obj.categories = new_categories

        # 2. Cập nhật các trường thông tin cơ bản của service
        update_data_for_base = {
            k: v
            for k, v in service_data.items()
            if k not in ["existing_image_ids", "primary_image_id"]
        }
        for key, value in update_data_for_base.items():
            setattr(db_obj, key, value)
        db.add(db_obj)

        # 3. Đồng bộ hình ảnh
        await sync_images_for_entity(
            db,
            entity=db_obj,
            owner_type="service",
            existing_image_ids=obj_in.existing_image_ids,
            primary_image_id=obj_in.primary_image_id,
        )

        # 4. Commit một lần duy nhất
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=ServiceMessages.SERVICE_SAVE_ERROR.format(error=e),
            )

        db.refresh(db_obj)
        # --- KẾT THÚC LOGIC GIAO TÁC ---

        return self.get_by_id(db, id=db_obj.id)


services_service = ServiceService()
