# app/api/users_api.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

# Import các thành phần cần thiết
from app.core.dependencies import get_current_user, get_db_session
from app.models.users_model import User
from app.schemas.users_schema import (
    UpdatePassword,
    UserPublicWithRolesAndPermissions,
    UserPublic,
    UserUpdateMe,
)
from app.services import auth_service, users_service

router = APIRouter()


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
