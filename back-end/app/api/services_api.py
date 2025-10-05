# app/api/services_api.py
import uuid
from typing import List
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File, status
from sqlmodel import Session

from app.core.dependencies import get_db_session
from app.models.services_model import Service
from app.schemas.services_schema import (
    ServiceCreate,
    ServicePublic,
    ServicePublicWithDetails,
    ServiceUpdate,
)
from app.services import services_service

router = APIRouter()


@router.post(
    "",
    response_model=ServicePublicWithDetails,
    status_code=status.HTTP_201_CREATED,
)
async def create_new_service(
    *,
    session: Session = Depends(get_db_session),
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    duration_minutes: int = Form(...),
    # THAY ĐỔI: Nhận danh sách ID dưới dạng Form
    category_ids: List[uuid.UUID] = Form(...),
    preparation_notes: str = Form(None),
    aftercare_instructions: str = Form(None),
    contraindications: str = Form(None),
    images: List[UploadFile] = File(
        [], description="Hình ảnh cho dịch vụ"
    ),  # Sửa thành [] để cho phép không có ảnh
):
    """
    Tạo một dịch vụ mới, bao gồm cả việc tải lên hình ảnh.
    """
    service_in = ServiceCreate(
        name=name,
        description=description,
        price=price,
        duration_minutes=duration_minutes,
        category_ids=category_ids,
        preparation_notes=preparation_notes,
        aftercare_instructions=aftercare_instructions,
        contraindications=contraindications,
    )
    return await services_service.create_service(
        db=session, service_in=service_in, images=images
    )


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


# ... (Các endpoint GET và DELETE không cần thay đổi)
@router.get("", response_model=List[ServicePublicWithDetails])
def get_all_services(
    session: Session = Depends(get_db_session), skip: int = 0, limit: int = 100
):
    """Lấy danh sách tất cả dịch vụ."""
    return services_service.get_all_services(db=session, skip=skip, limit=limit)


@router.get("/{service_id}", response_model=ServicePublicWithDetails)
def get_service_by_id(
    service_id: uuid.UUID, session: Session = Depends(get_db_session)
):
    """Lấy thông tin chi tiết một dịch vụ bằng ID."""
    service = services_service.get_service_by_id(db=session, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Không tìm thấy dịch vụ")
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: uuid.UUID, session: Session = Depends(get_db_session)):
    """Xóa mềm một dịch vụ."""
    db_service = services_service.get_service_by_id(db=session, service_id=service_id)
    services_service.delete_service(db=session, db_service=db_service)
    return
