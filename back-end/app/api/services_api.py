# app/api/services_api.py
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlmodel import Session

from app.core.dependencies import get_db_session
from app.models.services_model import Service
from app.schemas.services_schema import (
    ServiceCreate,
    ServicePublic,
    ServicePublicWithDetails,
    ServiceUpdate,
)
from app.services.services_service import services_service

router = APIRouter()


@router.post(
    "",
    response_model=ServicePublicWithDetails,
    status_code=status.HTTP_201_CREATED,
)
async def create_new_service(
    *,
    session: Session = Depends(get_db_session),
    # THAY ĐỔI: Nhận toàn bộ dữ liệu từ JSON body
    service_in: ServiceCreate,
):
    """
    Tạo một dịch vụ mới.
    """
    return await services_service.create(
        db=session, service_in=service_in
    ) @ router.put("/{service_id}", response_model=ServicePublicWithDetails)


@router.put("/{service_id}", response_model=ServicePublicWithDetails)
async def update_service(
    *,
    service_id: uuid.UUID,
    session: Session = Depends(get_db_session),
    # THAY ĐỔI: Nhận toàn bộ dữ liệu từ JSON body
    service_in: ServiceUpdate,
):
    """Cập nhật thông tin một dịch vụ."""
    db_service = services_service.get_by_id(db=session, id=service_id)
    return await services_service.update(
        db=session, db_obj=db_service, obj_in=service_in
    )


@router.get("", response_model=List[ServicePublicWithDetails])
def get_all_services(
    session: Session = Depends(get_db_session), skip: int = 0, limit: int = 100
):
    """Lấy danh sách tất cả dịch vụ."""
    return services_service.get_all(db=session, skip=skip, limit=limit)


@router.get("/{service_id}", response_model=ServicePublicWithDetails)
def get_service_by_id(
    service_id: uuid.UUID, session: Session = Depends(get_db_session)
):
    """Lấy thông tin chi tiết một dịch vụ bằng ID."""
    service = services_service.get_by_id(db=session, id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Không tìm thấy dịch vụ")
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: uuid.UUID, session: Session = Depends(get_db_session)):
    """Xóa mềm một dịch vụ."""
    db_service = services_service.get_by_id(db=session, id=service_id)
    services_service.delete(db=session, db_obj=db_service)
    return
