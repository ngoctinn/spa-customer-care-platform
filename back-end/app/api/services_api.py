# back-end/app/api/services_api.py
import uuid
from typing import List
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File, status
from sqlmodel import Session

from app.core.dependencies import get_db_session
from app.models.services_model import Service, ServiceCategory
from app.schemas.services_schema import (
    ServiceCreate,
    ServicePublic,
    ServicePublicWithDetails,
    ServiceUpdate,
    ServiceCategoryCreate,
    ServiceCategoryPublic,
    ServiceCategoryUpdate,
    ServiceCategoryPublicWithServices,
)
from app.services import services_service

router = APIRouter()

# =================================================================
# ENDPOINTS CHO DANH MỤC DỊCH VỤ (SERVICE CATEGORY)
# =================================================================


@router.post(
    "/categories",
    response_model=ServiceCategoryPublic,
    status_code=status.HTTP_201_CREATED,
)
def create_service_category(
    *,
    session: Session = Depends(get_db_session),
    category_in: ServiceCategoryCreate,
):
    """Tạo một danh mục dịch vụ mới."""
    return services_service.create_service_category(db=session, category_in=category_in)


@router.get("/categories", response_model=List[ServiceCategoryPublicWithServices])
def get_all_service_categories(session: Session = Depends(get_db_session)):
    """Lấy danh sách tất cả danh mục và các dịch vụ thuộc về chúng."""
    return services_service.get_all_service_categories(db=session)


@router.get(
    "/categories/{category_id}", response_model=ServiceCategoryPublicWithServices
)
def get_service_category_by_id(
    category_id: uuid.UUID, session: Session = Depends(get_db_session)
):
    """Lấy thông tin chi tiết một danh mục bằng ID."""
    return services_service.get_category_by_id(db=session, category_id=category_id)


@router.put("/categories/{category_id}", response_model=ServiceCategoryPublic)
def update_service_category(
    category_id: uuid.UUID,
    category_in: ServiceCategoryUpdate,
    session: Session = Depends(get_db_session),
):
    """Cập nhật thông tin một danh mục dịch vụ."""
    db_category = services_service.get_category_by_id(
        db=session, category_id=category_id
    )
    return services_service.update_service_category(
        db=session, db_category=db_category, category_in=category_in
    )


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_category(
    category_id: uuid.UUID, session: Session = Depends(get_db_session)
):
    """Xóa mềm một danh mục dịch vụ."""
    db_category = services_service.get_category_by_id(
        db=session, category_id=category_id
    )
    services_service.delete_service_category(db=session, db_category=db_category)
    return


# =================================================================
# ENDPOINTS CHO DỊCH VỤ (SERVICE)
# =================================================================


@router.post(
    "/",
    response_model=ServicePublicWithDetails,
    status_code=status.HTTP_201_CREATED,
)
async def create_new_service(
    *,
    session: Session = Depends(get_db_session),
    # Sử dụng Form(...) để nhận dữ liệu form-data
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    duration_minutes: int = Form(...),
    category_id: uuid.UUID = Form(...),
    preparation_notes: str = Form(None),
    aftercare_instructions: str = Form(None),
    contraindications: str = Form(None),
    # Nhận danh sách file tải lên
    images: List[UploadFile] = File(None, description="Hình ảnh cho dịch vụ"),
):
    """
    Tạo một dịch vụ mới, bao gồm cả việc tải lên hình ảnh.
    """
    service_in = ServiceCreate(
        name=name,
        description=description,
        price=price,
        duration_minutes=duration_minutes,
        category_id=category_id,
        preparation_notes=preparation_notes,
        aftercare_instructions=aftercare_instructions,
        contraindications=contraindications,
    )
    return await services_service.create_service(
        db=session, service_in=service_in, images=images
    )


@router.get("/services", response_model=List[ServicePublicWithDetails])
def get_all_services(
    session: Session = Depends(get_db_session), skip: int = 0, limit: int = 100
):
    """Lấy danh sách tất cả dịch vụ."""
    return services_service.get_all_services(db=session, skip=skip, limit=limit)


@router.get("/services/{service_id}", response_model=ServicePublicWithDetails)
def get_service_by_id(
    service_id: uuid.UUID, session: Session = Depends(get_db_session)
):
    """Lấy thông tin chi tiết một dịch vụ bằng ID."""
    service = services_service.get_service_by_id(db=session, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Không tìm thấy dịch vụ")
    return service


@router.put("/{service_id}", response_model=ServicePublicWithDetails)
def update_service(
    service_id: uuid.UUID,
    service_in: ServiceUpdate,
    session: Session = Depends(get_db_session),
):
    """Cập nhật thông tin một dịch vụ."""
    db_service = services_service.get_service_by_id(db=session, service_id=service_id)
    return services_service.update_service(
        db=session, db_service=db_service, service_in=service_in
    )


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: uuid.UUID, session: Session = Depends(get_db_session)):
    """Xóa mềm một dịch vụ."""
    db_service = services_service.get_service_by_id(db=session, service_id=service_id)
    services_service.delete_service(db=session, db_service=db_service)
    return
