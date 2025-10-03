# app/services/services_service.py
import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select

# THAY ĐỔI: Import model mới
from app.models.services_model import Service
from app.models.catalog_model import Image, Category

# THAY ĐỔI: Import schema mới
from app.schemas.services_schema import ServiceCreate, ServiceUpdate
from app.schemas.catalog_schema import CategoryTypeEnum

from app.core import supabase_client
from fastapi import UploadFile
from app.utils.common import get_object_or_404

# THAY ĐỔI: Import service của catalog
from app.services import catalog_service


# =================================================================
# SERVICE CATEGORY LOGIC -> ĐÃ CHUYỂN SANG catalog_service.py
# =================================================================

# =================================================================
# SERVICE LOGIC
# =================================================================


async def create_service(
    db: Session, service_in: ServiceCreate, images: List[UploadFile]
) -> Service:
    """Tạo mới một dịch vụ và tải hình ảnh lên Supabase."""
    # THAY ĐỔI: Kiểm tra sự tồn tại của category chung
    category = catalog_service.get_category_by_id(db, service_in.category_id)
    if category.category_type != CategoryTypeEnum.service:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Danh mục ID {service_in.category_id} không phải là danh mục cho dịch vụ.",
        )

    # Kiểm tra trùng tên dịch vụ (logic không đổi)
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

    db_service = Service.model_validate(service_in)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)

    # THAY ĐỔI: Sử dụng model Image chung
    if images:
        is_first_image = True
        for image_file in images:
            if image_file.filename:
                image_url = await supabase_client.upload_image(file=image_file)
                if image_url:
                    db_image = Image(
                        url=image_url,
                        alt_text=db_service.name,
                        service_id=db_service.id,  # Liên kết với service
                        is_primary=is_first_image,
                    )
                    db.add(db_image)
                    is_first_image = False
        db.commit()
        db.refresh(db_service)

    return db_service


def get_all_services(db: Session, skip: int = 0, limit: int = 100) -> List[Service]:
    """Lấy danh sách tất cả dịch vụ CHƯA BỊ XÓA."""
    services = db.exec(
        select(Service).where(Service.is_deleted == False).offset(skip).limit(limit)
    ).all()
    return services


def get_service_by_id(db: Session, service_id: uuid.UUID) -> Service:
    """Lấy dịch vụ bằng ID, đảm bảo nó tồn tại và chưa bị xóa."""
    return get_object_or_404(db, model=Service, obj_id=service_id)


def update_service(
    db: Session, db_service: Service, service_in: ServiceUpdate
) -> Service:
    """Cập nhật thông tin dịch vụ."""
    if service_in.category_id:
        # Tương tự, kiểm tra category mới có hợp lệ không
        category = catalog_service.get_category_by_id(db, service_in.category_id)
        if category.category_type != CategoryTypeEnum.service:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Danh mục ID {service_in.category_id} không phải là danh mục cho dịch vụ.",
            )

    service_data = service_in.model_dump(exclude_unset=True)
    for key, value in service_data.items():
        setattr(db_service, key, value)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


def delete_service(db: Session, db_service: Service) -> Service:
    """XÓA MỀM một dịch vụ."""
    # Logic không đổi
    db_service.is_deleted = True
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service
