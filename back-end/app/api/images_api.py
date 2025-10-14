# app/api/images_api.py
"""API quản lý hình ảnh được phân quyền."""

import uuid
from enum import Enum
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlmodel import Session

from app.core.dependencies import get_current_admin_user, get_current_user
from app.core.messages import RoleMessages
from app.models.users_model import User
from app.core.dependencies import get_db_session
from app.schemas.catalog_schema import ImagePublic
from app.services import images_service

router = APIRouter()


class ImageScope(str, Enum):
    CATALOG = "catalog"
    PERSONAL = "personal"


@router.post(
    "",
    response_model=ImagePublic,
    status_code=status.HTTP_201_CREATED,
    summary="Tải ảnh lên thư viện",
)
async def upload_image_to_library(
    *,
    session: Session = Depends(get_db_session),
    file: UploadFile = File(...),
    alt_text: str | None = Form(None),
    current_user: User = Depends(get_current_user),
):
    """
    Tải một hình ảnh mới lên hệ thống.

    - **Nhân viên/Admin:** Ảnh tải lên sẽ thuộc thư viện chung (catalog).
    - **Khách hàng:** Ảnh tải lên sẽ là ảnh cá nhân.
    """
    return await images_service.create_image(
        db=session,
        file=file,
        alt_text=alt_text,
        uploader=current_user,
    )


@router.get(
    "",
    response_model=List[ImagePublic],
    summary="Lấy danh sách hình ảnh theo phạm vi",
)
def list_images_from_library(
    *,
    session: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    scope: ImageScope = ImageScope.CATALOG,
):
    """
    Lấy danh sách hình ảnh dựa trên vai trò và phạm vi yêu cầu:

    - **scope=catalog**:
        - `Admin/Nhân viên`: Lấy danh sách ảnh trong thư viện chung để gán cho sản phẩm, dịch vụ...
        - `Khách hàng`: Sẽ nhận được lỗi 403 Forbidden.
    - **scope=personal**:
        - `Bất kỳ người dùng nào`: Lấy danh sách ảnh do chính người đó tải lên.
    """
    if scope == ImageScope.CATALOG:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=RoleMessages.INSUFFICIENT_PERMISSIONS,
            )
        return images_service.get_catalog_images(db=session)

    if scope == ImageScope.PERSONAL:
        return images_service.get_images_by_user(db=session, user=current_user)

    # Mặc định để tránh lỗi
    return []


@router.delete(
    "/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Xóa một hình ảnh",
)
def delete_image_from_library(
    *,
    session: Session = Depends(get_db_session),
    image_id: uuid.UUID,
    current_user: User = Depends(get_current_admin_user),  # Chỉ admin được xóa ảnh
):
    """
    Xóa mềm một hình ảnh khỏi thư viện (Yêu cầu quyền Admin).

    *Lưu ý: Logic này đảm bảo chỉ admin mới có thể xóa ảnh để tránh
    việc người dùng tự ý xóa ảnh đang được liên kết với sản phẩm/dịch vụ.*
    """
    db_image = images_service.get_image_by_id(db=session, image_id=image_id)
    # Tùy chọn: có thể thêm kiểm tra quyền sở hữu nếu muốn user tự xóa ảnh cá nhân
    # if db_image.uploaded_by_user_id != current_user.id and not current_user.is_admin:
    #     raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Không có quyền xóa ảnh này.")

    images_service.delete_image(db=session, db_image=db_image)
    return
