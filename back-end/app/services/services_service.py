# app/services/services_service.py
import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.services_model import Service
from app.models.catalog_model import Image, Category
from app.schemas.services_schema import (
    ServiceCreatePayload,
    ServicePublicWithDetails,
    ServiceUpdate,
)
from app.schemas.catalog_schema import CategoryTypeEnum
from app.core import supabase_client
from fastapi import UploadFile
from app.utils.common import get_object_or_404
from app.services import catalog_service


def _build_service_public_with_details(service: Service) -> ServicePublicWithDetails:
    return ServicePublicWithDetails.model_validate(
        service,
        update={
            "category_ids": [category.id for category in service.categories],
        },
    )


async def create_service(
    db: Session, service_in: ServiceCreatePayload, images: List[UploadFile]
) -> ServicePublicWithDetails:
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
    service_data = service_in.model_dump(exclude={"category_ids"})
    db_service = Service(**service_data)

    # 4. Gán danh sách các danh mục đã được xác thực
    db_service.categories = categories

    db.add(db_service)
    db.commit()
    db.refresh(db_service)

    # 5. Tải hình ảnh (logic không đổi)
    if images:
        is_first_image = True
        for image_file in images:
            if image_file.filename:
                image_url = await supabase_client.upload_image(file=image_file)
                if image_url:
                    db_image = Image(
                        url=image_url,
                        alt_text=db_service.name,
                        service_id=db_service.id,
                        is_primary=is_first_image,
                    )
                    db.add(db_image)
                    is_first_image = False
        db.commit()
        db.refresh(db_service)

    return _build_service_public_with_details(db_service)


def update_service(
    db: Session, db_service: Service, service_in: ServiceUpdate
) -> ServicePublicWithDetails:
    """Cập nhật thông tin dịch vụ, bao gồm cả danh sách danh mục."""
    service_data = service_in.model_dump(exclude_unset=True)

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
    db.commit()
    db.refresh(db_service)
    return _build_service_public_with_details(db_service)


# ... (các hàm get_all_services, get_service_by_id, delete_service giữ nguyên)
def get_all_services(
    db: Session, skip: int = 0, limit: int = 100
) -> List[ServicePublicWithDetails]:
    """Lấy danh sách tất cả dịch vụ CHƯA BỊ XÓA."""
    services = db.exec(
        select(Service).where(Service.is_deleted == False).offset(skip).limit(limit)
    ).all()
    return [_build_service_public_with_details(service) for service in services]


def get_service_by_id(db: Session, service_id: uuid.UUID) -> Service:
    """Lấy dịch vụ bằng ID, đảm bảo nó tồn tại và chưa bị xóa."""
    return get_object_or_404(db, model=Service, obj_id=service_id)


def get_service_details_by_id(
    db: Session, service_id: uuid.UUID
) -> ServicePublicWithDetails:
    """Trả về DTO chi tiết của một dịch vụ."""
    service = get_service_by_id(db=db, service_id=service_id)
    return _build_service_public_with_details(service)


def delete_service(db: Session, db_service: Service) -> Service:
    """XÓA MỀM một dịch vụ."""
    db_service.is_deleted = True
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service
