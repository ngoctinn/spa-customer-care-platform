# app/services/auth_service.py

from typing import Annotated, Optional
from fastapi.params import Depends
from sqlmodel import Session
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
from authlib.integrations.starlette_client import OAuth

from app.core.mailing import send_email
from app.core.security import get_password_hash, verify_password
from app.models.users_model import User
from app.services import users_service
from app.core.config import settings

# Cấu hình cho việc tạo token xác thực email
email_verification_serializer = URLSafeTimedSerializer(settings.SECRET_KEY)

# Cấu hình OAuth cho Google
oauth = OAuth()
oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


def authenticate(db_session: Session, *, email: str, password: str) -> Optional[User]:
    """
    Xác thực người dùng. Trả về đối tượng User nếu hợp lệ, ngược lại trả về None.
    """
    # Bước 1: Tìm người dùng bằng email
    user = users_service.get_user_by_email(db_session, email=email)

    # Bước 2: Kiểm tra sự tồn tại và trạng thái của user
    if not user or not user.is_active:
        return None

    # Bước 3: Kiểm tra mật khẩu
    if not verify_password(password, user.hashed_password):
        return None

    # Nếu tất cả đều hợp lệ, trả về user
    return user


async def send_verification_email(user: User):
    """
    Tạo token và gửi email xác thực.
    """
    token = email_verification_serializer.dumps(str(user.id), salt="email-confirm-salt")
    verification_link = f"http://localhost:8000/auth/verify-email?token={token}"

    body = f"""
    <p>Chào {user.full_name},</p>
    <p>Cảm ơn bạn đã đăng ký. Vui lòng nhấp vào liên kết bên dưới để xác thực email của bạn:</p>
    <p><a href="{verification_link}">Xác thực Email</a></p>
    <p>Nếu bạn không đăng ký, vui lòng bỏ qua email này.</p>
    """

    await send_email(
        subject="Xác thực email của bạn", recipients=[user.email], body=body
    )


def verify_email_token(token: str) -> Optional[str]:
    """
    Giải mã token xác thực email. Trả về user_id nếu hợp lệ.
    """
    try:
        user_id = email_verification_serializer.loads(
            token,
            salt="email-confirm-salt",
            max_age=3600,  # Token có hiệu lực trong 1 giờ
        )
        return user_id
    except (SignatureExpired, BadTimeSignature):
        return None


def mark_email_as_verified(db_session: Session, user: User) -> User:
    """
    Đánh dấu email của người dùng là đã xác thực.
    """
    if not user.is_email_verified:
        user.is_email_verified = True
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user


def update_password(
    db_session: Session, *, user: User, current_password: str, new_password: str
) -> User:
    """
    Xác thực mật khẩu cũ và cập nhật mật khẩu mới.
    """
    # 1. Kiểm tra mật khẩu hiện tại có đúng không
    if not verify_password(current_password, user.hashed_password):
        return None  # Trả về None nếu mật khẩu cũ sai

    # 2. Băm và cập nhật mật khẩu mới
    new_hashed_password = get_password_hash(new_password)
    user.hashed_password = new_hashed_password

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    return user
