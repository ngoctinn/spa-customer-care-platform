# app/api/auth_api.py
from datetime import timedelta
from typing import Annotated, Optional, Dict, Any

from fastapi import APIRouter, Depends, Request, Response, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.core.dependencies import get_db_session
from app.core.config import settings
from app.core import security
from app.core.messages import AuthMessages
from app.schemas.users_schema import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserCreate,
    UserPublic,
)
from app.services import users_service, auth_service
from app.core.exceptions import AppException

router = APIRouter()


def _get_cookie_secure_flag() -> bool:
    """
    Trả về flag secure dùng khi set cookie; mặc định True nếu không có cấu hình.
    """
    return bool(getattr(settings, "COOKIE_SECURE", True))


def _set_auth_cookie(response: Response, token: str, expires_seconds: int) -> None:
    """
    Đặt cookie lưu access token theo chuẩn an toàn: httponly, samesite, secure tùy config.
    """
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        secure=_get_cookie_secure_flag(),
        samesite="lax",
        max_age=expires_seconds,
    )


def _error_slug_from_exception(exc: Exception) -> str:
    """
    Chuyển exception thành slug an toàn để redirect về front-end mà không leak thông tin nhạy cảm.
    Nếu exception có attribute 'code' sẽ dùng, ngược lại trả 'google_failed'.
    """
    if isinstance(exc, AppException):
        code = getattr(exc, "code", None)
        if code:
            # đảm bảo chỉ chứa ký tự an toàn (chỉ chữ thường, số và gạch dưới)
            return str(code).lower().replace(" ", "_")
    return "google_failed"


@router.post("/token")
def login_for_access_token(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db_session),
) -> Dict[str, Any]:
    """
    Đăng nhập bằng username/password (OAuth2PasswordRequestForm).
    Trả về message thành công và set cookie access_token (httponly).
    """
    user = auth_service.authenticate(
        db_session=db, email=form_data.username, password=form_data.password
    )

    if not user:
        # Trả lỗi rõ ràng nếu xác thực thất bại
        raise HTTPException(status_code=401, detail="Sai email hoặc mật khẩu")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    _set_auth_cookie(
        response=response,
        token=access_token,
        expires_seconds=int(access_token_expires.total_seconds()),
    )

    return {"message": AuthMessages.LOGIN_SUCCESS}


@router.post("/register", response_model=UserPublic, status_code=201)
async def register_user(
    *, db: Session = Depends(get_db_session), user_in: UserCreate
) -> UserPublic:
    """
    Khách hàng tự đăng ký tài khoản online chỉ bằng Email và Mật khẩu.
    Luồng này CHỈ TẠO TÀI KHOẢN (User), KHÔNG tự động tạo Hồ sơ khách hàng (Customer).
    """
    user = users_service.create_online_user(db=db, user_in=user_in)

    await auth_service.send_verification_email(user)
    return user


@router.get("/verify-email")
def verify_email(
    token: str, db: Session = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Xác thực email qua token.
    """
    return auth_service.verify_email(db_session=db, token=token)


@router.get("/login/google")
async def login_google(request: Request):
    """
    Bắt đầu OAuth Google (redirect tới provider).
    """
    redirect_uri = request.url_for("auth_google")
    return await auth_service.oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google")
async def auth_google(
    request: Request, response: Response, db: Session = Depends(get_db_session)
):
    """
    Callback Google OAuth.
    Nếu đăng nhập/đăng ký thành công sẽ set cookie và redirect về dashboard.
    Trường hợp lỗi sẽ redirect về trang login với mã lỗi ngắn (slug).
    """
    try:
        user = await auth_service.handle_google_login_or_register(
            request=request, db_session=db
        )

        if not user:
            error_url = f"{settings.FRONTEND_URL}/auth/login?error=google_failed"
            return RedirectResponse(url=error_url)

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )

        _set_auth_cookie(
            response=response,
            token=access_token,
            expires_seconds=int(access_token_expires.total_seconds()),
        )

        success_url = f"{settings.FRONTEND_URL}/dashboard"
        # Không truyền response.headers để tránh leak header không cần thiết
        return RedirectResponse(url=success_url)

    except Exception as e:
        # Chuyển exception sang slug an toàn, không leak chi tiết
        slug = _error_slug_from_exception(e)
        error_url = f"{settings.FRONTEND_URL}/auth/login?error={slug}"
        return RedirectResponse(url=error_url)


@router.post("/forgot-password")
async def forgot_password(
    *, db: Session = Depends(get_db_session), body: ForgotPasswordRequest
) -> Dict[str, Any]:
    """
    Yêu cầu reset mật khẩu: gửi email chứa token nếu user tồn tại.
    """
    user = users_service.get_user_by_email(db=db, email=body.email)
    if user:
        await auth_service.send_password_reset_email(user)
    return {"message": AuthMessages.PASSWORD_RESET_EMAIL_SENT}


@router.post("/reset-password")
def reset_password(
    *, db: Session = Depends(get_db_session), body: ResetPasswordRequest
) -> Dict[str, Any]:
    """
    Reset mật khẩu bằng token.
    """
    return auth_service.reset_password(
        db_session=db, token=body.token, new_password=body.new_password
    )


@router.post("/logout")
def logout(response: Response) -> Dict[str, Any]:
    """
    Logout: xóa cookie access_token.
    """
    response.delete_cookie(key="access_token")
    return {"message": AuthMessages.LOGOUT_SUCCESS}
