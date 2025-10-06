"""API quản lý hình ảnh dùng chung."""

import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlmodel import Session

from app.core.dependencies import get_db_session
from app.schemas.catalog_schema import ImagePublic
from app.services import images_service

router = APIRouter()


@router.post("", response_model=ImagePublic, status_code=status.HTTP_201_CREATED)
async def upload_image(
    *,
    session: Session = Depends(get_db_session),
    file: UploadFile = File(...),
    alt_text: Optional[str] = Form(None),
    product_ids: Optional[List[uuid.UUID]] = Form(None),
    service_ids: Optional[List[uuid.UUID]] = Form(None),
    treatment_plan_ids: Optional[List[uuid.UUID]] = Form(None),
):
    """Tải ảnh lên kho lưu trữ và lưu metadata."""

    return await images_service.create_image(
        db=session,
        file=file,
        alt_text=alt_text,
        product_ids=product_ids or [],
        service_ids=service_ids or [],
        treatment_plan_ids=treatment_plan_ids or [],
    )


@router.get("", response_model=List[ImagePublic])
def list_images(
    *,
    session: Session = Depends(get_db_session),
    product_id: Optional[uuid.UUID] = None,
    service_id: Optional[uuid.UUID] = None,
    treatment_plan_id: Optional[uuid.UUID] = None,
):
    """Trả về danh sách hình ảnh, hỗ trợ lọc theo đối tượng sở hữu."""

    return images_service.list_images(
        db=session,
        product_id=product_id,
        service_id=service_id,
        treatment_plan_id=treatment_plan_id,
    )
