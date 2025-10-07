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
async def upload_image_to_library(
    *,
    session: Session = Depends(get_db_session),
    file: UploadFile = File(...),
    alt_text: str | None = Form(None),
):
    """Tải ảnh lên kho lưu trữ và lưu metadata."""

    return await images_service.create_image_to_library(
        db=session,
        file=file,
        alt_text=alt_text,
    )


@router.get("", response_model=List[ImagePublic])
def list_images_from_library(*, session: Session = Depends(get_db_session)):
    """Lấy danh sách tất cả hình ảnh có trong thư viện."""
    return images_service.get_all_images(db=session)


@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image_from_library(
    *, session: Session = Depends(get_db_session), image_id: uuid.UUID
):
    """Xóa mềm một hình ảnh khỏi thư viện."""
    # Service sẽ xử lý việc tìm kiếm và báo lỗi nếu không thấy
    db_image = images_service.get_image_by_id(db=session, image_id=image_id)
    images_service.delete_image(db=session, db_image=db_image)
    return
