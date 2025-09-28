# app/core/dependencies.py
import email
from functools import lru_cache
from typing import Set
import uuid
from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from sqlmodel import Session

from app.core.config import settings
from app.models.users_model import Role, User
from app.services import roles_service, users_service
from app.schemas.token_schema import TokenData
from app.core.database import engine

from fastapi.security import OAuth2PasswordBearer

# Dòng này khai báo cho FastAPI biết URL để lấy token là gì
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_db_session():
    with Session(engine) as session:
        yield session


def get_current_user(
    session: Session = Depends(get_db_session), token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception

        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = users_service.get_user_by_id(db_session=session, user_id=user_id)

    if user is None:
        raise credentials_exception
    return user


# --- DEPENDENCY KIỂM TRA QUYỀN ---
def get_user_permissions(user: User) -> Set[str]:
    """
    Lấy tất cả tên quyền của một người dùng từ các vai trò của họ.
    Sử dụng lru_cache để cache kết quả cho mỗi user, tăng hiệu năng.
    """
    permissions = set()
    for role in user.roles:
        for permission in role.permissions:
            permissions.add(permission.name)
    return permissions


def has_permission(required_permission: str):
    """
    Đây là một dependency factory.
    Nó trả về một dependency function kiểm tra xem người dùng hiện tại
    có quyền được yêu cầu hay không.
    """

    def permission_checker(current_user: User = Depends(get_current_user)) -> None:
        user_permissions = get_user_permissions(current_user)
        if (
            required_permission not in user_permissions
            and not current_user.is_superuser
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không có quyền truy cập.",
            )

    return permission_checker


def get_role_by_id_from_path(
    role_id: uuid.UUID, session: Session = Depends(get_db_session)
) -> Role:
    """
    Dependency để lấy Role từ path parameter và kiểm tra sự tồn tại.
    """
    role = roles_service.get_role_by_id(db_session=session, role_id=role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vai trò không tồn tại"
        )
    return role
