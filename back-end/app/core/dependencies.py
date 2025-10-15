# app/core/dependencies.py
from typing import Set
import uuid
from fastapi import Depends, HTTPException, Request, status, Header
from jose import JWTError, jwt
from sqlmodel import Session

from app.core.config import settings
from app.core.messages import AuthMessages, RoleMessages
from app.models.users_model import Role, User
from app.services import roles_service, users_service
from app.core.database import engine

from fastapi.security import OAuth2PasswordBearer


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_db_session():
    with Session(engine) as session:
        yield session


def get_token_from_request(
    authorization: str | None = Header(default=None), request: Request = None
) -> str | None:
    """Lấy token theo thứ tự: Authorization header (Bearer) -> cookie 'access_token'.

    Trả về token thuần (không kèm 'Bearer ')."""
    # ưu tiên header Authorization: "Bearer <token>"
    if authorization:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() == "bearer" and token:
            return token

    # fallback: cookie chứa token thuần
    if request:
        token = request.cookies.get("access_token")
        if token:
            return token
    return None


def get_current_user(
    db: Session = Depends(get_db_session), token: str = Depends(get_token_from_request)
) -> User:
    """Lấy user hiện tại từ token JWT (tự động convert 'sub' sang UUID).

    Trả HTTP 401 khi token không hợp lệ hoặc user không tồn tại.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AuthMessages.NOT_AUTHENTICATED,
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=AuthMessages.INVALID_TOKEN,
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id_raw: str | None = payload.get("sub")
        if user_id_raw is None:
            raise credentials_exception
        try:
            user_id = uuid.UUID(str(user_id_raw))
        except Exception:
            # Không phải UUID hợp lệ
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = users_service.get_user_by_id(db=db, user_id=user_id)
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
                detail=RoleMessages.INSUFFICIENT_PERMISSIONS,
            )

    return permission_checker


def get_role_by_id_from_path(
    role_id: uuid.UUID, db: Session = Depends(get_db_session)
) -> Role:
    role = roles_service.get_role_by_id(db=db, role_id=role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=RoleMessages.ROLE_NOT_FOUND_SIMPLE,
        )
    return role


def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Yêu cầu quyền quản trị viên.",
        )
    return current_user
