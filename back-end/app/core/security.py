# app/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Cấu hình hashing mật khẩu
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Xác minh mật khẩu thuần so với hash lưu trong DB."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Băm mật khẩu mới bằng bcrypt."""
    return pwd_context.hash(password)


def create_access_token(
    data: Dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """Tạo JWT access token.

    Nếu không truyền expires_delta, dùng cấu hình `ACCESS_TOKEN_EXPIRE_MINUTES` từ settings.
    """
    to_encode = data.copy()
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any] | None:
    """Giải mã JWT và trả payload nếu hợp lệ, ngược lại trả None."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None
