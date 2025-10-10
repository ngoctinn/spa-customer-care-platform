# app/core/dependencies.py
import email
from functools import lru_cache
from typing import Set
import uuid
from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt
from sqlmodel import Session

from app.core.config import settings
from app.models.users_model import Role, User
from app.services import roles_service, users_service
from app.core.database import engine

from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_db_session():
    with Session(engine) as session:
        yield session


def get_token_from_cookie(request: Request) -> str | None:
    token = request.cookies.get("access_token")
    if not token:
        return None
    return token


def get_current_user(
    db: Session = Depends(get_db_session), token: str = Depends(get_token_from_cookie)
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Chưa đăng nhập",
            headers={"WWW-Authenticate": "Bearer"},
        )

    scheme, _, param = token.partition(" ")
    if scheme.lower() != "bearer" or not param:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai định dạng token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token không hợp lệ hoặc đã hết hạn",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            param, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = users_service.get_user_by_id(db_session=db, user_id=user_id)
    if user is None:
        raise credentials_exception
    return user


def get_user_permissions(user: User) -> Set[str]:
    permissions = set()
    for role in user.roles:
        for permission in role.permissions:
            permissions.add(permission.name)
    return permissions


def has_permission(required_permission: str):
    def permission_checker(current_user: User = Depends(get_current_user)) -> None:
        user_permissions = get_user_permissions(current_user)
        if required_permission not in user_permissions and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không đủ quyền truy cập.",
            )

    return permission_checker


def get_role_by_id_from_path(
    role_id: uuid.UUID, session: Session = Depends(get_db_session)
) -> Role:
    role = roles_service.get_role_by_id(db_session=session, role_id=role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vai trò không tồn tại"
        )
    return role


def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Yêu cầu quyền quản trị viên.",
        )
    return current_user
