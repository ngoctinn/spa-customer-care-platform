# app/services/services_service.py
import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select
from app.models.services_model import Service, ServiceCategory, ServiceImage
from app.schemas.services_schema import (
    ServiceCreate,
    ServiceUpdate,
    ServiceCategoryCreate,
    ServiceCategoryUpdate,
)

from app.core import supabase_client
from fastapi import UploadFile

# =================================================================
# SERVICE CATEGORY LOGIC
# =================================================================


def create_service_category(
    db: Session, category_in: ServiceCategoryCreate
) -> ServiceCategory:
    """Tạo mới một danh mục dịch vụ."""
    # Chỉ kiểm tra trùng tên với các danh mục chưa bị xóa
    existing_category = db.exec(
        select(ServiceCategory).where(
            ServiceCategory.name == category_in.name,
            ServiceCategory.is_deleted == False,
        )
    ).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Danh mục với tên '{category_in.name}' đã tồn tại.",
        )
    db_category = ServiceCategory.model_validate(category_in)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def get_all_service_categories(db: Session) -> List[ServiceCategory]:
    """Lấy tất cả danh mục dịch vụ CHƯA BỊ XÓA."""
    # Thêm điều kiện is_deleted == False
    categories = db.exec(
        select(ServiceCategory).where(ServiceCategory.is_deleted == False)
    ).all()
    return categories


def get_category_by_id(
    db: Session, category_id: uuid.UUID
) -> Optional[ServiceCategory]:
    """Lấy danh mục bằng ID, miễn là nó CHƯA BỊ XÓA."""
    # Thay db.get bằng câu lệnh select để thêm điều kiện is_deleted
    category = db.exec(
        select(ServiceCategory).where(
            ServiceCategory.id == category_id, ServiceCategory.is_deleted == False
        )
    ).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy danh mục với ID: {category_id}",
        )
    return category


def update_service_category(
    db: Session, db_category: ServiceCategory, category_in: ServiceCategoryUpdate
) -> ServiceCategory:
    """Cập nhật một danh mục dịch vụ."""
    category_data = category_in.model_dump(exclude_unset=True)
    for key, value in category_data.items():
        setattr(db_category, key, value)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_service_category(
    db: Session, db_category: ServiceCategory
) -> ServiceCategory:
    """XÓA MỀM một danh mục dịch vụ."""
    active_services = [s for s in db_category.services if not s.is_deleted]
    if active_services:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể xóa danh mục đang có dịch vụ.",
        )
    # Thay vì xóa, chỉ cập nhật cờ is_deleted
    db_category.is_deleted = True
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


# =================================================================
# SERVICE LOGIC
# =================================================================


async def create_service(
    db: Session, service_in: ServiceCreate, images: List[UploadFile]
) -> Service:
    """Tạo mới một dịch vụ và tải hình ảnh lên Supabase."""
    # Kiểm tra sự tồn tại của category
    get_category_by_id(db, service_in.category_id)

    # Kiểm tra trùng tên dịch vụ
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

    # Tạo đối tượng dịch vụ và lưu vào DB
    db_service = Service.model_validate(service_in)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)

    # Xử lý tải ảnh lên Supabase
    if images:
        is_first_image = True
        for image_file in images:
            if image_file.filename:  # Đảm bảo file có tên
                image_url = await supabase_client.upload_image(file=image_file)
                if image_url:
                    db_image = ServiceImage(
                        url=image_url,
                        alt_text=db_service.name,
                        service_id=db_service.id,
                        is_primary=is_first_image,  # Gán ảnh đầu tiên làm ảnh chính
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


def get_service_by_id(db: Session, service_id: uuid.UUID) -> Optional[Service]:
    """Lấy dịch vụ bằng ID, miễn là nó CHƯA BỊ XÓA."""
    service = db.exec(
        select(Service).where(Service.id == service_id, Service.is_deleted == False)
    ).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy dịch vụ với ID: {service_id}",
        )
    return service


def update_service(
    db: Session, db_service: Service, service_in: ServiceUpdate
) -> Service:
    """Cập nhật thông tin dịch vụ."""
    if service_in.category_id:
        get_category_by_id(db, service_in.category_id)
    service_data = service_in.model_dump(exclude_unset=True)
    for key, value in service_data.items():
        setattr(db_service, key, value)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


def delete_service(db: Session, db_service: Service) -> Service:
    """XÓA MỀM một dịch vụ."""
    # Thay vì xóa, chỉ cập nhật cờ is_deleted
    db_service.is_deleted = True
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service
