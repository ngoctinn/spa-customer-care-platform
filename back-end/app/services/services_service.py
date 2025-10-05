# app/services/services_service.py
import uuid
from typing import List, Optional

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.models.catalog_model import Category
from app.models.services_model import Service
from app.schemas.catalog_schema import CategoryTypeEnum
from app.schemas.services_schema import ServiceCreate, ServiceUpdate
from app.services import catalog_service
from app.services.images_service import sync_entity_images


def _filter_soft_deleted_relationships(service: Service) -> Service:
    service.images = [image for image in service.images if not image.is_deleted]
    service.categories = [
        category for category in service.categories if not category.is_deleted
    ]
    valid_image_ids = {image.id for image in service.images}
    if service.primary_image_id not in valid_image_ids:
        service.primary_image_id = None
    return service


async def create_service(
    db: Session,
    service_in: ServiceCreate,
    images: Optional[List[UploadFile]] = None,
) -> Service:
    """Tạo mới một dịch vụ, liên kết với nhiều danh mục và tải hình ảnh."""
    # 1. Kiểm tra sự tồn tại của các danh mục
    categories = []
    if not service_in.category_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dịch vụ phải thuộc về ít nhất một danh mục.",
        )

    for cat_id in service_in.category_ids:
        category = catalog_service.get_category_by_id(db, cat_id)
        if category.category_type != CategoryTypeEnum.service:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Danh mục ID {cat_id} không phải là danh mục cho dịch vụ.",
            )
        categories.append(category)

    # 2. Kiểm tra trùng tên dịch vụ
    existing_service = db.exec(
        select(Service).where(
            Service.name == service_in.name, Service.is_deleted == False
        )
    ).first()
    if existing_service:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dịch vụ với tên '{service_in.name}' đã tồn tại.",
        )

    # 3. Tạo đối tượng dịch vụ
    service_data = service_in.model_dump(
        exclude={
            "category_ids",
            "existing_image_ids",
            "new_images",
            "primary_image_id",
        }
    )
    db_service = Service(**service_data)

    # 4. Gán danh sách các danh mục đã được xác thực
    db_service.categories = categories

    db.add(db_service)
    db.commit()
    db.refresh(db_service)

    await sync_entity_images(
        db,
        entity=db_service,
        owner="service",
        new_images=images,
        existing_image_ids=service_in.existing_image_ids,
        primary_image_id=service_in.primary_image_id,
        alt_text=db_service.name,
    )

    db.commit()
    db.refresh(db_service)

    return get_service_by_id(db, db_service.id)


async def update_service(
    db: Session,
    db_service: Service,
    service_in: ServiceUpdate,
    *,
    new_images: Optional[List[UploadFile]] = None,
    existing_image_ids: Optional[List[uuid.UUID]] = None,
    primary_image_id: Optional[uuid.UUID] = None,
) -> Service:
    """Cập nhật thông tin dịch vụ, bao gồm cả danh sách danh mục."""
    service_data = service_in.model_dump(exclude_unset=True)
    service_data.pop("existing_image_ids", None)
    service_data.pop("new_images", None)
    service_data.pop("primary_image_id", None)

    # Cập nhật danh sách danh mục nếu có
    if "category_ids" in service_data:
        new_category_ids = service_data.pop("category_ids")
        new_categories = []
        for cat_id in new_category_ids:
            category = catalog_service.get_category_by_id(db, cat_id)
            if category.category_type != CategoryTypeEnum.service:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Danh mục ID {cat_id} không phải là danh mục cho dịch vụ.",
                )
            new_categories.append(category)
        db_service.categories = new_categories

    # Cập nhật các trường thông thường
    for key, value in service_data.items():
        setattr(db_service, key, value)

    db.add(db_service)
    db.flush()

    await sync_entity_images(
        db,
        entity=db_service,
        owner="service",
        new_images=new_images,
        existing_image_ids=(
            existing_image_ids
            if existing_image_ids is not None
            else service_in.existing_image_ids
        ),
        primary_image_id=(
            primary_image_id
            if primary_image_id is not None
            else service_in.primary_image_id
        ),
        alt_text=db_service.name,
    )

    db.commit()
    db.refresh(db_service)
    return get_service_by_id(db, db_service.id)


# ... (các hàm get_all_services, get_service_by_id, delete_service giữ nguyên)
def get_all_services(db: Session, skip: int = 0, limit: int = 100) -> List[Service]:
    """Lấy danh sách tất cả dịch vụ CHƯA BỊ XÓA."""
    statement = (
        select(Service)
        .options(
            selectinload(Service.categories),
            selectinload(Service.images),
            selectinload(Service.primary_image),
        )
        .where(Service.is_deleted == False)
        .offset(skip)
        .limit(limit)
    )
    services = db.exec(statement).unique().all()
    return [_filter_soft_deleted_relationships(service) for service in services]


def get_service_by_id(db: Session, service_id: uuid.UUID) -> Service:
    """Lấy dịch vụ bằng ID, đảm bảo nó tồn tại và chưa bị xóa."""

    statement = (
        select(Service)
        .options(
            selectinload(Service.categories),
            selectinload(Service.images),
            selectinload(Service.primary_image),
        )
        .where(Service.id == service_id, Service.is_deleted == False)
    )
    service = db.exec(statement).unique().first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service với ID {service_id} không được tìm thấy.",
        )
    return _filter_soft_deleted_relationships(service)


def delete_service(db: Session, db_service: Service) -> Service:
    """XÓA MỀM một dịch vụ."""
    db_service.is_deleted = True
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service
