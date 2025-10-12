# app/api/auth_api.py
from datetime import timedelta
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status, Response
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.core.dependencies import get_db_session
from app.core.config import settings
from app.core import security
from app.schemas.users_schema import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserCreate,
    UserPublic,
)
from app.services import users_service, auth_service
from app.schemas.customers_schema import CustomerCreate
from app.services.customers_service import customers_service
from app.schemas.token_schema import Token


router = APIRouter()


@router.post("/token")
def login_for_access_token(
    response: Response,  # Thêm dòng này
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_db_session),
):
    """
    JWT token endpoint.

    Hàm này xử lý việc đăng nhập và trả về token JWT nếu thành công.
    Token sẽ được lưu trong httpOnly cookie.
    """
    user = auth_service.authenticate(
        db_session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai email hoặc mật khẩu.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email chưa được xác thực. Vui lòng kiểm tra hộp thư đến của bạn.",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Người dùng không hoạt động.",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    # Lưu token vào cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,  # httpOnly flag để bảo vệ cookie khỏi truy cập bởi JavaScript
        expires=access_token_expires.total_seconds(),  # Set thời gian hết hạn cho cookie
    )

    return {"message": "Login successful"}


@router.post(
    "/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED
)
async def register_user(
    *, session: Session = Depends(get_db_session), user_in: UserCreate
):
    """
    Khách hàng tự đăng ký tài khoản online chỉ bằng Email, Tên và Mật khẩu.
    """
    user = users_service.create_online_user(db_session=session, user_in=user_in)
    await auth_service.send_verification_email(user)
    return user


# --- Endpoint xác thực email (MỚI) ---
@router.get("/verify-email")
def verify_email(token: str, session: Session = Depends(get_db_session)):
    user_id = auth_service.verify_email_token(token)
    if not user_id:
        raise HTTPException(
            status_code=400, detail="Token không hợp lệ hoặc đã hết hạn"
        )

    user = users_service.get_user_by_id(db_session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    auth_service.mark_email_as_verified(db_session=session, user=user)
    return {"message": "Xác thực email thành công!"}


# --- Endpoint chuyển hướng đăng nhập Google (MỚI) ---
@router.get("/login/google")
async def login_google(request: Request):
    """
    Tạo URL và chuyển hướng người dùng đến trang xác thực của Google.
    """
    redirect_uri = request.url_for("auth_google")
    return await auth_service.oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google")
async def auth_google(
    request: Request, response: Response, session: Session = Depends(get_db_session)
):
    """
    Callback endpoint cho Google OAuth.
    Điều phối việc đăng nhập/đăng ký qua Google, tạo token và chuyển hướng về frontend.
    """
    try:
        user = await auth_service.handle_google_login_or_register(
            request=request, db_session=session
        )

        if not user:
            # Chuyển hướng về trang đăng nhập của frontend với thông báo lỗi
            error_url = f"{settings.FRONTEND_URL}/auth/login?error=google_failed"
            return RedirectResponse(url=error_url)

        # Tạo token và thiết lập cookie (như cũ)
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )

        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            expires=access_token_expires.total_seconds(),
            samesite="lax",  # Thêm để tăng cường bảo mật
        )

        # Chuyển hướng người dùng về trang chính sau khi đăng nhập thành công
        # Bạn có thể thay đổi "/dashboard" thành trang bạn muốn
        success_url = f"http://localhost:3000/dashboard"
        # Gắn response đã set cookie vào RedirectResponse
        return RedirectResponse(url=success_url, headers=response.headers)

    except HTTPException as e:
        # Nếu có lỗi cụ thể từ service, chuyển hướng về trang đăng nhập với lỗi đó
        error_detail = e.detail.replace(" ", "_").lower()
        error_url = f"http://localhost:3000/auth/login?error={error_detail}"
        return RedirectResponse(url=error_url)


# ==================================================================
# --- Endpoint cho reset mật khẩu  ---
# ==================================================================
@router.post("/forgot-password")
async def forgot_password(
    *, session: Session = Depends(get_db_session), body: ForgotPasswordRequest
):
    """
    Endpoint để yêu cầu reset mật khẩu.
    """
    user = users_service.get_user_by_email(db_session=session, email=body.email)

    # Kể cả khi không tìm thấy user, chúng ta vẫn trả về thông báo thành công
    # để tránh việc kẻ tấn công có thể dùng API này để dò email tồn tại trong hệ thống.
    if user:
        await auth_service.send_password_reset_email(user)

    return {
        "message": "Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một email hướng dẫn đặt lại mật khẩu."
    }


@router.post("/reset-password")
def reset_password(
    *, session: Session = Depends(get_db_session), body: ResetPasswordRequest
):
    """
    Endpoint để xác nhận và đặt lại mật khẩu mới.
    """
    user_id = auth_service.verify_password_reset_token(body.token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token không hợp lệ hoặc đã hết hạn.",
        )

    user = users_service.get_user_by_id(db_session=session, user_id=user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại hoặc không hoạt động.",
        )

    auth_service.reset_user_password(
        db_session=session, user=user, new_password=body.new_password
    )

    return {"message": "Mật khẩu đã được đặt lại thành công."}


@router.post("/logout")
def logout(response: Response):
    """
    Xóa access_token cookie để đăng xuất người dùng.
    """
    response.delete_cookie(key="access_token")
    return {"message": "Đăng xuất thành công"}
