# app/api/users_api.py
from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

# Import các thành phần cần thiết
from app.core.dependencies import (
    get_current_admin_user,
    get_current_user,
    get_db_session,
)
from app.models.users_model import User
from app.schemas.users_schema import (
    AdminCreateUserRequest,
    UpdatePassword,
    UserPublicWithRolesAndPermissions,
    UserPublic,
    UserUpdateByAdmin,
    UserUpdateMe,
)
from app.services import auth_service, users_service

router = APIRouter()

# =================================================================
# ENDPOINTS CHO NGƯỜI DÙNG HIỆN TẠI (CURRENT USERS)
# =================================================================


@router.get("/me", response_model=UserPublicWithRolesAndPermissions)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Lấy thông tin của người dùng hiện tại đang đăng nhập.
    """
    return current_user


@router.put("/me", response_model=UserPublic)
def update_user_me(
    *,
    session: Session = Depends(get_db_session),
    user_in: UserUpdateMe,
    current_user: User = Depends(get_current_user),
):
    """
    Cập nhật thông tin cá nhân của người dùng.
    """
    user = users_service.update_user(
        db_session=session, db_user=current_user, user_in=user_in
    )
    return user


@router.post("/me/update-password", response_model=UserPublic)
def update_password_me(
    *,
    session: Session = Depends(get_db_session),
    body: UpdatePassword,
    current_user: User = Depends(get_current_user),
):
    """
    Cập nhật mật khẩu cho người dùng hiện tại.
    """
    user = auth_service.update_password(
        db_session=session,
        user=current_user,
        current_password=body.current_password,
        new_password=body.new_password,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu hiện tại không chính xác.",
        )
    return user


# =================================================================
# ENDPOINTS CHO QUẢN TRỊ VIÊN (ADMIN)
# =================================================================


@router.post(
    "/",
    response_model=UserPublic,
    dependencies=[Depends(get_current_admin_user)],
    status_code=status.HTTP_201_CREATED,
)
async def create_user_by_admin(
    *,
    session: Session = Depends(get_db_session),
    user_in: AdminCreateUserRequest,
):
    """
    [Admin] Tạo một tài khoản người dùng mới (ví dụ: nhân viên) và gửi email kích hoạt.
    """
    new_user = users_service.create_user_by_admin(db_session=session, user_in=user_in)
    # Gửi email chào mừng và yêu cầu đặt mật khẩu
    await auth_service.send_welcome_and_set_password_email(new_user)
    return new_user


@router.get(
    "/",
    response_model=List[UserPublicWithRolesAndPermissions],
    dependencies=[Depends(get_current_admin_user)],
)
def get_all_users(
    session: Session = Depends(get_db_session), skip: int = 0, limit: int = 100
):
    """
    [Admin] Lấy danh sách tất cả người dùng.
    """
    return users_service.get_all_users(db_session=session, skip=skip, limit=limit)


@router.get(
    "/{user_id}",
    response_model=UserPublicWithRolesAndPermissions,
    dependencies=[Depends(get_current_admin_user)],
)
def get_user_by_id(user_id: uuid.UUID, session: Session = Depends(get_db_session)):
    """
    [Admin] Lấy thông tin chi tiết của một người dùng bằng ID.
    """
    return users_service.get_user_by_id(db_session=session, user_id=user_id)


@router.put(
    "/{user_id}",
    response_model=UserPublic,
    dependencies=[Depends(get_current_admin_user)],
)
def update_user_by_admin(
    user_id: uuid.UUID,
    user_in: UserUpdateByAdmin,
    session: Session = Depends(get_db_session),
):
    """
    [Admin] Cập nhật thông tin người dùng.
    """
    db_user = users_service.get_user_by_id(db_session=session, user_id=user_id)
    return users_service.update_user_by_admin(
        db_session=session, db_user=db_user, user_in=user_in
    )


@router.delete(
    "/{user_id}",
    response_model=UserPublic,
    dependencies=[Depends(get_current_admin_user)],
)
def delete_user(
    user_id: uuid.UUID,
    session: Session = Depends(get_db_session),
):
    """
    [Admin] Xóa mềm một người dùng.
    """
    user_to_delete = users_service.get_user_by_id(db_session=session, user_id=user_id)
    return users_service.delete_user_by_id(
        db_session=session, user_to_delete=user_to_delete
    )
