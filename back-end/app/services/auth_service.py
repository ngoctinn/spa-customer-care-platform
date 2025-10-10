# app/services/auth_service.py

import token
from typing import Optional
import uuid
from fastapi import HTTPException, Depends, Request, status
from sqlmodel import Session
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
from app.core.dependencies import get_db_session
from authlib.integrations.starlette_client import OAuth

from app.core.mailing import send_email
from app.core.security import get_password_hash, verify_password
from app.models.users_model import User
from app.services import users_service, customers_service
from app.core.config import settings

from app.schemas.customers_schema import CustomerCreate
from app.schemas.users_schema import UserCreate

email_verification_serializer = URLSafeTimedSerializer(
    settings.SECRET_KEY, salt="email-confirm-salt"
)
password_reset_serializer = URLSafeTimedSerializer(
    settings.SECRET_KEY, salt="password-reset-salt"
)


oauth = OAuth()
oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


async def handle_google_login_or_register(
    request: Request, db_session: Session
) -> User:
    """
    Xử lý toàn bộ luồng OAuth2 của Google.
    1. Lấy access token từ Google.
    2. Lấy thông tin người dùng.
    3. Kiểm tra nếu người dùng đã tồn tại trong hệ thống.
    4. Nếu chưa, tạo mới CustomerProfile và User, sau đó liên kết chúng.
    5. Tự động xác thực email.
    6. Trả về đối tượng User cuối cùng.
    """
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        # Lỗi ở đây là lỗi hệ thống hoặc cấu hình, nên raise lỗi 500 hoặc 401
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Không thể lấy token từ Google: {e}",
        )

    user_info = token.get("userinfo")
    if not user_info or not user_info.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể lấy thông tin người dùng từ Google",
        )

    email = user_info["email"]
    user = users_service.get_user_by_email(db_session=db_session, email=email)

    if user:
        # Nếu user đã tồn tại, chỉ cần trả về user đó
        return user

    # --- Nếu user chưa tồn tại, thực hiện luồng đăng ký ---

    # 1. Tạo CustomerProfile (với SĐT tạm thời)
    customer_profile = customers_service.get_or_create_customer(
        db=db_session,
        customer_in=CustomerCreate(
            phone_number=f"google_{uuid.uuid4().hex[:10]}",
            full_name=user_info.get("name"),
            email=email,
        ),
    )

    # 2. Tạo dữ liệu cho tài khoản User
    new_user_data = UserCreate(
        email=email,
        password=f"google_oauth_{uuid.uuid4()}",  # Mật khẩu ngẫu nhiên
    )

    # 3. Tạo User và liên kết với CustomerProfile
    new_user = users_service.register_customer_account(
        db_session=db_session, user_in=new_user_data, customer=customer_profile
    )

    # 4. Tự động xác thực email
    verified_user = mark_email_as_verified(db_session=db_session, user=new_user)

    return verified_user


def authenticate(db_session: Session, *, email: str, password: str) -> Optional[User]:
    """
    Xác thực người dùng bằng email và mật khẩu.
    """
    user = users_service.get_user_by_email(db_session, email=email)
    if not user or not user.is_active:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def send_verification_email(user: User):
    """
    Gửi email xác thực tài khoản.
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


async def send_welcome_and_set_password_email(user: User):
    """
    Gửi email chào mừng kèm liên kết đặt mật khẩu.
    """
    token = password_reset_serializer.dumps(str(user.id))
    set_password_link = f"http://localhost:3000/auth/reset-password?token={token}"

    body = f"""
    <p>Chào {user.full_name},</p>
    <p>Một tài khoản đã được tạo cho bạn trên hệ thống của chúng tôi. Vui lòng nhấp vào liên kết bên dưới để đặt mật khẩu và kích hoạt tài khoản:</p>
    <p><a href="{set_password_link}">Đặt mật khẩu và Kích hoạt</a></p>
    <p>Liên kết này sẽ có hiệu lực trong 7 ngày.</p>
    <p>Nếu bạn không mong muốn điều này, vui lòng bỏ qua email này.</p>
    """

    await send_email(
        subject="Kích hoạt tài khoản của bạn",
        recipients=[user.email],
        body=body,
    )


def verify_email_token(token: str) -> Optional[str]:
    """
    Giải mã token xác thực email.
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


async def send_password_reset_email(user: User):
    """
    Gửi email reset mật khẩu.
    """
    # Token có hiệu lực trong 15 phút (900 giây)
    token = password_reset_serializer.dumps(str(user.id))
    reset_link = f"http://localhost:3000/reset-password?token={token}"  # Link đến trang reset trên frontend của bạn

    body = f"""
    <p>Chào {user.full_name},</p>
    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấp vào liên kết bên dưới để tiếp tục:</p>
    <p><a href="{reset_link}">Đặt lại mật khẩu</a></p>
    <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
    """

    await send_email(
        subject="Yêu cầu đặt lại mật khẩu", recipients=[user.email], body=body
    )


def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Giải mã token reset mật khẩu. Trả về user_id nếu hợp lệ.
    """
    try:
        # max_age = 900 giây (15 phút)
        user_id = password_reset_serializer.loads(token, max_age=900)
        return user_id
    except (SignatureExpired, BadTimeSignature):
        return None


def reset_user_password(db_session: Session, *, user: User, new_password: str) -> User:
    """
    Đặt lại mật khẩu cho người dùng.
    """
    new_hashed_password = get_password_hash(new_password)
    user.hashed_password = new_hashed_password
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
